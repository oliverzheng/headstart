import assert = require('assert');
import Attributes = require('../Attributes');
import StackedChildren = require('./StackedChildren');
import NodeAttribute = require('./NodeAttribute');
import Rules = require('../Rules');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');
import groupChildren = require('../patterns/groupChildren');
import getDirection = require('../patterns/getDirection');
import hasBoxContent = require('../patterns/hasBoxContent');

import util = require('../../../util');

// This indicates how logical children are aligned. There can be a max of
// five logical children. They can be any of near, center, far, or the two areas
// between the three, making up five positions.
class Alignment extends Attributes.BaseAttribute {
	isHoriz: boolean;

	near: c.Component;
	afterNear: c.Component;
	center: c.Component;
	afterCenter: c.Component;
	far: c.Component;

	isNearAggregated: boolean;
	isAfterNearAggregated: boolean;
	isCenterAggregated: boolean;
	isAfterCenterAggregated: boolean;
	isFarAggregated: boolean;

	constructor(
		isHoriz: boolean,
		near: c.Component, afterNear: c.Component, center: c.Component, afterCenter: c.Component, far: c.Component,
		isNearAggregated: boolean, isAfterNearAggregated: boolean, isCenterAggregated: boolean, isAfterCenterAggregated: boolean, isFarAggregated: boolean
	) {
		super();

		this.isHoriz = isHoriz;

		this.near = near;
		this.afterNear = afterNear;
		this.center = center;
		this.afterCenter = afterCenter;
		this.far = far;

		this.isNearAggregated = isNearAggregated;
		this.isAfterNearAggregated = isAfterNearAggregated;
		this.isCenterAggregated = isCenterAggregated;
		this.isAfterCenterAggregated = isAfterCenterAggregated;
		this.isFarAggregated = isFarAggregated;
	}

	static getFrom(component: c.Component, direction: sinf.Direction): Alignment {
		var attr: Attributes.BaseAttribute;
		if (direction === sinf.horiz) {
			attr = component.getAttr(Attributes.Type.HORIZONTAL_ALIGNMENT);
		} else {
			attr = component.getAttr(Attributes.Type.VERTICAL_ALIGNMENT);
		}
		return <Alignment>attr;
	}

	static getHorizFrom(component: c.Component): Alignment {
		return <Alignment>(component.getAttr(Attributes.Type.HORIZONTAL_ALIGNMENT));
	}

	static getVertFrom(component: c.Component): Alignment {
		return <Alignment>(component.getAttr(Attributes.Type.VERTICAL_ALIGNMENT));
	}

	getType() {
		return this.isHoriz ? Attributes.Type.HORIZONTAL_ALIGNMENT : Attributes.Type.VERTICAL_ALIGNMENT;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <Alignment>attribute;

		return (
			this.isHoriz === attr.isHoriz &&

			this.near === attr.near &&
			this.afterNear == attr.afterNear &&
			this.center == attr.center &&
			this.afterCenter == attr.afterCenter &&
			this.far == attr.far &&

			this.isNearAggregated === attr.isNearAggregated &&
			this.isAfterNearAggregated == attr.isAfterNearAggregated &&
			this.isCenterAggregated == attr.isCenterAggregated &&
			this.isAfterCenterAggregated == attr.isAfterCenterAggregated &&
			this.isFarAggregated == attr.isFarAggregated
		);
	}

	repr() {
		var children: Attributes.Repr[] = [];

		if (this.near) {
			var repr = this.near.repr();
			repr.title = (this.isHoriz ? 'Left' : 'Top') + ' ' + repr.title;
			if (this.isNearAggregated) {
				repr.title += ' (aggregated)';
			}
			children.push(repr);
		}

		if (this.afterNear) {
			var repr = this.afterNear.repr();
			repr.title = (this.isHoriz ? 'After Left' : 'After Top') + ' ' + repr.title;
			if (this.isAfterNearAggregated) {
				repr.title += ' (aggregated)';
			}
			children.push(repr);
		}

		if (this.center) {
			var repr = this.center.repr();
			repr.title = 'Center ' + repr.title;
			if (this.isCenterAggregated) {
				repr.title += ' (aggregated)';
			}
			children.push(repr);
		}

		if (this.afterCenter) {
			var repr = this.afterCenter.repr();
			repr.title = 'After Center ' + repr.title;
			if (this.isAfterCenterAggregated) {
				repr.title += ' (aggregated)';
			}
			children.push(repr);
		}

		if (this.far) {
			var repr = this.far.repr();
			repr.title = (this.isHoriz ? 'Right' : 'Bottom') + ' ' + repr.title;
			if (this.isFarAggregated) {
				repr.title += ' (aggregated)';
			}
			children.push(repr);
		}

		return {
			title: this.isHoriz ? 'Horizontal Alignment' : 'Vertical Alignment',
			children: children,
			ordered: true,
		};
	}

	managesChildren(): boolean {
		return true;
	}

	getComponentChildren() {
		return [
			this.near, this.afterNear, this.center, this.afterCenter, this.far
		].filter((component) => !!component);
	}

	getChildPosition(child: c.Component, unknownDefaultPx: number): Attributes.ChildPosition {
		// Same semantics for positioning. Maybe we should just subclass...
		return StackedChildren.prototype.getChildPosition.call(this, child, unknownDefaultPx);
	}

	getSimpleAlignment(): sinf.Alignment {
		if (this.afterNear || this.afterCenter) {
			return sinf.Alignment.NONE;
		}
		var simpleAlignments = [{
			flag: !!this.near,
			alignment: sinf.near,
		}, {
			flag: !!this.center,
			alignment: sinf.center,
		}, {
			flag: !!this.far,
			alignment: sinf.far,
		}].filter((obj) => obj.flag);
		if (simpleAlignments.length !== 1) {
			return sinf.Alignment.NONE;
		}

		return simpleAlignments[0].alignment;
	}

	static expandRule(component: c.Component): Rules.RuleResult[] {
		var direction = getDirection(component);
		assert(!!direction);

		var groups = groupChildren(component, (child) => {
			var boxAttr = child.boxAttr();
			if (!boxAttr) {
				return false;
			}
			var box = boxAttr.getBox();

			return sutil.lengthEquals(direction === sinf.horiz ? box.w : box.h, sinf.expand);
		});

		if (!groups || groups.length > 5 || groups.length <= 1) {
			// We can only handle when there are 2 expands, which is a max of
			// 5 groups (3 non expands with 2 expands interspersed)
			return;
		}

		var near: c.Component[];
		var afterNear: c.Component[];
		var center: c.Component[];
		var afterCenter: c.Component[];
		var far: c.Component[];

		var totalExpands = groups.filter((group) => group.matched).length;
		var expandsSeen = 0;
		groups.forEach((group) => {
			if (group.matched) {
				switch (expandsSeen) {
					case 0:
						afterNear = group.components;
						break;
					case 1:
						afterCenter = group.components;
						break;
					default:
						assert(false);
				}
				expandsSeen++;
			} else if (group.components.length > 0) {
				switch (expandsSeen) {
					case 0:
						near = group.components;
						break;
					case 1:
						if (totalExpands === 1) {
							far = group.components;
						} else if (totalExpands === 2) {
							center = group.components;
						}
						break;
					case 2:
						far = group.components;
						break;
					default:
						assert(false);
				}
			}
		});

		// Don't worry about near, that's the default anyway
		if (!afterNear && !center && !afterCenter && !far) {
			return;
		}
		var aggregates = [
			near, afterNear, center, afterCenter, far
		].map(
			(components) => (components && components.some(hasBoxContent)) ? components : null
		).map(
			StackedChildren.aggregate
		);
		var results = aggregates.filter((result) => !!result);

		var alignment = new Alignment(
			direction === sinf.horiz,
			aggregates[0] && aggregates[0].component,
			aggregates[1] && aggregates[1].component,
			aggregates[2] && aggregates[2].component,
			aggregates[3] && aggregates[3].component,
			aggregates[4] && aggregates[4].component,
			aggregates[0] && near && near.length > 1,
			aggregates[1] && afterNear && afterNear.length > 1,
			aggregates[2] && center && center.length > 1,
			aggregates[3] && afterCenter && afterCenter.length > 1,
			aggregates[4] && far && far.length > 1
		);
		results.push({
			component: component,
			attributes: [alignment],
			deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
		});

		if (alignment.center || alignment.far) {
			results.push({
				component: component,
				attributes: [new NodeAttribute],
			});
		}
		return results;
	}

	static leftAlignRule(component: c.Component): Rules.RuleResult[] {
		if (Alignment.isAggregateInAlignment(component))
			return;

		var direction = getDirection(component);
		if (direction !== sinf.horiz) {
			return;
		}
		var groups = groupChildren(component, (child) => {
			var boxAttr = child.boxAttr();
			if (!boxAttr) {
				return false;
			}
			var box = boxAttr.getBox();

			return sutil.lengthEquals(direction === sinf.horiz ? box.w : box.h, sinf.expand);
		});
		if (!groups || groups.length !== 1 || groups[0].matched) {
			return;
		}

		var stackedChildren = StackedChildren.getFrom(component);
		if (!stackedChildren)
			return;
		var children = stackedChildren.getComponentChildren();
		if (children.length <= 1)
			return;

		var aggregate = StackedChildren.aggregate(children);
		return [{
			component: component,
			attributes: [new Alignment(
				true,
				aggregate.component,
				null,
				null,
				null,
				null,
				true,
				false,
				false,
				false,
				false
			)],
			deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
		}, aggregate];
	}

	static isAggregateInAlignment(component: c.Component): boolean {
		var parent = component.getParent();
		if (!parent)
			return false;

		var alignment = Alignment.getHorizFrom(parent);
		if (alignment && (
			alignment.near === component ||
			alignment.afterNear === component ||
			alignment.center === component ||
			alignment.afterCenter === component ||
			alignment.far === component)) {
			return true;
		}

		var alignment = Alignment.getVertFrom(parent);
		if (alignment && (
			alignment.near === component ||
			alignment.afterNear === component ||
			alignment.center === component ||
			alignment.afterCenter === component ||
			alignment.far === component)) {
			return true;
		}

		return false;
	}

	static getAlignmentContainer(child: c.Component, direction: sinf.Direction): c.Component {
		var alignment = Alignment.getForChild(child, direction);
		return alignment ? alignment.component : null;
	}

	static getForChild(component: c.Component, direction: sinf.Direction): Alignment {
		do {
			component = component.getParent();
		} while (Alignment.isAggregateInAlignment(component));
		return Alignment.getFrom(component, direction);
	}
}

export = Alignment;

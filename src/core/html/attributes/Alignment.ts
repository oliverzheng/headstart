import assert = require('assert');
import Attributes = require('../Attributes');
import StackedChildren = require('./StackedChildren');
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

	constructor(
		isHoriz: boolean, near: c.Component, afterNear: c.Component, center: c.Component, afterCenter: c.Component, far: c.Component
	) {
		super();

		this.isHoriz = isHoriz;
		this.near = near;
		this.afterNear = afterNear;
		this.center = center;
		this.afterCenter = afterCenter;
		this.far = far;
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
			this.near === attr.near &&
			this.afterNear == attr.afterNear &&
			this.center == attr.center &&
			this.afterCenter == attr.afterCenter &&
			this.far == attr.far
		);
	}

	repr() {
		var children: Attributes.Repr[] = [];

		if (this.near) {
			var repr = this.near.repr();
			repr.title = (this.isHoriz ? 'Left' : 'Top') + ' ' + repr.title;
			children.push(repr);
		}

		if (this.afterNear) {
			var repr = this.afterNear.repr();
			repr.title = (this.isHoriz ? 'After Left' : 'After Top') + ' ' + repr.title;
			children.push(repr);
		}

		if (this.center) {
			var repr = this.center.repr();
			repr.title = 'Center ' + repr.title;
			children.push(repr);
		}

		if (this.afterCenter) {
			var repr = this.afterCenter.repr();
			repr.title = 'After Center ' + repr.title;
			children.push(repr);
		}

		if (this.far) {
			var repr = this.far.repr();
			repr.title = (this.isHoriz ? 'Right' : 'Bottom') + ' ' + repr.title;
			children.push(repr);
		}

		return {
			title: this.isHoriz ? 'Horizontal Alignment' : 'Vertical Alignment',
			children: children,
		};
	}

	getComponentChildren() {
		return [
			this.near, this.afterNear, this.center, this.afterCenter, this.far
		].filter((component) => !!component);
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

		if (!near && !afterNear && !center && !afterCenter && !far) {
			return;
		}
		var aggregates = [
			near, afterNear, center, afterCenter, far
		].map(Alignment.aggregate);
		var results = aggregates.filter((result) => !!result);

		results.push({
			component: component,
			attributes: [new Alignment(
				direction === sinf.horiz,
				aggregates[0] && aggregates[0].component,
				aggregates[1] && aggregates[1].component,
				aggregates[2] && aggregates[2].component,
				aggregates[3] && aggregates[3].component,
				aggregates[4] && aggregates[4].component
			)],
			deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
		});
		return results;
	}

	static aggregate(components: c.Component[]): Rules.RuleResult {
		if (!components || components.length === 0)
			return null;

		if (components.length === 1)
			return { component: components[0], attributes: [] };

		return {
			component: new c.Component,
			attributes: [new StackedChildren(components)],
		};
	}
}

export = Alignment;

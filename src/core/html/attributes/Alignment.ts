import assert = require('assert');
import Attributes = require('../Attributes');
import StackedChildren = require('./StackedChildren');
import NodeAttribute = require('./NodeAttribute');
import LengthAttribute = require('./LengthAttribute');
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

	wrapChild(child: c.Component): Rules.RuleResult[] {
		assert(this.getComponentChildren().indexOf(child) !== -1);

		var newComponent = new c.Component;
		var newAttr = new Alignment(
			this.isHoriz,
			this.near === child ? newComponent: this.near,
			this.afterNear === child ? newComponent : this.afterNear,
			this.center === child ? newComponent : this.center,
			this.afterCenter === child ? newComponent : this.afterCenter,
			this.far === child ? newComponent : this.far,
			this.isNearAggregated || this.near === child,
			this.isAfterNearAggregated || this.afterNear === child,
			this.isCenterAggregated || this.center === child,
			this.isAfterCenterAggregated || this.afterCenter === child,
			this.isFarAggregated || this.far === child
		);
		var results: Rules.RuleResult[] = [{
			component: this.component,
			replaceAttributes: [
				newAttr,
			],
		}, {
			component: newComponent,
			attributes: [
				new StackedChildren([child])
			],
		}];
		results.push.apply(results, LengthAttribute.resetPctForNewParent(child, newComponent));
		return results;
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

		var title = this.isHoriz ? 'Horizontal Alignment' : 'Vertical Alignment';
		title += ' (' + this.rulesToString() + ')';

		return {
			title: title,
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

	static isAggregateInAlignment(component: c.Component): boolean {
		if (component.getBox())
			return false;

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

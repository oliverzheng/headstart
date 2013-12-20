import assert = require('assert');
import Attributes = require('../Attributes');
import Children = require('./Children');
import Rules = require('../Rules');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');
import groupChildren = require('../patterns/groupChildren');
import getDirection = require('../patterns/getDirection');
import hasBoxContent = require('../patterns/hasBoxContent');

// This indicates how logical children are aligned. There can be a max of
// five logical children. They can be any of near, center, far, or the two areas
// between the three, making up five positions.
class Alignment extends Attributes.BaseAttribute {
	isHoriz: boolean;
	near: boolean;
	afterNear: boolean;
	center: boolean;
	afterCenter: boolean;
	far: boolean;

	constructor(
		isHoriz: boolean, near: boolean, afterNear: boolean, center: boolean, afterCenter: boolean, far: boolean
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

	static createAttributes(
		isHoriz: boolean, near: c.Component, afterNear: c.Component, center: c.Component, afterCenter: c.Component, far: c.Component
	): Attributes.BaseAttribute[] {
		var children: c.Component[] = [];
		if (near) children.push(near);
		if (afterNear) children.push(afterNear);
		if (center) children.push(center);
		if (afterCenter) children.push(afterCenter);
		if (far) children.push(far);

		// If they are all here, that means they are all connected.
		var isLayout = children.length === 5;

		return [
			new Children(children, isLayout),
			new Alignment(isHoriz, !!near, !!afterNear, !!center, !!afterCenter, !!far),
		];
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
			this.afterNear === attr.afterNear &&
			this.center === attr.center &&
			this.afterCenter === attr.afterCenter &&
			this.far === attr.far
		);
	}

	repr() {
		var alignments: string[] = [];
		var name: string;
		if (this.isHoriz) {
			name = 'Horizontal Alignment';
			if (this.near) alignments.push('left');
			if (this.afterNear) alignments.push('after-left');
			if (this.center) alignments.push('center');
			if (this.afterCenter) alignments.push('after-center');
			if (this.far) alignments.push('right');
		} else {
			name = 'Vertical Alignment';
			if (this.near) alignments.push('top');
			if (this.afterNear) alignments.push('after-top');
			if (this.center) alignments.push('center');
			if (this.afterCenter) alignments.push('after-center');
			if (this.far) alignments.push('bottom');
		}
		return {
			title: name + ': ' + alignments.join(', '),
		};
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

		var near: c.Component;
		var afterNear: c.Component;
		var center: c.Component;
		var afterCenter: c.Component;
		var far: c.Component;

		var totalExpands = groups.filter((group) => group.matched).length;
		var expandsSeen = 0;
		groups.forEach((group) => {
			if (group.matched) {
				switch (expandsSeen) {
					case 0:
						afterNear = c.Component.aggregate(group.components);
						break;
					case 1:
						afterCenter = c.Component.aggregate(group.components);
						break;
					default:
						assert(false);
				}
				expandsSeen++;
			} else if (group.components.length > 0) {
				switch (expandsSeen) {
					case 0:
						near = c.Component.aggregate(group.components);
						break;
					case 1:
						if (totalExpands === 1) {
							far = c.Component.aggregate(group.components);
						} else if (totalExpands === 2) {
							center = c.Component.aggregate(group.components);
						}
						break;
					case 2:
						far = c.Component.aggregate(group.components);
						break;
					default:
						assert(false);
				}
			}
		});

		if (near && !hasBoxContent(near)) near = null;
		if (afterNear && !hasBoxContent(afterNear)) afterNear = null;
		if (center && !hasBoxContent(center)) center = null;
		if (afterCenter && !hasBoxContent(afterCenter)) afterCenter = null;
		if (far && !hasBoxContent(far)) far = null;

		if (!near && !afterNear && !center && !afterCenter && !far) {
			return;
		}

		var attributes = Alignment.createAttributes(
			direction === sinf.horiz,
			near,
			afterNear,
			center,
			afterCenter,
			far
		);
		return [{
			component: component,
			attributes: attributes,
			deleteAttributes: [Attributes.Type.LAYOUT_CHILDREN],
		}];
	}
}

export = Alignment;

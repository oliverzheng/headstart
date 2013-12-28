import assert = require('assert');
import Attributes = require('../Attributes');
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
	near: c.Component[];
	afterNear: c.Component[];
	center: c.Component[];
	afterCenter: c.Component[];
	far: c.Component[];

	constructor(
		isHoriz: boolean, near: c.Component[], afterNear: c.Component[], center: c.Component[], afterCenter: c.Component[], far: c.Component[]
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
			util.arraysEqual(this.near, attr.near) &&
			util.arraysEqual(this.afterNear, attr.afterNear) &&
			util.arraysEqual(this.center, attr.center) &&
			util.arraysEqual(this.afterCenter, attr.afterCenter) &&
			util.arraysEqual(this.far, attr.far)
		);
	}

	repr() {
		var children: Attributes.Repr[] = [];

		if (this.near) {
			children.push({
				title: this.isHoriz ? 'Left' : 'Top',
				children: this.near.map((child) => child.repr())
			});
		}

		if (this.afterNear) {
			children.push({
				title: this.isHoriz ? 'After Left' : 'After Top',
				children: this.afterNear.map((child) => child.repr())
			});
		}

		if (this.center) {
			children.push({
				title: 'Center',
				children: this.center.map((child) => child.repr())
			});
		}

		if (this.afterCenter) {
			children.push({
				title: 'After Center',
				children: this.afterCenter.map((child) => child.repr())
			});
		}

		if (this.far) {
			children.push({
				title: this.isHoriz ? 'Right' : 'Bottom',
				children: this.far.map((child) => child.repr())
			});
		}

		return {
			title: this.isHoriz ? 'Horizontal Alignment' : 'Vertical Alignment',
			children: children,
		};
	}

	getComponentChildren() {
		var children: c.Component[] = [];
		if (this.near) children.push.apply(children, this.near);
		if (this.afterNear) children.push.apply(children, this.afterNear);
		if (this.center) children.push.apply(children, this.center);
		if (this.afterCenter) children.push.apply(children, this.afterCenter);
		if (this.far) children.push.apply(children, this.far);
		return children;
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

		if (near && near.some((comp) => !hasBoxContent(comp))) near = null;
		if (afterNear && afterNear.some((comp) => !hasBoxContent(comp))) afterNear = null;
		if (center && center.some((comp) => !hasBoxContent(comp))) center = null;
		if (afterCenter && afterCenter.some((comp) => !hasBoxContent(comp))) afterCenter = null;
		if (far && far.some((comp) => !hasBoxContent(comp))) far = null;

		if (!near && !afterNear && !center && !afterCenter && !far) {
			return;
		}

		return [{
			component: component,
			attributes: [new Alignment(
				direction === sinf.horiz,
				near,
				afterNear,
				center,
				afterCenter,
				far
			)],
			deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
		}];
	}
}

export = Alignment;

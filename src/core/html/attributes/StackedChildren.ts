import assert = require('assert');
import c = require('../Component');
import Attributes = require('../Attributes');
import Rules = require('../Rules');
import getDirection = require('../patterns/getDirection');
import Measurement = require('./Measurement');
import LengthAttribute = require('./LengthAttribute');
import sinf = require('../../spec/interfaces');

import util = require('../../../util');

class StackedChildren extends Attributes.BaseAttribute {
	children: c.Component[];

	constructor(children: c.Component[]) {
		super();
		this.children = children;
	}

	getType() {
		return Attributes.Type.STACKED_CHILDREN;
	}

	static getFrom(component: c.Component): StackedChildren {
		var children = <StackedChildren>(component.getAttr(Attributes.Type.STACKED_CHILDREN));
		return children;
	}

	isEmpty(): boolean {
		return this.children.length === 0;
	}

	get() {
		return this.children;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <StackedChildren>attribute;

		return util.arraysEqual(this.children, attr.children);
	}

	managesChildren(): boolean {
		return true;
	}

	getComponentChildren() {
		return this.children;
	}

	getChildPosition(child: c.Component, unknownDefaultPx: number, bottomRight: boolean = false): Attributes.ChildPosition {
		assert(this.getComponentChildren().indexOf(child) !== -1);

		var direction = getDirection(this.component);
		var position: Attributes.ChildPosition;
		if (!bottomRight) {
			position = {
				x: LengthAttribute.getHorizZeroPx(),
				y: LengthAttribute.getVertZeroPx(),
			};
		} else {
			position = {
				x: null,
				y: null,
			};
		}
		var children = this.getComponentChildren();
		if (bottomRight) {
			var totalLength = children.map(
				(child) => LengthAttribute.getFrom(child, direction)
			).reduce(LengthAttribute.add);
			var parentLength = LengthAttribute.getFrom(this.component, direction);
			var leftOver = LengthAttribute.subtractChild(parentLength, totalLength);
			if (leftOver) {
				if (direction === sinf.horiz) {
					position.x = leftOver;
				} else {
					position.y = leftOver;
				}
			}

			var parentLengthOther = LengthAttribute.getFrom(this.component, sinf.otherDirection(direction));
			var otherChildLength = LengthAttribute.getFrom(child, sinf.otherDirection(direction));
			var leftOverOther = LengthAttribute.subtractChild(parentLength, otherChildLength);
			if (leftOverOther) {
				if (direction === sinf.horiz) {
					position.y = leftOverOther;
				} else {
					position.x = leftOverOther;
				}
			}

			if (direction === sinf.horiz && !position.x ||
				direction === sinf.vert && !position.y) {
				return position;
			}

			children.reverse();
		}

		for (var i = 0; i < children.length; ++i) {
			var prevChild = children[i];
			if (prevChild === child) {
				break;
			}

			var length = LengthAttribute.getFrom(prevChild, direction);
			if (length && (length.px.isSet() || length.pct.isSet())) {
				// Awesome
			} else if (unknownDefaultPx != null) {
				length = new LengthAttribute(direction, Measurement.implicit(unknownDefaultPx));
			} else {
				if (direction == sinf.horiz) {
					position.x = null;
				} else {
					position.y = null;
				}
				return position;
			}
			if (direction === sinf.horiz) {
				position.x = position.x.add(length);
				if (!position.x) {
					return position;
				}
			} else {
				position.y = position.y.add(length);
				if (!position.y) {
					return position;
				}
			}
		}
		return position;
	}

	repr(): Attributes.Repr {
		return {
			title: 'Stacked Children',
			children: this.children.map((child) => child.repr()),
			ordered: true,
		};
	}

	wrapChildren(children: c.Component[]): Rules.RuleResult[] {
		assert(children.length > 0);

		var childrenIndices = children.map((child) => this.getComponentChildren().indexOf(child));
		assert(childrenIndices.every((childIndex) => childIndex !== -1));

		childrenIndices.sort((a, b) => a - b);
		childrenIndices.forEach((childIndex, i) => {
			if (i !== 0) {
				// Has to be a continuous block of children
				assert(childIndex === (childrenIndices[i - 1] + 1));
			}
		});

		var minChildIndex = childrenIndices[0];

		var newComponent = new c.Component;
		var newChildren: c.Component[] = [];
		var newGrandChildren: c.Component[] = [];
		this.children.forEach((child, i) => {
			if (i >= minChildIndex && i < (minChildIndex + children.length)) {
				if (i === minChildIndex) {
					newChildren.push(newComponent);
				}
				newGrandChildren.push(child);
			} else {
				newChildren.push(child);
			}
		});
		var results: Rules.RuleResult[] = [{
			component: this.component,
			replaceAttributes: [
				new StackedChildren(newChildren),
			],
		}, {
			component: newComponent,
			attributes: [
				new StackedChildren(newGrandChildren),
			],
		}];
		newGrandChildren.forEach((child) => {
			results.push.apply(results, LengthAttribute.resetPctForNewParent(child, newComponent));
		});
		return results;
	}

	static getNextSibling(component: c.Component): c.Component {
		var parent = component.getParent();
		if (!parent)
			return;

		var stackedChildren = StackedChildren.getFrom(parent);
		if (!stackedChildren)
			return;

		var children = stackedChildren.get();
		for (var i = 0; i < children.length - 1; ++i) {
			if (children[i] === component)
				return children[i + 1];
		}
		return null;
	}

	static getPrevSibling(component: c.Component): c.Component {
		var parent = component.getParent();
		if (!parent)
			return;

		var stackedChildren = StackedChildren.getFrom(parent);
		if (!stackedChildren)
			return;

		var children = stackedChildren.get();
		for (var i = 1; i < children.length; ++i) {
			if (children[i] === component)
				return children[i - 1];
		}
		return null;
	}

	static aggregate(components: c.Component[]): Rules.RuleResult[] {
		if (!components || components.length === 0)
			return null;

		if (components.length === 1)
			return [{component: components[0], attributes: []}];

		var results = components[0].getParent().getChildrenManager().wrapChildren(components);
		results.shift(); // drop parent;
		return results;
	}
}

export = StackedChildren;

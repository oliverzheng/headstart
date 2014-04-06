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

	getChildPosition(child: c.Component, unknownDefaultPx: number): Attributes.ChildPosition {
		assert(this.getComponentChildren().indexOf(child) !== -1);

		var direction = getDirection(this.component);
		var position: Attributes.ChildPosition = {
			x: LengthAttribute.getHorizZeroPx(),
			y: LengthAttribute.getVertZeroPx(),
		};
		for (var i = 0; i < this.getComponentChildren().length; ++i) {
			var prevChild = this.getComponentChildren()[i];
			if (prevChild === child) {
				break;
			}

			var length = LengthAttribute.getFrom(prevChild, direction);
			var px = 0;
			if (length && length.px.isSet()) {
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
			} else {
				position.y = position.y.add(length);
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

	wrapChild(child: c.Component): Rules.RuleResult[] {
		assert(this.getComponentChildren().indexOf(child) !== -1);

		var newComponent = new c.Component;
		var newAttr = new StackedChildren(this.children.map((oldChild) => {
			if (oldChild === child) {
				return newComponent;
			} else {
				return oldChild;
			}
		}));
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

	static aggregate(components: c.Component[]): Rules.RuleResult {
		return StackedChildren.forceAggregate(components, false);
	}

	static forceAggregate(components: c.Component[], forceAggregate: boolean): Rules.RuleResult {
		if (!components || components.length === 0)
			return null;

		if (components.length === 1 && !forceAggregate)
			return {component: components[0], attributes: []};

		return {
			component: new c.Component,
			attributes: [new StackedChildren(components)],
		};
	}
}

export = StackedChildren;

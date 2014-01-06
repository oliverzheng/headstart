import c = require('../Component');
import Attributes = require('../Attributes');
import Rules = require('../Rules');

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

	getComponentChildren() {
		return this.children;
	}

	repr(): Attributes.Repr {
		return {
			title: 'Stacked Children',
			children: this.children.map((child) => child.repr()),
		};
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

export = StackedChildren;

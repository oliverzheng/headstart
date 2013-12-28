import c = require('../Component');
import Attributes = require('../Attributes');

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
		return children || emptyChildren;
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
}

var emptyChildren = new StackedChildren([]);

export = StackedChildren;

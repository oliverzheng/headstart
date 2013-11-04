import Component = require('../Component');
import Attributes = require('../Attributes');

class ChildrenAttribute extends Attributes.BaseAttribute {
	private children: Component[];

	constructor(children: Component[]) {
		super();
		this.children = children;
	}

	getType() {
		return Attributes.Type.CHILDREN;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <ChildrenAttribute>attribute;

		return (
			this.children.length === attr.children.length &&
			this.children.every((child, i) => child === attr.children[i])
		);
	}

	getChildren(): Component[] {
		return this.children;
	}
}

export = ChildrenAttribute;
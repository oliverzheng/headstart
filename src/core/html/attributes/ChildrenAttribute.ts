import c = require('../Component');
import Attributes = require('../Attributes');

class ChildrenAttribute extends Attributes.BaseAttribute {
	private children: c.Component[];

	constructor(children: c.Component[]) {
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

	getChildren(): c.Component[] {
		return this.children;
	}

	breadthFirst(callback: (component: c.Component) => any) {
		var stopRecursion: any[] = this.children.map(callback);
		this.children.forEach((child, i) => {
			if (stopRecursion[i]) {
				return;
			}
			var childrenAttr = child.childrenAttr();
			if (childrenAttr) {
				childrenAttr.breadthFirst(callback);
			}
		});
	}

	repr(): Attributes.Repr {
		return {
			title: 'Children',
			children: this.children.map((child) => child.repr()),
		};
	}
}

export = ChildrenAttribute;

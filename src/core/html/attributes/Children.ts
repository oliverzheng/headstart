import c = require('../Component');
import Attributes = require('../Attributes');

class Children extends Attributes.BaseAttribute {
	static STOP_RECURSION = new Object();
	static STOP_ITERATION = new Object();

	isLayout: boolean;
	private children: c.Component[];

	constructor(children: c.Component[], isLayout: boolean = true) {
		super();
		this.children = children;
		this.isLayout = isLayout;
	}

	getType() {
		return (
			this.isLayout
			? Attributes.Type.LAYOUT_CHILDREN
			: Attributes.Type.LOGICAL_CHILDREN
		);
	}

	static getLayoutFrom(component: c.Component): Children {
		var children = <Children>(component.getAttr(Attributes.Type.LAYOUT_CHILDREN));
		return children || emptyLayoutChildren;
	}

	static getLogicalFrom(component: c.Component): Children {
		var children = <Children>(component.getAttr(Attributes.Type.LOGICAL_CHILDREN));
		if (!children) {
			children = Children.getLayoutFrom(component);
		}
		return children || emptyLogicalChildren;
	}

	static getFrom(component: c.Component, isLayout: boolean): Children {
		return isLayout ? Children.getLayoutFrom(component) : Children.getLogicalFrom(component);
	}

	isEmpty(): boolean {
		return this.children.length === 0;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <Children>attribute;

		return (
			this.isLayout === attr.isLayout &&
			this.children.length === attr.children.length &&
			this.children.every((child, i) => child === attr.children[i])
		);
	}

	getComponents(): c.Component[] {
		return this.children;
	}

	breadthFirst(callback: (component: c.Component) => any): any {
		var stopIteration = false;
		this.children.forEach((child, i) => {
			if (stopIteration) {
				return;
			}

			var result = callback(child);
			if (result === Children.STOP_ITERATION) {
				stopIteration = true;
			} else if (result === Children.STOP_RECURSION) {
			} else {
				Children.getFrom(child, this.isLayout).breadthFirst(callback);
			}
		});
	}

	repr(): Attributes.Repr {
		return {
			title: 'Children (' + (this.isLayout ? 'layout' : 'logical'),
			children: this.children.map((child) => child.repr()),
		};
	}
}

var emptyLayoutChildren = new Children([], true);
var emptyLogicalChildren = new Children([], false);

export = Children;

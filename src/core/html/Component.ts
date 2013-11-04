import Attributes = require('./Attributes');
import BoxAttribute = require('./attributes/BoxAttribute');
import NodeAttribute = require('./attributes/NodeAttribute');
import ChildrenAttribute = require('./attributes/ChildrenAttribute');
import sinf = require('../spec/interfaces');

class Component {
	attributes: Attributes.BaseAttribute[] = [];

	static fromBox(root: sinf.Box): Component {
		var component = new Component;
		component.addAttributes([new BoxAttribute(root)]);

		if (root.children) {
			var children = root.children.map((childBox) => {
				return Component.fromBox(childBox);
			});
			if (children.length > 0) {
				component.addAttributes([new ChildrenAttribute(children)]);
			}
		}
		return component;
	}

	getAttr(type: Attributes.Type): Attributes.BaseAttribute {
		for (var ii = 0; ii < this.attributes.length; ++ii) {
			var attr = this.attributes[ii];
			if (attr.getType() === type) {
				return attr;
			}
		}
		return null;
	}

	// Returns true if any rule was added because it was new or it replaced
	// another rule.
	addAttributes(attrs: Attributes.BaseAttribute[]): boolean {
		var added = false;
		attrs.forEach((attr) => {
			var existingAttr = this.getAttr(attr.getType());
			if (!existingAttr) {
				this.attributes.push(attr);
				added = true;
			} else if (!existingAttr.equals(attr)) {
				throw new Error('Cannot replace an existing attr!');
			}
		});
		return added;
	}

	// Specific attributes

	boxAttr(): BoxAttribute {
		return <BoxAttribute>this.getAttr(Attributes.Type.BOX);
	}

	nodeAttr(): NodeAttribute {
		return <NodeAttribute>this.getAttr(Attributes.Type.NODE);
	}

	childrenAttr(): ChildrenAttribute {
		return <ChildrenAttribute>this.getAttr(Attributes.Type.CHILDREN);
	}
}

export = Component;

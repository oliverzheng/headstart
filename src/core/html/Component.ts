import Attributes = require('./Attributes');
import BoxAttribute = require('./attributes/BoxAttribute');
import NodeAttribute = require('./attributes/NodeAttribute');
import ChildrenAttribute = require('./attributes/ChildrenAttribute');
import sinf = require('../spec/interfaces');

export class Component {
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

	deleteAttr(type: Attributes.Type) {
		for (var ii = 0; ii < this.attributes.length; ++ii) {
			var attr = this.attributes[ii];
			if (attr.getType() === type) {
				this.attributes.splice(ii, 1);
				return;
			}
		}
		throw new Error('Could not delete attribute of type ' + type);
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

	replaceAttributes(attrs: Attributes.BaseAttribute[]) {
		attrs.forEach((attr) => {
			var existingAttr = this.getAttr(attr.getType());
			if (!existingAttr) {
				throw new Error('Cannot replace attr that does not exist.');
			}
			this.deleteAttr(attr.getType());
			this.attributes.push(attr);
		});
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

	repr(): Attributes.Repr {
		return {
			title: 'Component',
			children: this.attributes.map((attr) => attr.repr()),
		};
	}
}

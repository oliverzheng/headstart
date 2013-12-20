import Attributes = require('./Attributes');
import BoxAttribute = require('./attributes/BoxAttribute');
import NodeAttribute = require('./attributes/NodeAttribute');
import Children = require('./attributes/Children');
import ParentAttribute = require('./attributes/ParentAttribute');
import sinf = require('../spec/interfaces');
import assert = require('assert');

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
				component.addAttributes([new Children(children)]);
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

	// Returns true if any rule was added because it was new
	addAttributes(attrs: Attributes.BaseAttribute[]): boolean {
		if (this.getAttr(Attributes.Type.SEALED)) {
			throw new Error('Cannot modify a sealed component');
		}
		var added = false;
		attrs.forEach((attr) => {
			var existingAttr = this.getAttr(attr.getType());
			if (!existingAttr) {
				this.attributes.push(attr);
				added = true;
			} else if (!existingAttr.equals(attr)) {
				var mergeAttr = existingAttr.merge(attr);
				if (!mergeAttr) {
					throw new Error('Cannot merge to an existing attr!');
				}
				assert(this.replaceAttributes([mergeAttr]));
				added = true;
			}
		});
		this.recalcParent(attrs);
		return added;
	}

	// Returns true if any rule was added because it actually replaced others
	replaceAttributes(attrs: Attributes.BaseAttribute[]): boolean {
		if (this.getAttr(Attributes.Type.SEALED)) {
			throw new Error('Cannot modify a sealed component');
		}
		var replaced = false;
		attrs.forEach((attr) => {
			var existingAttr = this.getAttr(attr.getType());
			if (!existingAttr) {
				throw new Error('Cannot replace attr that does not exist.');
			}
			if (!existingAttr.equals(attr)) {
				replaced = true;
				this.deleteAttr(attr.getType());
				this.attributes.push(attr);
			}
		});
		this.recalcParent(attrs);
		return replaced;
	}

	private recalcParent(attrs: Attributes.BaseAttribute[]) {
		if (attrs.length !== 1 || attrs[0].getType() !== Attributes.Type.PARENT) {
			attrs.forEach((attr) => {
				var attrType = attr.getType();
				assert(attrType !== Attributes.Type.PARENT);
				if (attrType === Attributes.Type.LAYOUT_CHILDREN ||
					attrType === Attributes.Type.LOGICAL_CHILDREN) {
					(<Children>attr).getComponents().forEach((child) => {
						child.addAttributes([new ParentAttribute(this)]);
					});
				}
			});
		}
	}

	// Specific attributes

	boxAttr(): BoxAttribute {
		return <BoxAttribute>this.getAttr(Attributes.Type.BOX);
	}

	nodeAttr(): NodeAttribute {
		return <NodeAttribute>this.getAttr(Attributes.Type.NODE);
	}

	getParent(): Component {
		var parentAttr = <ParentAttribute>this.getAttr(Attributes.Type.PARENT);
		if (parentAttr) {
			return parentAttr.getParent();
		}
	}

	repr(): Attributes.Repr {
		return {
			title: 'Component',
			children: this.attributes.map((attr) => attr.repr()),
		};
	}

	static aggregate(components: Component[]): Component {
		assert(components.length > 0);
		if (components.length === 1) {
			return components[0];
		}

		var wrap = new Component;
		wrap.addAttributes([
			new Children(components),
		]);
		return wrap;
	}
}

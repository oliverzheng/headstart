import Attributes = require('./Attributes');
import BoxAttribute = require('./attributes/BoxAttribute');
import NodeAttribute = require('./attributes/NodeAttribute');
import StackedChildren = require('./attributes/StackedChildren');
import ParentAttribute = require('./attributes/ParentAttribute');
import sinf = require('../spec/interfaces');
import assert = require('assert');

export var STOP_RECURSION = new Object();
export var STOP_ITERATION = new Object();

var componentID: number = 0;

export class Component {
	attributes: Attributes.BaseAttribute[] = [];
	id: number;

	constructor() {
		this.id = componentID++;
	}

	static fromBox(root: sinf.Box, isRoot: boolean = true): Component {
		var component = new Component;
		component.addAttributes([new BoxAttribute(root)]);
		if (isRoot) {
			component.addAttributes([new NodeAttribute()]);
		}

		if (root.children) {
			var children = root.children.map((childBox) => {
				return Component.fromBox(childBox, false);
			});
			if (children.length > 0) {
				component.addAttributes([new StackedChildren(children)]);
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
				attr.setComponent(this);
				added = true;
			} else if (!existingAttr.includes(attr)) {
				var mergeAttr = existingAttr.merge(attr);
				if (!mergeAttr) {
					throw new Error('Cannot merge to an existing attr!');
				}
				assert(this.replaceAttributes([mergeAttr]).updated);
				added = true;
			}
		});
		this.recalcParent(attrs);
		return added;
	}

	// Returns true if any rule was added because it actually replaced others
	replaceAttributes(attrs: Attributes.BaseAttribute[]): { updated: boolean; created: boolean; } {
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
				attr.setComponent(this);
			}
		});
		return {
			updated: replaced,
			created: this.recalcParent(attrs),
		};
	}

	private recalcParent(attrs: Attributes.BaseAttribute[]): boolean {
		var added = false;
		if (attrs.length !== 1 || attrs[0].getType() !== Attributes.Type.PARENT) {
			attrs.forEach((attr) => {
				var attrType = attr.getType();
				assert(attrType !== Attributes.Type.PARENT);
				if (attr.managesChildren()) {
					attr.getComponentChildren().forEach((child) => {
						if (child.getParent() !== this) {
							added = true;
							child.addAttributes([new ParentAttribute(this)]);
						}
					});
				}
			});
		}
		return added;
	}

	getChildrenManager(): Attributes.BaseAttribute {
		var childrenAttrs = this.attributes.filter((attr) => attr.managesChildren());
		assert(childrenAttrs.length <= 1);
		return childrenAttrs[0];
	}

	getChildren(): Component[] {
		var childrenManager = this.getChildrenManager();
		if (!childrenManager) {
			return [];
		}
		return childrenManager.getComponentChildren();
	}

	iterateChildrenBreadthFirst(callback: (component: Component) => any): any {
		var result = callback(this);
		if (result === STOP_ITERATION) {
			return STOP_ITERATION;
		} else if (result === STOP_RECURSION) {
			return STOP_ITERATION;
		} else {
			var stopIteration = false;
			for (var i = 0; i < this.getChildren().length; ++i) {
				var child = this.getChildren()[i];
				var result = child.iterateChildrenBreadthFirst(callback);
				if (result === STOP_ITERATION) {
					return STOP_ITERATION;
				} else if (result === STOP_RECURSION) {
					break;
				}
			}
		}
	}

	// Specific attributes

	boxAttr(): BoxAttribute {
		return <BoxAttribute>this.getAttr(Attributes.Type.BOX);
	}

	getBox(): sinf.Box {
		return this.boxAttr() ? this.boxAttr().getBox() : null;
	}

	nodeAttr(): NodeAttribute {
		return <NodeAttribute>this.getAttr(Attributes.Type.NODE);
	}

	getRoot(): Component {
		var parent = this;
		while (parent.getParent())
			parent = parent.getParent();
		return parent;
	}

	isRoot(): boolean {
		return this.getParent() == null;
	}

	getParent(): Component {
		var parentAttr = <ParentAttribute>this.getAttr(Attributes.Type.PARENT);
		if (parentAttr) {
			return parentAttr.getParent();
		}
	}

	isDescendentOf(component: Component) {
		assert(component);
		var parent = this;
		while (parent && parent !== component) {
			parent = parent.getParent();
		}
		return parent != null;
	}

	getOrder() {
		var order = 0;
		var parent = this;
		while (parent = parent.getParent()) {
			order++;
		}
		return order;
	}

	static getCommonAncestor(c1: Component, c2: Component): { ancestor: Component; firstParent: Component; secondParent: Component; } {
		if (c1 === c2)
			return {
				ancestor: null,
				firstParent: null,
				secondParent: null,
			};

		var order1 = c1.getOrder();
		var order2 = c2.getOrder();
		if (order1 === order2) {
			var common = Component.getCommonAncestor(c1.getParent(), c2.getParent());
			if (!common.ancestor) {
				return {
					ancestor: c1.getParent(),
					firstParent: null,
					secondParent: null,
				};
			} else if (!common.firstParent) {
				return {
					ancestor: common.ancestor,
					firstParent: c1.getParent(),
					secondParent: c2.getParent(),
				};
			} else {
				return common;
			}
		} else if (order1 > order2) {
			while (order1 > order2) {
				c1 = c1.getParent();
				order1--;
			}
		} else {
			while (order2 > order1) {
				c2 = c2.getParent();
				order2--;
			}
		}
		return Component.getCommonAncestor(c1, c2);
	}

	repr(): Attributes.Repr {
		return {
			title: 'Component',
			id: this.id.toString(),
			children: this.attributes.map((attr) => attr.repr()).filter((attr) => !!attr), // Filter things like parent attribute
		};
	}

	static increaseIDToAtLeast(atLeast: number) {
		if (componentID < atLeast)
			componentID = atLeast;
	}
}

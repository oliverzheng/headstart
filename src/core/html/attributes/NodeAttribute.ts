import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import StackedChildren = require('../attributes/StackedChildren');
import LengthAttribute = require('../attributes/LengthAttribute');
import getDynamicBox = require('../patterns/getDynamicBox');
import getDirection = require('../patterns/getDirection');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import sinf = require('../../spec/interfaces');

// Having a node indicates that in the final HTML/CSS rendering tree, a node
// will represent this component.
class NodeAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.NODE;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static getFrom(component: c.Component): NodeAttribute {
		return <NodeAttribute>(component.getAttr(Attributes.Type.NODE));
	}

	static dynamicBoxRule(component: c.Component): Rules.RuleResult[] {
		if (!getDynamicBox(component)) {
			return;
		}

		return [{
			component: component,
			attributes: [
				new NodeAttribute(),
			],
		}];
	}

	static unfoldSameDirectionRule(component: c.Component): Rules.RuleResult[] {
		var stackedChildren = StackedChildren.getFrom(component);
		if (!stackedChildren || stackedChildren.isEmpty())
			return;

		var direction = getDirection(component);

		var width = LengthAttribute.getFrom(component, sinf.horiz);
		var height = LengthAttribute.getFrom(component, sinf.vert);

		var newChildren: c.Component[] = [];
		var unfoldComponents = groupChildren(component, (child) => {
			// Already a node
			if (NodeAttribute.getFrom(child))
				return false;

			var childDirection = getDirection(component);
			if (childDirection !== direction)
				return false;

			var grandChildren = StackedChildren.getFrom(child);
			if (!grandChildren || grandChildren.isEmpty())
				return false;

			var grandChildrenLength = LengthAttribute.sum(
				grandChildren.get().map(
					(grandChild) => LengthAttribute.getFrom(grandChild, direction)
				)
			);

			// If the child specified its own length that is different from what
			// the children add up to, then this guy needs its own node.
			var childLength = LengthAttribute.getFrom(child, direction);
			if (!childLength.looksEqual(grandChildrenLength)) {
				return false;
			}

			return true;
		});

		unfoldComponents.forEach((group) => {
			// Do not unfold
			if (!group.matched) {
				newChildren.push.apply(newChildren, group.components);
			} else {
				group.components.forEach((child) => {
					var grandChildren = StackedChildren.getFrom(child);
					newChildren.push.apply(newChildren, grandChildren.get());
				});
			}
		});

		return [{
			component: component,
			replaceAttributes: [
				new StackedChildren(newChildren),
			],
		}];
	}

	static explicitLengthContentRule(component: c.Component): Rules.RuleResult[] {
		if (!hasBoxContent(component))
			return;

		var width = LengthAttribute.getFrom(component, sinf.horiz);
		var height = LengthAttribute.getFrom(component, sinf.vert);
		if (width.px.isSet() && width.px.isExplicit ||
			height.px.isSet() && height.px.isExplicit) {
			return [{
				component: component,
				attributes: [new NodeAttribute()],
			}];
		}
	}
}

export = NodeAttribute;

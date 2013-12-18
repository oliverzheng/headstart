import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');

var foldBlockFormattingRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}

	var direction = getDirection(component);
	if (direction !== sinf.vert) {
		return;
	}

	if (!BlockFormattingAttribute.getFrom(component)) {
		return;
	}

	var width = LengthAttribute.getFrom(component, sinf.horiz);

	var newChildren: c.Component[] = [];
	childrenAttr.getChildren().forEach((child) => {
		do {
			if (!BlockFormattingAttribute.getFrom(child) ||
				child.nodeAttr()) {
				break;
			}

			// Only fold if the child's width is equal to the parent's
			if (!width.looksEqual(LengthAttribute.getFrom(child, sinf.horiz))) {
				break;
			}

			if (!child.childrenAttr()) {
				break;
			}
			var grandChildren = child.childrenAttr().getChildren();
			var height = LengthAttribute.getFrom(child, sinf.vert);
			var childrenHeightsSum = LengthAttribute.sum(
				grandChildren.map(
					(grandChild) => LengthAttribute.getFrom(grandChild, sinf.vert)
				)
			);

			if (!height.looksEqual(childrenHeightsSum)) {
				break;
			}

			newChildren.push.apply(newChildren, grandChildren);
			return;

		} while (false);

		newChildren.push(child);
	});

	return [{
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(newChildren),
		],
	}];
}

export = foldBlockFormattingRule;

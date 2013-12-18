import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import Children = require('../attributes/Children');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');

var foldBlockFormattingRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var children = Children.getLayoutFrom(component);
	if (children.isEmpty()) {
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
	children.getComponents().forEach((child) => {
		do {
			if (!BlockFormattingAttribute.getFrom(child) ||
				child.nodeAttr()) {
				break;
			}

			// Only fold if the child's width is equal to the parent's
			if (!width.looksEqual(LengthAttribute.getFrom(child, sinf.horiz))) {
				break;
			}

			var grandChildren = Children.getLayoutFrom(child);
			if (grandChildren.isEmpty()) {
				break;
			}
			var height = LengthAttribute.getFrom(child, sinf.vert);
			var childrenHeightsSum = LengthAttribute.sum(
				grandChildren.getComponents().map(
					(grandChild) => LengthAttribute.getFrom(grandChild, sinf.vert)
				)
			);

			if (!height.looksEqual(childrenHeightsSum)) {
				break;
			}

			newChildren.push.apply(newChildren, grandChildren.getComponents());
			return;

		} while (false);

		newChildren.push(child);
	});

	return [{
		component: component,
		replaceAttributes: [
			new Children(newChildren),
		],
	}];
}

export = foldBlockFormattingRule;

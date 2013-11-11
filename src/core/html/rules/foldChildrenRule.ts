import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');

var foldChildrenRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return null;
	}

	var newChildren: c.Component[] = [];
	childrenAttr.getChildren().forEach((child) => {
		if (BlockFormattingAttribute.getFrom(child) &&
			!child.nodeAttr() &&
			(!child.boxAttr() ||
			 child.boxAttr().getBox().h.unit === sinf.LengthUnit.SHRINK)) {
			var childChildrenAttr = child.childrenAttr();
			if (childChildrenAttr) {
				newChildren.push.apply(newChildren, childChildrenAttr.getChildren());
			}
		} else {
			newChildren.push(child);
		}
	});

	return [{
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(newChildren),
		],
	}];
}

export = foldChildrenRule;

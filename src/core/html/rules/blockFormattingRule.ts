import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');

var blockFormattingRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var direction = getDirection(component);
	var children = component.childrenAttr();
	if (direction === sinf.vert &&
		children && children.getChildren().length > 0) {
		return [{
			component: component,
			attributes: [
				new BlockFormattingAttribute(),
			],
		}];
	}
}

export = blockFormattingRule;

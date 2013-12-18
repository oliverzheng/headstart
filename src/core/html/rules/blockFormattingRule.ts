import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import Children = require('../attributes/Children');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');

var blockFormattingRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	if (getDirection(component) === sinf.vert &&
		!Children.getLayoutFrom(component).isEmpty()) {
		return [{
			component: component,
			attributes: [
				new BlockFormattingAttribute(),
			],
		}];
	}
}

export = blockFormattingRule;

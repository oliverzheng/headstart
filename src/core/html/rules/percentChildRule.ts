import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import Children = require('../attributes/Children');
import size = require('../patterns/size');
import sinf = require('../../spec/interfaces');

var percentChildRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	if (!component.boxAttr()) {
		return;
	}

	var children = Children.getLayoutFrom(component);
	if (children.isEmpty()) {
		return;
	}
	var anyChildWithPercentage = children.getComponents().some((child) => {
		return (
			size.isBoxSizePercent(child, sinf.horiz) ||
			size.isBoxSizePercent(child, sinf.vert)
		);
	});
	if (!anyChildWithPercentage) {
		return;
	}

	return [{
		component: component,
		attributes: [
			new NodeAttribute(),
		],
	}];
}

export = percentChildRule;

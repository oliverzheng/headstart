import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import size = require('../patterns/size');
import sinf = require('../../spec/interfaces');

var percentChildRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	if (!component.boxAttr() || !component.childrenAttr()) {
		return;
	}

	var children = component.childrenAttr().getChildren();
	var anyChildWithPercentage = children.some((child) => {
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

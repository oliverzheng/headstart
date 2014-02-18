import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import StackedChildren = require('../attributes/StackedChildren');
import size = require('../patterns/size');
import sinf = require('../../spec/interfaces');

var percentChild: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	if (!component.boxAttr()) {
		return;
	}

	var children = StackedChildren.getFrom(component);
	if (!children || children.isEmpty()) {
		return;
	}
	var anyChildWithPercentage = children.get().some((child) => {
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

export = percentChild;

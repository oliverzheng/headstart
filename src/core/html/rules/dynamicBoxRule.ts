import Attributes = require('../Attributes');
import Component = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import dynamicBoxPattern = require('../patterns/dynamicBoxPattern');

var dynamicBoxRule: Rules.Rule = function(component: Component): Rules.RuleResult[] {
	var box = dynamicBoxPattern(component);
	if (!box) {
		return;
	}

	return [{
		component: component,
		attributes: [
			new NodeAttribute(),
		],
	}];
}

export = dynamicBoxRule;

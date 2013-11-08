import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import getDynamicBox = require('../patterns/getDynamicBox');

var dynamicBoxRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
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

export = dynamicBoxRule;

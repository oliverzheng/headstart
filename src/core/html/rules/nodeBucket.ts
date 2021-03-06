import Rules = require('../Rules');
import c = require('../Component');
import BlockFormat = require('../attributes/BlockFormat');
import NodeAttribute = require('../attributes/NodeAttribute');
import Spacing = require('../attributes/Spacing');

function blockNode(component: c.Component): Rules.RuleResult[] {
	if (!BlockFormat.from(component))
		return;

	if (Spacing.getFrom(component))
		return;

	return [{
		component: component,
		attributes: [
			new NodeAttribute(),
		]
	}];
}

var bucket: Rules.Bucket = {
	name: 'node',
	rules: [
		{name: 'blockNode', rule: blockNode},
	],
};

export = bucket;

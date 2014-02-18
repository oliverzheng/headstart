import assert = require('assert');

import Rules = require('../Rules');
import c = require('../Component');
import NodeAttribute = require('../attributes/NodeAttribute');
import TextContent = require('../attributes/TextContent');
import LineHeight = require('../attributes/LineHeight');

function createNode(component: c.Component): Rules.RuleResult[] {
	var box = component.getBox();
	if (box && box.createNode) {
		return [{
			component: component,
			attributes: [
				new NodeAttribute(),
			],
		}];
	}
}

function staticText(component: c.Component): Rules.RuleResult[] {
	var box = component.getBox();
	if (!box || !box.staticContent || !box.staticContent.text)
		return;

	var text = box.staticContent.text;
	if (!text.fontSize || !text.lineHeight)
		return;

	assert(component.getChildren().length === 0);

	if (text.value) {
		return [{
			component: component,
			attributes: [
				new TextContent(),
				new LineHeight(),
			],
		}];
	}
}

var bucket: Rules.Bucket = {
	name: 'userSpecified',
	rules: [
		{name: 'createNode', rule: createNode},
		{name: 'staticText', rule: staticText},
	],
};

export = bucket;

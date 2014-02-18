import Rules = require('../../Rules');
import c = require('../../Component');
import Background = require('../../attributes/Background');
import NodeAttribute = require('../../attributes/NodeAttribute');

function backgroundFillRule(component: c.Component): Rules.RuleResult[] {
	var boxAttr = component.boxAttr();
	if (!boxAttr)
		return;
	var box = boxAttr.getBox();

	if (!box.staticContent || !box.staticContent.fill)
		return;

	var fill = box.staticContent.fill;
	if (!fill.color)
		return;

	return [{
		component: component,
		attributes: [
			new Background(),
			new NodeAttribute(),
		],
	}];
}

var rules: Rules.RuleWithName[] = [
	{name: 'backgroundFillRule', rule: backgroundFillRule},
];

export = rules;

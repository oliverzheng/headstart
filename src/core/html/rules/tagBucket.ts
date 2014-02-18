import Rules = require('../Rules');
import c = require('../Component');
import CSSAttribute = require('../attributes/CSSAttribute');
import BlockFormat = require('../attributes/BlockFormat');
import TagName = require('../attributes/TagName');

function blockDiv(component: c.Component): Rules.RuleResult[] {
	if (!BlockFormat.from(component))
		return;

	return [{
		component: component,
		attributes: [
			new TagName('div'),
		]
	}];
}

function explicitSizeDiv(component: c.Component): Rules.RuleResult[] {
	var css = CSSAttribute.getFrom(component, false);
	if (!css)
		return;

	if (css.styles['width'] || css.styles['height'])
		return [{
			component: component,
			attributes: [
				new TagName('div'),
			]
		}];
}

var bucket: Rules.Bucket = {
	name: 'tag',
	rules: [
		{name: 'blockDiv', rule: blockDiv},
		{name: 'explicitSizeDiv', rule: explicitSizeDiv},
	],
};

export = bucket;

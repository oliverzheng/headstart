import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import hasBoxContent = require('../patterns/hasBoxContent');
import CSSAttribute = require('../attributes/CSSAttribute');
import BlockFormat = require('../attributes/BlockFormat');
import NodeAttribute = require('../attributes/NodeAttribute');
import Spacing = require('../attributes/Spacing');
import TagName = require('../attributes/TagName');

function copyRenderingValuesToCSS(component: c.Component): Rules.RuleResult[] {
	var rendering = CSSAttribute.getFrom(component);
	if (!rendering)
		return;

	var attributes: Attributes.BaseAttribute[] = [];

	var css = rendering.getNonRendering();
	if (css) {
		attributes.push(css);
		if (!Spacing.getFrom(component)) {
			attributes.push(new NodeAttribute());
		}
	}
	return [{
		component: component,
		attributes: attributes,
	}];
}

var bucket: Rules.Bucket = {
	name: 'css',
	rules: [
		{name: 'copyRenderingValuesToCSS', rule: copyRenderingValuesToCSS},
	],
};

export = bucket;

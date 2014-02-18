import assert = require('assert');

import Rules = require('../Rules');
import c = require('../Component');
import Markup = require('../Markup');
import CSSAttribute = require('../attributes/CSSAttribute');

import styling = require('./rendering/styling');
import alignment = require('./rendering/alignment');
import sizing = require('./rendering/sizing');
import spacing = require('./rendering/spacing');

var rules: Rules.RuleWithName[] = [];

rules.push.apply(rules, styling);
rules.push.apply(rules, alignment);
rules.push.apply(rules, sizing);
rules.push.apply(rules, spacing);

function applyCssRule(component: c.Component): Rules.RuleResult[] {
	var markups: Markup[] = Markup.getMarkupAttributes(component);

	var root = component.getRoot();
	var results: Rules.RuleResult[] = [];
	markups.forEach((markup) => {
		markup.getCSS().forEach((css) => {
			if (css.component === root)
				return;

			var componentFound = false;
			component.iterateChildrenBreadthFirst((child) => {
				if (child === css.component) {
					componentFound = true;
					results.push({
						component: child,
						attributes: [
							new CSSAttribute(css.css),
						],
					});
					return c.STOP_ITERATION;
				}
			});
			assert(componentFound);
		});
	});
	return results;
}

rules.push({name: 'applyCssRule', rule: applyCssRule});

var bucket: Rules.Bucket = {
	name: 'rendering',
	rules: rules,
};

export = bucket;

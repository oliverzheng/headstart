import assert = require('assert');

import Rules = require('../Rules');
import c = require('../Component');
import Markup = require('../Markup');
import CSSAttribute = require('../attributes/CSSAttribute');

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

var bucket: Rules.Bucket = {
	name: 'applyCss',
	rules: [
		{name: 'applyCssRule', rule: applyCssRule},
	],
};

export = bucket;

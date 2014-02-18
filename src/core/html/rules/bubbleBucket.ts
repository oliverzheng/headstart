import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import hasBoxContent = require('../patterns/hasBoxContent');
import CSSAttribute = require('../attributes/CSSAttribute');
import BlockFormat = require('../attributes/BlockFormat');
import NodeAttribute = require('../attributes/NodeAttribute');
import TagName = require('../attributes/TagName');

function bubbleUpInheritedStylesRule(component: c.Component): Rules.RuleResult[] {
	if (component.isRoot())
		return;

	var inheritedStyles = CSSAttribute.getCascadingInheritedStyles(component);
	var parentInheritedStyles = CSSAttribute.getCascadingInheritedStyles(component.getParent());
	// The root doesn't get generated
	if (!component.getParent().isRoot()) {
		// Generate keys first since we are going to mutate it
		Object.keys(inheritedStyles).forEach((prop) => {
			if (parentInheritedStyles[prop] != null) {
				// The parent can do this too. Let's not worry about it.
				delete inheritedStyles[prop];
			}
		});
	}
	if (Object.keys(inheritedStyles).length > 0) {
		var results: Rules.RuleResult[] = [{
			component: component,
			attributes: [
				new NodeAttribute(),
				new CSSAttribute(inheritedStyles, false/*isRendering*/),
			],
		}];

		// Delete these styles from children that'll inherit them.
		/*
		component.iterateChildrenBreadthFirst((descendent) => {
			if (descendent !== component) {
				var cssAttr = CSSAttribute.getFrom(descendent);
				if (cssAttr && Object.keys(cssAttr.styles).some((prop) => inheritedStyles[prop] != null)) {
					var newStyles: { [styleName: string]: string; } = {};
					for (var prop in cssAttr.styles) {
						if (!inheritedStyles[prop]) {
							newStyles[prop] = cssAttr.styles[prop];
						}
					}
					if (Object.keys(newStyles).length > 0) {
						results.push({
							component: descendent,
							replaceAttributes: [new CSSAttribute(newStyles)],
						});
					} else {
						results.push({
							component: descendent,
							deleteAttributes: [Attributes.Type.CSS],
						});
					}
				}
			}
		});
		*/

		return results;
	}
}

var bucket: Rules.Bucket = {
	name: 'bubble',
	rules: [
		{name: 'bubbleUpInheritedStylesRule', rule: bubbleUpInheritedStylesRule},
	],
};

export = bucket;

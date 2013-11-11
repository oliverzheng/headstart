import Rules = require('./Rules');
import c = require('./Component');

import dynamicBoxRule = require('./rules/dynamicBoxRule');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import emptySpaceRule = require('./rules/emptySpaceRule');
import verticalRule = require('./rules/verticalRule');
import foldChildrenRule = require('./rules/foldChildrenRule');

export class RuleRunner {
	private rules: Rules.Rule[];

	constructor(rules: Rules.Rule[]) {
		this.rules = rules;
	}

	start(component: c.Component) {
		var updated: boolean;
		do {
			updated = this.runRulesOn(component);

			var childrenAttr = component.childrenAttr();
			if (childrenAttr) {
				childrenAttr.breadthFirst((child) => {
					updated = this.runRulesOn(child) || updated;
				});
			}
		} while (updated);
	}

	private runRulesOn(component: c.Component): boolean {
		var updated = false;
		for (var ii = 0; ii < this.rules.length; ++ii) {
			var rule = this.rules[ii];
			var attrsForComponents = rule(component);
			if (attrsForComponents) {
				attrsForComponents.forEach((attrsForComponent) => {
					var component = attrsForComponent.component;
					var attrs = attrsForComponent.attributes;
					if (attrs) {
						updated = component.addAttributes(attrs) || updated;
					}
					var replaceAttrs = attrsForComponent.replaceAttributes;
					if (replaceAttrs) {
						updated = component.replaceAttributes(replaceAttrs) || updated;
					}
				});
			}
		}
		return updated;
	}
}

export class DefaultRuleRunner extends RuleRunner {
	constructor() {
		super([
			dynamicBoxRule,
			percentChildRule,
			coalesceSpacesRule,
			emptySpaceRule,
			verticalRule,
			foldChildrenRule,
		]);
	}
}

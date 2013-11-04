import Rules = require('./Rules');
import Component = require('./Component');

import dynamicBoxRule = require('./rules/dynamicBoxRule');

export class RuleRunner {
	private rules: Rules.Rule[];

	constructor(rules: Rules.Rule[]) {
		this.rules = rules;
	}

	start(component: Component) {
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

	private runRulesOn(component: Component): boolean {
		var updated = false;
		for (var ii = 0; ii < this.rules.length; ++ii) {
			var rule = this.rules[ii];
			var attrsForComponents = rule(component);
			if (attrsForComponents) {
				attrsForComponents.forEach((attrsForComponent) => {
					var component = attrsForComponent.component;
					var attrs = attrsForComponent.attributes;
					updated = component.addAttributes(attrs) || updated;
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
		]);
	}
}

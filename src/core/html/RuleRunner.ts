import Rules = require('./Rules');
import Attributes = require('./Attributes');
import c = require('./Component');

import dynamicBoxRule = require('./rules/dynamicBoxRule');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import emptySpaceRule = require('./rules/emptySpaceRule');
import verticalRule = require('./rules/verticalRule');
import foldChildrenRule = require('./rules/foldChildrenRule');
import alignmentRule = require('./rules/alignmentRule');
import middleAlignmentRule = require('./rules/middleAlignmentRule');

export class RuleRunner {
	private rules: Rules.Rule[];

	constructor(rules: Rules.Rule[]) {
		this.rules = rules;
	}

	start(component: c.Component) {
		var updated: boolean;
		do {
			if (component.getAttr(Attributes.Type.SEALED)) {
				break;
			}
			updated = this.runRulesOn(component);

			var childrenAttr = component.childrenAttr();
			if (childrenAttr) {
				childrenAttr.breadthFirst((child) => {
					if (child.getAttr(Attributes.Type.SEALED)) {
						return true; // stop recursion;
					}
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
			alignmentRule,
			middleAlignmentRule,
		]);
	}
}

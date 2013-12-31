import assert = require('assert');

import Rules = require('./Rules');
import Attributes = require('./Attributes');
import Context = require('./Context');
import c = require('./Component');

import NodeAttribute = require('./attributes/NodeAttribute');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import emptySpaceRule = require('./rules/emptySpaceRule');
import sizeRule = require('./rules/sizeRule');
import cssVerticalBottomRule = require('./rules/cssVerticalBottomRule');

import BlockFormat = require('./attributes/BlockFormat');
import Alignment = require('./attributes/Alignment');
import FloatFormat = require('./attributes/FloatFormat');
import CSSAttribute = require('./attributes/CSSAttribute');

export class RuleRunner {
	rules: Rules.Rule[];
	context: Context.Context;

	constructor(rules: Rules.Rule[], context: Context.Context) {
		this.rules = rules;
		this.context = context;
	}

	start(component: c.Component) { throw new Error('Subclass RuleRunner first'); }

	runSingleRuleOn(component: c.Component, rule: Rules.Rule): boolean {
		var updated = false;
		var attrsForComponents = rule(component, this.context);
		if (attrsForComponents) {
			var parent = component.getParent();
			attrsForComponents.forEach((attrsForComponent) => {
				var component = attrsForComponent.component;
				// TODO make sure component is under the tree of the original
				// component
				assert(component != parent);

				var deleteAttrs = attrsForComponent.deleteAttributes;
				if (deleteAttrs && deleteAttrs.length > 0) {
					deleteAttrs.forEach(
						(attrType) => component.deleteAttr(attrType)
					);
					updated = true;
				}

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
		return updated;
	}

	runAllRulesOn(component: c.Component): boolean {
		var updated = false;
		this.rules.forEach((rule) => {
			updated = this.runSingleRuleOn(component, rule) || updated;
		});
		return updated;
	}
}

// For each component, run all rules on a component at once. If it changes,
// don't iterate its children. This implies the rules do not depend on each
// other, and this is no preference for which rule is favored.
export class IndependentRuleRunner extends RuleRunner {
	start(component: c.Component) {
		var updated: boolean;
		do {
			updated = false;
			component.iterateChildrenBreadthFirst((child) => {
				updated = this.runAllRulesOn(child);
				if (updated) {
					return c.STOP_RECURSION;
				}
			});
		} while (updated);
	}
}

// Walk the tree (breadth first) applying the first rule of a list of rules. When
// it's applied, continue walking the tree. When this rule applies to nothing
// else, walk with the second rule. When the second rule updates, restart
// walking with the first rule, etc.
export class PreferenceRuleRunner extends RuleRunner {
	start(component: c.Component) {
		var updated: boolean;
		do {
			updated = false;
			for (var i = 0; i < this.rules.length; ++i) {
				var rule = this.rules[i];
				var isFirstRule = i === 0;
				component.iterateChildrenBreadthFirst((child) => {
					updated = this.runSingleRuleOn(child, rule);
					if (updated && !isFirstRule) {
						return c.STOP_ITERATION;
					}
				});
				if (updated && !isFirstRule) {
					break;
				}
			};
		} while (updated);
	}
}

export interface RuleGroup {
	independent: boolean;

	// Only one of the following can exist.
	rules: Rules.Rule[];
}

var defaultRuleGroups: RuleGroup[] = [{
	// User specified rules
	independent: true,
	rules: [
		NodeAttribute.dynamicBoxRule,
		percentChildRule,
	],
}, {
	// Calculate sizes
	independent: true,
	rules: [
		sizeRule.sizeUserExplicit,
		sizeRule.sizePercentChildren,
		sizeRule.sizeExpandedChildren,
		sizeRule.sizeShrink,
	],
}, {
	// Hierarchy changing rules
	independent: false,
	rules: [
		sizeRule.sizeByChildrenSum,
		NodeAttribute.unfoldSameDirectionRule,

		BlockFormat.verticalRule,

		Alignment.expandRule,
		coalesceSpacesRule,
		BlockFormat.explicitFixedWidthBlockRule,
		NodeAttribute.explicitLengthContentRule,
		FloatFormat.alignRule,

		/*
		// Hmm these don't look right:
		emptySpaceRule,
		cssVerticalBottomRule,
		*/
	],
}, {
	// Apply all CSS
	independent: true,
	rules: [
		CSSAttribute.applyCssRule,
	],
}];

export function runOn(component: c.Component, context: Context.Context, ruleGroups: RuleGroup[] = defaultRuleGroups) {
	ruleGroups.forEach((group) => {
		var runner: RuleRunner;
		if (group.independent) {
			runner = new IndependentRuleRunner(group.rules, context);
		} else {
			runner = new PreferenceRuleRunner(group.rules, context);
		}
		runner.start(component);
	});
}

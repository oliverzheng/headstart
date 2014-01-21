import assert = require('assert');

import util = require('../../util');

import Rules = require('./Rules');
import Attributes = require('./Attributes');
import Context = require('./Context');
import c = require('./Component');

import NodeAttribute = require('./attributes/NodeAttribute');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import sizeRule = require('./rules/sizeRule');
import cssVerticalBottomRule = require('./rules/cssVerticalBottomRule');

import BlockFormat = require('./attributes/BlockFormat');
import InlineFormat = require('./attributes/InlineFormat');
import Alignment = require('./attributes/Alignment');
import FloatFormat = require('./attributes/FloatFormat');
import Margin = require('./attributes/Margin');
import HorizontalCenter = require('./attributes/HorizontalCenter');
import TextContent = require('./attributes/TextContent');
import LineHeight = require('./attributes/LineHeight');
import CSSAttribute = require('./attributes/CSSAttribute');

export interface RuleWithName {
	name: string;
	rule: Rules.Rule;
}

export class RuleRunner {
	rules: RuleWithName[];
	context: Context.Context;
	logs: string[];

	constructor(rules: RuleWithName[], context: Context.Context, logs: string[]) {
		this.rules = rules;
		this.context = context;
		this.logs = logs;
	}

	start(component: c.Component) { throw new Error('Subclass RuleRunner first'); }

	runSingleRuleOn(component: c.Component, rule: RuleWithName): boolean {
		var updated = false;
		var attrsForComponents = rule.rule(component, this.context);
		if (attrsForComponents) {
			this.logs.push('Rule ' + rule.name + ' applied on Component #' + component.id + ':');
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

					this.logs.push('- Component #' + component.id + ' had attributes deleted (' + deleteAttrs.join(',') + ')');
				}

				var attrs = attrsForComponent.attributes;
				if (attrs) {
					updated = component.addAttributes(attrs) || updated;
					if (updated)
						this.logs.push('- Component #' + component.id + ' had attributes added (' + attrs.map((attr) => attr.getType()).join(',') + ')');
				}

				var replaceAttrs = attrsForComponent.replaceAttributes;
				if (replaceAttrs) {
					updated = component.replaceAttributes(replaceAttrs) || updated;
					if (updated)
						this.logs.push('- Component #' + component.id + ' had attributes replaced (' + replaceAttrs.map((attr) => attr.getType()).join(',') + ')');
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
	rules: RuleWithName[];
}

var userSpecifiedRules: RuleGroup = {
	independent: true,
	rules: [
		{name: 'dynamicBox', rule: NodeAttribute.dynamicBoxRule},
		{name: 'percentChildRule', rule: percentChildRule},
		{name: 'TextContent.staticTextRule', rule: TextContent.staticTextRule},
		{name: 'LineHeight.staticTextRule', rule: LineHeight.staticTextRule},
		{name: 'InlineFormat.shrinkWidthToTextRule', rule: InlineFormat.shrinkWidthToTextRule},
	],
};

var sizeCalculationRules: RuleGroup = {
	independent: true,
	rules: [
		{name: 'sizeRule.sizeUserExplicit', rule: sizeRule.sizeUserExplicit},
		{name: 'sizeRule.sizePercentChildren', rule: sizeRule.sizePercentChildren},
		{name: 'sizeRule.sizeExpandedChildren', rule: sizeRule.sizeExpandedChildren},
		{name: 'sizeRule.sizeShrink', rule: sizeRule.sizeShrink},
		{name: 'sizeRule.sizeShrinkHeightToText', rule: sizeRule.sizeShrinkHeightToText},
	],
};

export var defaultRuleGroups: RuleGroup[] = [
	userSpecifiedRules,
	sizeCalculationRules,
{
	// Hierarchy changing rules
	independent: false,
	rules: [
		// Size calculation
		{name: 'sizeRule.sizeByChildrenSum', rule: sizeRule.sizeByChildrenSum},

		{name: 'Alignment.expandRule', rule: Alignment.expandRule},
		{name: 'Alignment.leftAlignRule', rule: Alignment.leftAlignRule},
		{name: 'NodeAttribute.unfoldSameDirectionRule', rule: NodeAttribute.unfoldSameDirectionRule},
		{name: 'coalesceSpacesRule', rule: coalesceSpacesRule},

		/*
		// Hmm these don't look right:
		cssVerticalBottomRule,
		*/
	],

	// Rules after this should not change hierarchy
}, {
	// Determine which are nodes
	independent: true,
	rules: [
		{name: 'NodeAttribute.explicitLengthContentRule', rule: NodeAttribute.explicitLengthContentRule},
	]
}, {
	// Attributes that require nodes
	independent: true,
	rules: [
		{name: 'BlockFormat.verticalRule', rule: BlockFormat.verticalRule},
		{name: 'BlockFormat.explicitFixedWidthBlockRule', rule: BlockFormat.explicitFixedWidthBlockRule},
		{name: 'BlockFormat.implicitExpandWidthBlockRule', rule: BlockFormat.implicitExpandWidthBlockRule},
		{name: 'FloatFormat.alignRule', rule: FloatFormat.alignRule},
		{name: 'Margin.marginRule', rule: Margin.marginRule},
		{name: 'HorizontalCenter.marginAutoRule', rule: HorizontalCenter.marginAutoRule},
	],
}, {
	// Apply all CSS
	independent: true,
	rules: [
		{name: 'CSSAttribute.applyCssRule', rule: CSSAttribute.applyCssRule},
	],
}];

export var renderingRuleGroups: RuleGroup[] = [
	userSpecifiedRules,
	sizeCalculationRules,
];

export function runOn(component: c.Component, context: Context.Context, logs: string[], ruleGroups: RuleGroup[] = defaultRuleGroups) {
	ruleGroups.forEach((group) => {
		var runner: RuleRunner;
		if (group.independent) {
			runner = new IndependentRuleRunner(group.rules, context, logs);
		} else {
			runner = new PreferenceRuleRunner(group.rules, context, logs);
		}
		runner.start(component);
	});
}

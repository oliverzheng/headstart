import assert = require('assert');

import Rules = require('./Rules');
import Attributes = require('./Attributes');
import Context = require('./Context');
import c = require('./Component');
import Children = require('./attributes/Children');

import dynamicBoxRule = require('./rules/dynamicBoxRule');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import emptySpaceRule = require('./rules/emptySpaceRule');
import blockFormattingRule = require('./rules/blockFormattingRule');
import foldBlockFormattingRule = require('./rules/foldBlockFormattingRule');
import alignmentRule = require('./rules/alignmentRule');
import middleAlignmentRule = require('./rules/middleAlignmentRule');
import sizeRule = require('./rules/sizeRule');
import cssVerticalBottomRule = require('./rules/cssVerticalBottomRule');

import cssMarginRule = require('./rules/cssMarginRule');

export class RuleRunner {
	rules: Rules.Rule[];
	context: Context.Context;

	constructor(rules: Rules.Rule[], context: Context.Context) {
		this.rules = rules;
		this.context = context;
	}

	runSingleRuleOn(component: c.Component, rule: Rules.Rule): boolean {
		var updated = false;
		var attrsForComponents = rule(component, this.context);
		if (attrsForComponents) {
			var parent = component.getParent();
			attrsForComponents.forEach((attrsForComponent) => {
				var component = attrsForComponent.component;
				assert(component != parent);
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
			updated = this.runAllRulesOn(component);

			if (!updated) {
				Children.getLogicalFrom(component).breadthFirst((child) => {
					updated = this.runAllRulesOn(child);
					if (updated) {
						return Children.STOP_RECURSION;
					}
				});
			}
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
			for (var i = 0; i < this.rules.length; ++i) {
				var rule = this.rules[i];
				var isFirstRule = i === 0;
				updated = this.runSingleRuleOn(component, rule);
				if (!updated) {
					Children.getLogicalFrom(component).breadthFirst((child) => {
						updated = this.runSingleRuleOn(child, rule);
						if (updated && !isFirstRule) {
							return Children.STOP_ITERATION;
						}
					});
				}
				if (updated && !isFirstRule) {
					break;
				}
			};
		} while (updated);
	}
}


/* These do not change the children attributes */

export class UserSpecifiedRuleRunner extends IndependentRuleRunner {
	constructor(context: Context.Context) {
		super([
			dynamicBoxRule,
			percentChildRule,
		], context);
	}
}

export class SizeRuleRunner extends IndependentRuleRunner {
	constructor(context: Context.Context) {
		super([
			sizeRule.sizeUserExplicit,
			sizeRule.sizePercentChildren,
			sizeRule.sizeExpandedChildren,
			sizeRule.sizeShrink,
		], context);
	}
}


/* These change children attributes */

export class LayoutRuleRunner extends PreferenceRuleRunner {
	constructor(context: Context.Context) {
		super([
			// TODO: Put these into an independent group
			sizeRule.sizeByChildrenSum,
			blockFormattingRule,

			coalesceSpacesRule,
			foldBlockFormattingRule,

			/*
			alignmentRule,
			middleAlignmentRule,
			cssVerticalBottomRule,

			// Hmm these don't look right:
			emptySpaceRule,
			*/
		], context);
	}
}

/*
export class CSSRuleRunner extends RestartRunner {
	constructor(context: Context.Context) {
		super([
			cssMarginRule,
		], context);
	}
}
*/

export class DefaultRuleRunner extends RuleRunner {
	private userSpecifiedRuleRunner: UserSpecifiedRuleRunner;
	private sizeRuleRunner: SizeRuleRunner;
	private layoutRuleRunner: LayoutRuleRunner;
	//private cssRuleRunner: CSSRuleRunner;

	constructor(context: Context.Context) {
		super([], context);

		this.userSpecifiedRuleRunner = new UserSpecifiedRuleRunner(context);
		this.sizeRuleRunner = new SizeRuleRunner(context);
		this.layoutRuleRunner = new LayoutRuleRunner(context);
		//this.cssRuleRunner = new CSSRuleRunner(context);
	}

	start(component: c.Component) {
		this.userSpecifiedRuleRunner.start(component);
		this.sizeRuleRunner.start(component);
		this.layoutRuleRunner.start(component);
		//this.cssRuleRunner.start(component);
	}
}

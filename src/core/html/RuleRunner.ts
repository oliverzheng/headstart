import Rules = require('./Rules');
import Attributes = require('./Attributes');
import Context = require('./Context');
import c = require('./Component');

import dynamicBoxRule = require('./rules/dynamicBoxRule');
import percentChildRule = require('./rules/percentChildRule');
import coalesceSpacesRule = require('./rules/coalesceSpacesRule');
import emptySpaceRule = require('./rules/emptySpaceRule');
import verticalRule = require('./rules/verticalRule');
import foldChildrenRule = require('./rules/foldChildrenRule');
import alignmentRule = require('./rules/alignmentRule');
import middleAlignmentRule = require('./rules/middleAlignmentRule');
import sizeRule = require('./rules/sizeRule');
import cssVerticalBottomRule = require('./rules/cssVerticalBottomRule');

import cssMarginRule = require('./rules/cssMarginRule');


export class RuleRunner {
	private rules: Rules.Rule[];
	private context: Context.Context;

	constructor(rules: Rules.Rule[], context: Context.Context) {
		this.rules = rules;
		this.context = context;
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
			var attrsForComponents = rule(component, this.context);
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

export class LayoutRuleRunner extends RuleRunner {
	constructor(context: Context.Context) {
		super([
			dynamicBoxRule,
			sizeRule,
			percentChildRule,
			coalesceSpacesRule,
			emptySpaceRule,
			verticalRule,
			foldChildrenRule,
			alignmentRule,
			middleAlignmentRule,
			cssVerticalBottomRule,
		], context);
	}
}

export class CSSRuleRunner extends RuleRunner {
	constructor(context: Context.Context) {
		super([
			cssMarginRule,
		], context);
	}
}

export class DefaultRuleRunner extends RuleRunner {
	private layoutRuleRunner: LayoutRuleRunner;
	private cssRuleRunner: CSSRuleRunner;

	constructor(context: Context.Context) {
		super([], context);

		this.layoutRuleRunner = new LayoutRuleRunner(context);
		this.cssRuleRunner = new CSSRuleRunner(context);
	}

	start(component: c.Component) {
		this.layoutRuleRunner.start(component);
		this.cssRuleRunner.start(component);
	}
}

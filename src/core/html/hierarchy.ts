import assert = require('assert');

import c = require('./Component');
import p = require('./patterns');
import Rules = require('./Rules');

export interface PatternRule {
	(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[];
}

export interface RuleHierarchy {
	name?: string; // For debugging
	patterns?: p.Pattern<any>[];
	rule?: PatternRule;
	ifMatch?: RuleHierarchy[];
	otherwise?: RuleHierarchy[];
}

function getMatchingRules(component: c.Component, hierarchy: RuleHierarchy, patternMatches: p.PatternMatches): PatternRule[] {
	var rules: PatternRule[] = [];
	var passes = !hierarchy.patterns || hierarchy.patterns.every(
		(pattern: p.Pattern<any>) => patternMatches.getMatch(component, pattern)
	);
	if (passes) {
		assert(!(hierarchy.rule && hierarchy.ifMatch));
		if (hierarchy.rule) {
			rules.push(hierarchy.rule);
		} else if (hierarchy.ifMatch) {
			hierarchy.ifMatch.forEach((ifHierarchy) => {
				rules.push.apply(rules, getMatchingRules(component, ifHierarchy, patternMatches));
			});
		}
	} else if (hierarchy.otherwise) {
		hierarchy.otherwise.forEach((otherHierarchy) => {
			rules.push.apply(rules, getMatchingRules(component, otherHierarchy, patternMatches));
		});
	}
	return rules;
}

export function getRuleFromHierarchies(hierarchies: RuleHierarchy[]): Rules.Rule {
	return (component: c.Component) => {
		var patternMatches = new p.PatternMatches;
		var rules: PatternRule[] = [];
		hierarchies.forEach((hierarchy) => {
			rules.push.apply(rules, getMatchingRules(component, hierarchy, patternMatches));
		});
		assert(rules.length <= 1);
		if (rules.length > 0) {
			return rules[0](component, patternMatches);
		}
	};
}

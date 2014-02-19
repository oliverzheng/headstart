import assert = require('assert');

import util = require('../../util');

import Rules = require('./Rules');
import Attributes = require('./Attributes');
import Context = require('./Context');
import c = require('./Component');

import NodeAttribute = require('./attributes/NodeAttribute');
import percentChildRule = require('./rules/percentChildRule');

import BlockFormat = require('./attributes/BlockFormat');
import InlineFormat = require('./attributes/InlineFormat');
import Alignment = require('./attributes/Alignment');
import FloatFormat = require('./attributes/FloatFormat');
import TextContent = require('./attributes/TextContent');
import Background = require('./attributes/Background');
import LineHeight = require('./attributes/LineHeight');
import CSSAttribute = require('./attributes/CSSAttribute');

import userSpecifiedBucket = require('./rules/userSpecifiedBucket');
import sizingBucket = require('./rules/sizingBucket');
import reduceBucket = require('./rules/reduceBucket');
import alignmentBucket = require('./rules/alignmentBucket');
import renderingBucket = require('./rules/renderingBucket');
import applyCssBucket = require('./rules/applyCssBucket');
import bubbleBucket = require('./rules/bubbleBucket');
import cssBucket = require('./rules/cssBucket');
import nodeBucket = require('./rules/nodeBucket');
import tagBucket = require('./rules/tagBucket');

export interface RuleWithName {
	name: string;
	rule: Rules.Rule;
}

export class RuleRunner {
	rulesPrefix: string;
	rules: RuleWithName[];
	context: Context.Context;

	constructor(rulesPrefix: string, rules: RuleWithName[], context: Context.Context) {
		this.rulesPrefix = rulesPrefix;
		this.rules = rules;
		this.context = context;
	}

	start(component: c.Component) {
		var overallUpdated = false;
		var updated: boolean;
		do {
			updated = false;
			component.iterateChildrenBreadthFirst((child) => {
				updated = this.runAllRulesOn(child);
				if (updated) {
					overallUpdated = true;
					return c.STOP_RECURSION;
				}
			});
		} while (updated);
		return overallUpdated;
	}

	runSingleRuleOn(component: c.Component, rule: RuleWithName): boolean {
		var updated = false;
		var attrsForComponents = rule.rule(component, this.context);
		if (attrsForComponents) {
			attrsForComponents.forEach((attrsForComponent) => {
				var changedComponent = attrsForComponent.component;

				var deleteAttrs = attrsForComponent.deleteAttributes;
				if (deleteAttrs && deleteAttrs.length > 0) {
					deleteAttrs.forEach(
						(attrType) => changedComponent.deleteAttr(attrType)
					);
					updated = true;
				}

				var attrs = attrsForComponent.attributes;
				if (attrs) {
					updated = changedComponent.addAttributes(attrs) || updated;
					attrs.forEach((attr) => attr.addRule(this.rulesPrefix + '.' + rule.name, component.id));
				}

				var replaceAttrs = attrsForComponent.replaceAttributes;
				if (replaceAttrs) {
					updated = changedComponent.replaceAttributes(replaceAttrs) || updated;
					replaceAttrs.forEach((attr) => attr.addRule(this.rulesPrefix + '.' + rule.name, component.id));
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

export var renderingBuckets: Rules.Bucket[] = [
	userSpecifiedBucket,
	sizingBucket,
];

export var allBuckets: Rules.Bucket[] = [
	// All box attributes there.
	userSpecifiedBucket,

	// All sizes that can be calculated are calculated.
	sizingBucket,

	// Unnecessary components are removed
	reduceBucket,

	// Alignment is figured out
	alignmentBucket,

	// Necessary components are created and the rendered CSS values of each
	// component are attached.
	renderingBucket,

	applyCssBucket,

	// Bubble up rendering values up into assigned CSS values
	bubbleBucket,

	// Assign the rest of CSS properties
	cssBucket,

	nodeBucket,

	// Assign tag names
	tagBucket,
];

export class BucketRunner {
	buckets: Rules.Bucket[];
	context: Context.Context;

	constructor(buckets: Rules.Bucket[], context: Context.Context) {
		this.buckets = buckets;
		this.context = context;
	}
	
	start(component: c.Component): boolean {
		var overallUpdated = false;
		do {
			var updated = false;
			for (var i = 0; i < this.buckets.length; ++i) {
				var bucket = this.buckets[i];
				var runner = new RuleRunner(bucket.name, bucket.rules, this.context);
				var updated = runner.start(component);
				if (updated) {
					overallUpdated = true;
					break;
				}
			}
		} while (updated);
		return overallUpdated;
	}
}

export function runOn(component: c.Component, context: Context.Context, logs: string[], buckets: Rules.Bucket[] = allBuckets) {
	var bucketRunner = new BucketRunner(buckets, context);
	bucketRunner.start(component);
}

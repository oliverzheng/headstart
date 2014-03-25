import assert = require('assert');

import Rules = require('../Rules');
import c = require('../Component');
import Markup = require('../Markup');
import CSSAttribute = require('../attributes/CSSAttribute');
import sinf = require('../../spec/interfaces');
import p = require('../patterns');
import h = require('../hierarchy');

import styling = require('./rendering/styling');
import alignment = require('./rendering/alignment');
import sizing = require('./rendering/sizing');
import spacing = require('./rendering/spacing');

var rules: Rules.RuleWithName[] = [];

rules.push.apply(rules, styling);
//rules.push.apply(rules, alignment);
rules.push.apply(rules, sizing);
rules.push.apply(rules, spacing);

var bucket: Rules.Bucket = {
	name: 'rendering',
	rules: rules,
};

var isHorizontalCenterOrRight = p.any([
	p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.center),
	p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.far),
]);

var isVerticalMiddleOrBottom = p.any([
	p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.center),
	p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.far),
]);

var needsAbsolutePositioning = p.all(<p.Pattern<any>[]>[
	isVerticalMiddleOrBottom,
	// Parent has unknown height
	p.not(p.getKnownHeight),
	// Content has known height
	p.is(p.getOnlyContentChild, p.getKnownHeight),
]);

var needsTableCell = p.all([
	// Content has unknown height
	isVerticalMiddleOrBottom,
	p.not(p.is(p.getOnlyContentChild, p.getKnownHeight)),
]);


var horizontalAlignment: h.RuleHierarchy[] = [{
	name: 'horizontalAlignment',
	patterns: [
		p.isNode,
		p.getOnlyContentChild,
		isHorizontalCenterOrRight,
	],
	ifMatch: [{
		// Just text
		patterns: [
			p.is(p.getOnlyContentChild, p.isText),
			// TODO what happens if they aren't shrink?
			p.is(p.getOnlyContentChild, p.isShrinkWidth),
			p.is(p.getOnlyContentChild, p.isShrinkHeight),
		],
		ifMatch: [{
			patterns: [
				needsAbsolutePositioning,
			],
			rule: alignment.textAlignExtendWidth,

			otherwise: [{
				rule: alignment.textAlign,
			}],
		}],

		otherwise: [{
			// Absolute positioning
			patterns: [
				needsAbsolutePositioning,
			],
			rule: alignment.horizontalNegativeMargin,

			otherwise: [{
				// Normal known widths
				rule: alignment.marginAuto,
			}],
		}],
	}],
}];

var verticalAlignment: h.RuleHierarchy[] = [{
	name: 'verticalAlignment',
	patterns: [
		p.isNode,
		p.getOnlyContentChild,
		isVerticalMiddleOrBottom,
	],
	ifMatch: [{
		// Table cell
		patterns: [
			needsTableCell,
		],
		rule: alignment.tableCell,

		otherwise: [{
			// Absolute positioning
			patterns: [
				needsAbsolutePositioning,
			],
			rule: alignment.verticalNegativeMargin,

			otherwise: [{
				// Text single line
				patterns: [
					p.is(p.getOnlyContentChild, p.isText),
					p.is(p.getOnlyContentChild, p.isShrinkWidth),
					p.is(p.getOnlyContentChild, p.isShrinkHeight),
					p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.center),
					p.is(p.getOnlyContentChild, p.isText1Line),
				],
				rule: alignment.lineHeightToHeight,

				otherwise: [{
					// Known height contents
					rule: alignment.verticalCenterKnownSizes,
				}],
			}],
		}],
	}],
}];

rules.push({ name: 'horizontalAlignment', rule: h.getRuleFromHierarchies(horizontalAlignment)});
rules.push({ name: 'verticalAlignment', rule: h.getRuleFromHierarchies(verticalAlignment)});

export = bucket;

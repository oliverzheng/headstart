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

var horizontalAlignment: h.RuleHierarchy[] = [{
	name: 'horizontalAlignment',
	patterns: [
		p.isNode,
		p.isHorizontalAligned,
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
				p.needsAbsolutePositioning,
			],
			ifMatch: [{
				// Center align
				patterns: [
					p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.center),
				],
				rule: alignment.textAlignExtendWidth,

				// Right align
				otherwise: [{
					rule: alignment.horizontalRightZero,
				}]
			}],

			otherwise: [{
				rule: alignment.textAlign,
			}],
		}],

		otherwise: [{
			// Table cell positioning
			patterns: [
				p.needsTableCell,
			],
			rule: alignment.marginAuto,

			otherwise: [{
				// Absolute positioning
				patterns: [
					p.needsAbsolutePositioning,
				],
				ifMatch: [{
					// Center
					patterns: [
						p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.center),
					],
					rule: alignment.horizontalNegativeMargin,

					// Right
					otherwise: [{
						rule: alignment.horizontalRightZero,
					}],
				}],

				otherwise: [{
					// Normal known widths
					rule: alignment.marginAuto,
				}],
			}],
		}],
	}],
}];

var verticalAlignment: h.RuleHierarchy[] = [{
	name: 'verticalAlignment',
	patterns: [
		p.isNode,
		p.isVerticalAligned,
	],
	ifMatch: [{
		// Table cell
		patterns: [
			p.needsTableCell,
		],
		rule: alignment.tableCell,

		otherwise: [{
			// Absolute positioning
			patterns: [
				p.needsAbsolutePositioning,
			],
			ifMatch: [{
				// Middle
				patterns: [
					p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.center),
				],
				rule: alignment.verticalNegativeMargin,

				otherwise: [{
					// Bottom
					rule: alignment.verticalBottomZero,
				}],
			}],

			otherwise: [{
				// Text single line
				patterns: [
					p.is(p.getOnlyContentChild, p.isText),
					p.is(p.getOnlyContentChild, p.isShrinkWidth),
					p.is(p.getOnlyContentChild, p.isShrinkHeight),
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

var stackNodes: h.RuleHierarchy[] = [{
	name: 'stackNodes',
	patterns: [
		p.isNode,
		p.not(
			p.any([
				p.isHorizontalAligned,
				p.isVerticalAligned,
			])
		),
		p.getNodeDescendents,
	],
	rule: spacing.stackSpacing,
}];

rules.push({ name: 'horizontalAlignment', rule: h.getRuleFromHierarchies(horizontalAlignment)});
rules.push({ name: 'verticalAlignment', rule: h.getRuleFromHierarchies(verticalAlignment)});
rules.push({ name: 'stackNodes', rule: h.getRuleFromHierarchies(stackNodes)});

export = bucket;

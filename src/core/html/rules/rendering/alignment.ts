import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../../Component');
import Rules = require('../../Rules');
import NodeAttribute = require('../../attributes/NodeAttribute');
import StackedChildren = require('../../attributes/StackedChildren');
import BlockFormat = require('../../attributes/BlockFormat');
import Alignment = require('../../attributes/Alignment');
import CSSAttribute = require('../../attributes/CSSAttribute');
import LengthAttribute = require('../../attributes/LengthAttribute');
import TextContent = require('../../attributes/TextContent');
import BoxModel = require('../../attributes/BoxModel');
import LineHeight = require('../../attributes/LineHeight');
import getDirection = require('../../patterns/getDirection');
import getCrossAlignment = require('../../patterns/getCrossAlignment');
import sinf = require('../../../spec/interfaces');
import reqs = require('../../requirements');
import patterns = require('./patterns');
import util = require('../../util');

// This file brought to you by
// http://coding.smashingmagazine.com/2013/08/09/absolute-horizontal-vertical-centering-css/

function isJustTextHorizontalAligned(component: c.Component, alignment: sinf.Alignment): boolean {
	var alignmentReq = reqs.eitherOr(
		reqs.fromDirectionAlignment(sinf.horiz, alignment),
		reqs.parent(
			reqs.all([
				reqs.vert,
				reqs.shrinkW,
			])
		)
	);
	var textReq = reqs.all([
		reqs.isContentText,
		reqs.shrinkW,
		reqs.shrinkH,
		alignmentReq,
	]);
	return reqs.satisfies(component,
		reqs.all([
			reqs.not(reqs.shrinkW),
			// The text has to be shrunk, and all else have to be spaces
			reqs.anyDescendentsOptional(
				textReq,
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			// And all the ancestors of that have to be aligned.
			reqs.anyDescendentsWithAncestors(
				textReq,
				alignmentReq
			),
		])
	);
}

function horizontalCenterText(component: c.Component): Rules.RuleResult[] {
	if (!isJustTextHorizontalAligned(component, sinf.center))
		return;

	return [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': 'center',
			}),
		],
	}];
}

function horizontalRightText(component: c.Component): Rules.RuleResult[] {
	if (!isJustTextHorizontalAligned(component, sinf.far))
		return;

	return [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': 'right',
			}),
			new BlockFormat(),
		],
	}];
}

function marginAutoRule(component: c.Component): Rules.RuleResult[] {
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.anyChildrenOptional(
				// At least 1 center aligned element
				reqs.all([
					reqs.hasContent,
					reqs.eitherOr(
						reqs.c,
						reqs.r
					),
					reqs.not(reqs.isContentText),
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.horiz,
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	assert(alignment && (alignment.center || alignment.far));

	var child = alignment.center || alignment.far;
	var styles = {
		'margin-left': 'auto',
	};
	if (child === alignment.center) {
		styles['margin-right'] = 'auto';
	}

	return [{
		component: child,
		attributes: [
			new CSSAttribute(styles),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new BlockFormat(),
		],
	}];
}

function singleLineHeight(component: c.Component): Rules.RuleResult[] {
	var text = patterns.containsSingleLineVerticallyCenteredTextWithKnownHeight(component);
	if (!text)
		return;

	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);
	assert(parentHeight && parentHeight.px.isSet());

	return [{
		component: text,
		replaceAttributes: [
			new LineHeight(parentHeight.px.value),
		],
	}];
}

function negativeMargin(component: c.Component): Rules.RuleResult[] {
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.vert,
			reqs.eitherOr(
				reqs.not(reqs.knownH),
				reqs.runtimeH
			),
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.hasContent,
					reqs.m,
					reqs.knownH,
				]),
				reqs.not(reqs.hasContent)
			),
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.vert);
	assert(alignment && alignment.center);

	var height = LengthAttribute.getFrom(alignment.center, sinf.vert);
	assert(height && height.px.isSet());

	return [{
		component: alignment.center,
		attributes: [
			new CSSAttribute({
				'position': 'absolute',
				'top': '50%',
				'margin-top': (-height.px.value / 2).toString() + 'px',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new CSSAttribute({
				'position': 'relative',
			}),
		],
	}];
}

function tableCell(component: c.Component): Rules.RuleResult[] {
	var satisfies = reqs.satisfies(component,
		reqs.all([
			// Parent can be of known or unknown height
			reqs.vert,

			// This component is going to be the table-cell guy
			reqs.not(
				reqs.hasCSS({
					'display': 'table-cell',
				})
			),
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.hasContent,
					reqs.m,
					// Child is of unknown height
					reqs.eitherOr(
						reqs.not(reqs.knownH),
						reqs.runtimeH
					),
				]),
				reqs.not(reqs.hasContent)
			),
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.vert);
	assert(alignment && alignment.center);

	var results = component.getParent().getChildrenManager().wrapChild(component);

	var outer = results[1].component;
	var inner = component;

	results.push({
		component: inner,
		attributes: [
			new CSSAttribute({
				'display': 'table-cell',
				'vertical-align': 'middle',
			}),
		],
	});
	results.push({
		component: outer,
		attributes: [
			new CSSAttribute({
				'display': 'table',
			}),
		],
	});

	return results;
}

/*
function floatRule(component: c.Component): Rules.RuleResult[] {
	if (!getDirection(component) === sinf.horiz ||
		!getCrossAlignment(component) === sinf.near)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	if (!alignment)
		return;

	// Only aligned children on the left and right can be floated
	if (alignment.afterNear || alignment.afterCenter || alignment.center)
		return;

	if (isJustTextHorizontalAligned(component))
		return;

	var results: Rules.RuleResult[] = [];

	return [{
		component: component,
		attributes: [new FloatFormat()],
	}]
}
*/

var rules: Rules.RuleWithName[] = [
	{name: 'horizontalCenterText', rule: horizontalCenterText},
	{name: 'horizontalRightText', rule: horizontalRightText},
	{name: 'marginAutoRule', rule: marginAutoRule},
	{name: 'singleLineHeight', rule: singleLineHeight},
	{name: 'negativeMargin', rule: negativeMargin},
	{name: 'tableCell', rule: tableCell},
];

export = rules;

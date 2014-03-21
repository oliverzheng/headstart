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

function getMiddleKnownParentUnknown(parent: c.Component): c.Component {
	return patterns.findAlignedContent(
		parent,
		sinf.vert,
		sinf.center,
		reqs.knownH, 
		reqs.eitherOr(
			reqs.not(reqs.knownH),
			reqs.runtimeH
		)
	);
}

function centerIsAbsolute(parent: c.Component, center: c.Component): boolean {
	return (
		reqs.satisfies(center, reqs.hasCSS({'position': 'absolute'})) ||
		getMiddleKnownParentUnknown(parent) === center
	);
}

// This file brought to you by
// http://coding.smashingmagazine.com/2013/08/09/absolute-horizontal-vertical-centering-css/

function isJustTextHorizontalAligned(component: c.Component, alignment: sinf.Alignment): c.Component {
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
	var captures: c.Component[] = []
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.not(reqs.shrinkW),
			// The text has to be shrunk, and all else have to be spaces
			reqs.anyDescendentsOptional(
				reqs.capture(textReq, captures),
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
	if (!satisfies)
		return null;
	assert(captures.length > 0);
	return captures[0];
}

function horizontalCenterText(component: c.Component): Rules.RuleResult[] {
	var center = isJustTextHorizontalAligned(component, sinf.center);
	if (!center)
		return;


	var results: Rules.RuleResult[] = [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': 'center',
			}),
		],
	}];

	if (centerIsAbsolute(component, center)) {
		results.push({
			component: center,
			attributes: [
				new CSSAttribute({
					'width': '100%',
				}),
			],
		});
	}

	return results;
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
		],
	}];
}

function marginAutoRule(component: c.Component): Rules.RuleResult[] {
	// First, find the center/right components that are the most descendent-y
	var centerComponent = patterns.findAlignedContent(
		component,
		sinf.horiz,
		sinf.center,
		// Content
		reqs.not(reqs.isContentText)
	);

	var rightComponent = patterns.findAlignedContent(
		component,
		sinf.horiz,
		sinf.far,
		// Content
		reqs.not(reqs.isContentText)
	);

	// We cannot include these reqs above, since it may just match the parent of
	// a centered component we actually want to center.
	if (centerComponent && centerIsAbsolute(component, centerComponent))
		centerComponent = null;
	if (rightComponent && centerIsAbsolute(component, rightComponent))
		rightComponent = null;

	if (!centerComponent && !rightComponent)
		return;
	assert(!!centerComponent !== !!rightComponent); // only 1 for now

	var child = centerComponent || rightComponent;
	var styles = {
		'margin-left': 'auto',
	};
	if (child === centerComponent) {
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
	var middleComponent = getMiddleKnownParentUnknown(component);
	if (!middleComponent)
		return;

	var height = LengthAttribute.getFrom(middleComponent, sinf.vert);
	assert(height && height.px.isSet());

	return [{
		component: middleComponent,
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
	var middleComponent = patterns.findAlignedContent(
		component,
		sinf.vert,
		sinf.center,
		// Content
		reqs.eitherOr(
			reqs.not(reqs.knownH),
			reqs.runtimeH
		)
	);
	if (!middleComponent)
		return;

	// If we already applied this rule, don't do it again.
	if (reqs.satisfies(component, reqs.hasCSS({'display': 'table-cell'})))
		return;

	var results = component.getParent().getChildrenManager().wrapChild(component);

	var wrapper = results[1].component;

	results.push({
		component: component,
		attributes: [
			new CSSAttribute({
				'display': 'table-cell',
				'vertical-align': 'middle',
			}),
		],
	});
	results.push({
		component: wrapper,
		attributes: [
			new CSSAttribute({
				'display': 'table',
			}),
		],
	});

	return results;
}

function verticalCenterKnownSizes(component: c.Component): Rules.RuleResult[] {
	if (patterns.containsSingleLineVerticallyCenteredTextWithKnownHeight(component))
		return;

	var middleComponent = patterns.findAlignedContent(
		component,
		sinf.vert,
		sinf.center,
		// Content
		reqs.all([
			reqs.knownH,
			reqs.not(reqs.runtimeH),
		]),
		reqs.all([
			reqs.knownH,
			reqs.not(reqs.runtimeH),
		])
	);
	if (!middleComponent)
		return;

	if (reqs.satisfies(middleComponent, reqs.all([
			reqs.isContentText,
			reqs.textLines(1),
		])))
		return;

	var outerHeight = LengthAttribute.getFrom(component, sinf.vert);
	assert(outerHeight && outerHeight.px.isSet());
	var innerHeight = LengthAttribute.getFrom(middleComponent, sinf.vert);
	assert(innerHeight && innerHeight.px.isSet());

	var length = (outerHeight.px.value - innerHeight.px.value) / 2;
	return [{
		component: component,
		attributes: [
			new BoxModel(null, {
				t: length,
				b: length,
			}),
		],
	}];
}

function horizontalCenterKnownSizes(component: c.Component): Rules.RuleResult[] {
	var centerComponent = patterns.findAlignedContent(
		component,
		sinf.horiz,
		sinf.center,
		// Content
		reqs.all([
			reqs.knownW,
			reqs.not(reqs.runtimeW),
		]),
		reqs.all([
			reqs.knownW,
			reqs.not(reqs.runtimeW),
		])
	);
	if (!centerComponent)
		return;

	if (reqs.satisfies(centerComponent, reqs.all([
			reqs.isContentText,
			reqs.textLines(1),
		])))
		return;

	// Margin-auto takes care of most cases
	if (!centerIsAbsolute(component, centerComponent))
		return;

	var outerWidth = LengthAttribute.getFrom(component, sinf.horiz);
	assert(outerWidth && outerWidth.px.isSet());
	var innerWidth = LengthAttribute.getFrom(centerComponent, sinf.horiz);
	assert(innerWidth && innerWidth.px.isSet());

	var length = (outerWidth.px.value - innerWidth.px.value) / 2;
	return [{
		component: component,
		attributes: [
			new BoxModel(null, {
				l: length,
				r: length,
			}),
		],
	}];
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
	{name: 'verticalCenterKnownSizes', rule: verticalCenterKnownSizes},
	{name: 'horizontalCenterKnownSizes', rule: horizontalCenterKnownSizes},
	{name: 'tableCell', rule: tableCell},
];

export = rules;

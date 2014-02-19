import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../../Component');
import Rules = require('../../Rules');
import NodeAttribute = require('../../attributes/NodeAttribute');
import BlockFormat = require('../../attributes/BlockFormat');
import Alignment = require('../../attributes/Alignment');
import CSSAttribute = require('../../attributes/CSSAttribute');
import LengthAttribute = require('../../attributes/LengthAttribute');
import TextContent = require('../../attributes/TextContent');
import BoxModel = require('../../attributes/BoxModel');
import getDirection = require('../../patterns/getDirection');
import getCrossAlignment = require('../../patterns/getCrossAlignment');
import sinf = require('../../../spec/interfaces');
import util = require('../../../spec/util');
import reqs = require('../../requirements');

function isJustTextHorizontalAligned(component: c.Component): boolean {
	return reqs.satisfies(component,
		reqs.all([
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.any([
						reqs.l,
						reqs.c,
						reqs.r,
					]),
					reqs.isContentText,
					reqs.shrinkW,
					reqs.shrinkH,
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.knownW,
		])
	);
}

function horizontalCenterText(component: c.Component): Rules.RuleResult[] {
	if (!isJustTextHorizontalAligned(component))
		return;

	var satisfies = reqs.satisfies(component,
		reqs.anyChildrenOptional(
			reqs.all([
				reqs.c,
				reqs.isContentText,
			]),
			// Optional spaces
			reqs.not(reqs.hasContent)
		)
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	assert(alignment);

	return [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': 'center',
			}),
			new BlockFormat(),
		],
	}];
}

function horizontalRightText(component: c.Component): Rules.RuleResult[] {
	if (!isJustTextHorizontalAligned(component))
		return;

	var satisfies = reqs.satisfies(component,
		reqs.anyChildrenOptional(
			reqs.all([
				reqs.r,
				reqs.isContentText,
			]),
			// Optional spaces
			reqs.not(reqs.hasContent)
		)
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	assert(alignment);

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
					reqs.c,
					reqs.knownW,
					reqs.not(reqs.isContentText),
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.knownW,
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	assert(alignment && alignment.center);

	return [{
		component: alignment.center,
		attributes: [
			new CSSAttribute({
				'margin-left': 'auto',
				'margin-right': 'auto',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new BlockFormat(),
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
];

export = rules;

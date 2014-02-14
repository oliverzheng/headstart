import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import Alignment = require('../attributes/Alignment');
import CSSAttribute = require('../attributes/CSSAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import TextContent = require('../attributes/TextContent');
import BoxModel = require('../attributes/BoxModel');
import sinf = require('../../spec/interfaces');
import util = require('../../spec/util');
import reqs = require('../requirements');

export function isJustTextHorizontalAligned(component: c.Component): boolean {
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

export function horizontalCenterText(component: c.Component): Rules.RuleResult[] {
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
		],
	}];
}

export function horizontalRightText(component: c.Component): Rules.RuleResult[] {
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
		],
	}];
}

export function verticalCenterKnownSizes(component: c.Component): Rules.RuleResult[] {
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.m,
					reqs.hasContent,
					reqs.knownH,
					reqs.isNode,
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.knownH,
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.vert);
	assert(alignment && alignment.center);

	var outerHeight = LengthAttribute.getFrom(component, sinf.vert);
	assert(outerHeight && outerHeight.px.isSet());
	var innerHeight = LengthAttribute.getFrom(alignment.center, sinf.vert);
	assert(innerHeight && innerHeight.px.isSet());

	var length = (outerHeight.px.value - innerHeight.px.value) / 2;
	var px = length.toString() + 'px';

	var firstParentNode: c.Component = null;
	var isFirstNode: boolean;
	var isLastNode = true;
	reqs.satisfies(alignment.center,
		reqs.firstAncestor(
			// If the immediate parent node...
			reqs.isNode,
			// ... has dom elements before it
			reqs.custom((ancestor: c.Component) => {
				firstParentNode = ancestor;

				ancestor.iterateChildrenBreadthFirst((descendent) => {
					if (descendent === ancestor)
						return;

					if (isFirstNode == null) {
						if (descendent.nodeAttr()) {
							isFirstNode = descendent === alignment.center;
						}
					}

					isLastNode = descendent === alignment.center;

					if (descendent === alignment.center)
						return c.STOP_RECURSION;
				});
			})
		)
	);
	assert(firstParentNode);
	if (!reqs.satisfies(firstParentNode, reqs.knownH))
		return;

	var componentStyles: {[name: string]: string;} = {};
	var parentAttributes: Attributes.BaseAttribute[] = [];
	if (isFirstNode) {
		parentAttributes.push(new BoxModel(null, { t: length }));
	} else {
		componentStyles['margin-top'] = px;
	}

	if (isLastNode) {
		parentAttributes.push(new BoxModel(null, { b: length }));
	} else {
		componentStyles['margin-bottom'] = px;
	}

	return [{
		component: alignment.center,
		attributes: [
			new CSSAttribute(componentStyles),
		],
	}, {
		component: firstParentNode,
		attributes: parentAttributes,
	}];
}

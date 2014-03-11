import assert = require('assert');

import Rules = require('../../Rules');
import Attributes = require('../../Attributes');
import c = require('../../Component');
import NodeAttribute = require('../../attributes/NodeAttribute');
import StackedChildren = require('../../attributes/StackedChildren');
import Alignment = require('../../attributes/Alignment');
import LineHeight = require('../../attributes/LineHeight');
import TextContent = require('../../attributes/TextContent');
import BoxModel = require('../../attributes/BoxModel');
import Spacing = require('../../attributes/Spacing');
import LengthAttribute = require('../../attributes/LengthAttribute');
import CSSAttribute = require('../../attributes/CSSAttribute');
import BlockFormat = require('../../attributes/BlockFormat');
import getDirection = require('../../patterns/getDirection');
import sinf = require('../../../spec/interfaces');
import sutil = require('../../../spec/util');
import reqs = require('../../requirements');
import patterns = require('./patterns');

function verticalCenterKnownSizes(component: c.Component): Rules.RuleResult[] {
	if (patterns.containsSingleLineVerticallyCenteredText(component))
		return;

	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.vert,
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.m,
					reqs.hasContent,
					reqs.knownH,
					reqs.not(reqs.runtimeH),
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.knownH,
			reqs.not(reqs.runtimeH),
			reqs.parent(reqs.knownH),
		])
	);
	if (!satisfies)
		return;

	var parent = component.getParent();
	var isFirst = true;
	var isLast = true;
	if (parent) {
		var children = parent.getChildren();
		isFirst = children[0] === component;
		isLast = children[children.length - 1] === component;
	}

	var alignment = Alignment.getFrom(component, sinf.vert);
	assert(alignment && alignment.center);

	var outerHeight = LengthAttribute.getFrom(component, sinf.vert);
	assert(outerHeight && outerHeight.px.isSet());
	var innerHeight = LengthAttribute.getFrom(alignment.center, sinf.vert);
	assert(innerHeight && innerHeight.px.isSet());

	var length = (outerHeight.px.value - innerHeight.px.value) / 2;
	var px = length.toString() + 'px';

	var componentStyles: {[name: string]: string;} = {};
	var parentAttributes: Attributes.BaseAttribute[] = [];
	if (isFirst) {
		parentAttributes.push(new BoxModel(null, { t: length }));
	} else {
		componentStyles['margin-top'] = px;
	}

	if (isLast) {
		parentAttributes.push(new BoxModel(null, { b: length }));
	} else {
		componentStyles['margin-bottom'] = px;
	}

	var results: Rules.RuleResult[] = [{
		component: component,
		attributes: parentAttributes,
	}];
	if (Object.keys(componentStyles).length > 0) {
		results.push({
			component: alignment.center,
			attributes: [
				new CSSAttribute(componentStyles),
				new NodeAttribute(),
				new BlockFormat(),
			],
		});
	}

	return results;
}

function marginSpacing(component: c.Component): Rules.RuleResult[] {
	var parent = component.getParent();
	if (!parent)
		return;

	// Alignment'ed components should not take this path.
	if (!StackedChildren.getFrom(parent))
		return;

	var margin = getCenteredMargin(component);
	var direction = getDirection(parent);
	if (isSingleLine(component) && margin != null && direction === sinf.vert)
		return;

	var prev = StackedChildren.getPrevSibling(component);
	if (prev && !Spacing.getFrom(prev))
		prev = null;

	var next = StackedChildren.getNextSibling(component);
	if (next && !Spacing.getFrom(next))
		next = null;

	if (!prev && !next)
		return;

	var direction = getDirection(parent);
	var styles: { [styleName: string]: string; } = {};
	if (prev)
		styles[direction === sinf.horiz ? 'margin-left' : 'margin-top'] = LengthAttribute.getFrom(prev, direction).px.value + 'px';

	if (next) {
		// There is no margin folding for horizontal margins. We only
		// want to apply a margin-right if there won't be a component
		// using the same space as margin-left.
		if (direction !== sinf.horiz || !StackedChildren.getNextSibling(next)) {
			styles[direction === sinf.horiz ? 'margin-right' : 'margin-bottom'] = LengthAttribute.getFrom(next, direction).px.value + 'px';
		}
	}
	return [{
		component: component,
		attributes: [
			new CSSAttribute(styles),
			new BlockFormat(),
		],
	}];
}

function getCenteredMargin(component: c.Component): number {
	if (!component.getParent())
		return null;

	var direction = getDirection(component.getParent());

	var prev = StackedChildren.getPrevSibling(component);
	if (!prev || !Spacing.getFrom(prev))
		return null;
	var prevHeight = LengthAttribute.getFrom(prev, direction);
	if (!prevHeight || !prevHeight.px.isSet())
		return null;

	var next = StackedChildren.getNextSibling(component);
	if (!next || !Spacing.getFrom(next))
		return null;
	var nextHeight = LengthAttribute.getFrom(next, direction);
	if (!nextHeight || !nextHeight.px.isSet())
		return null;

	if (prevHeight.px.value !== nextHeight.px.value)
		return null;

	return prevHeight.px.value;
}

function isSingleLine(component: c.Component): boolean {
	var textAttr = TextContent.getFrom(component);
	if (!textAttr)
		return false;

	var lineHeightAttr = LineHeight.getFrom(component);
	if (!lineHeightAttr)
		return false;

	var boxLines = sutil.textExactLines(textAttr.getText());
	if (boxLines !== 1)
		return false;

	return true;
}

function verticallyCenteredSingleLine(component: c.Component): Rules.RuleResult[] {
	if (!component.getParent())
		return;

	var margin = getCenteredMargin(component);
	var direction = getDirection(component.getParent());
	if (isSingleLine(component) && margin != null && direction === sinf.vert) {
		var textAttr = TextContent.getFrom(component);

		return [{
			component: component,
			replaceAttributes: [
				new LineHeight(textAttr.getText().lineHeight + margin * 2),
			],
		}];
	}
}


var rules: Rules.RuleWithName[] = [
	{name: 'marginSpacing', rule: marginSpacing},
	{name: 'verticalCenterKnownSizes', rule: verticalCenterKnownSizes},
	{name: 'verticallyCenteredSingleLine', rule: verticallyCenteredSingleLine},
];

export = rules;

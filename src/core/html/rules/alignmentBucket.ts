import assert = require('assert');

import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import getDirection = require('../patterns/getDirection');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import StackedChildren = require('../attributes/StackedChildren');
import LengthAttribute = require('../attributes/LengthAttribute');
import Alignment = require('../attributes/Alignment');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

function expand(component: c.Component): Rules.RuleResult[] {
	var direction = getDirection(component);
	assert(!!direction);

	if (Alignment.getFrom(component, direction) ||
		Alignment.isAggregateInAlignment(component))
		return;

	var groups = groupChildren(component, (child) => {
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		var box = boxAttr.getBox();

		return sutil.lengthEquals(direction === sinf.horiz ? box.w : box.h, sinf.expand);
	});

	// At least some children need to have expand
	if (!groups || !groups.some((group) => group.matched)) {
		return;
	}

	assert(groups.length <= 5);

	var near: c.Component[];
	var afterNear: c.Component[];
	var center: c.Component[];
	var afterCenter: c.Component[];
	var far: c.Component[];

	var totalExpands = groups.filter((group) => group.matched).length;
	var expandsSeen = 0;
	groups.forEach((group) => {
		if (group.matched) {
			switch (expandsSeen) {
				case 0:
					afterNear = group.components;
					break;
				case 1:
					afterCenter = group.components;
					break;
				default:
					assert(false);
			}
			expandsSeen++;
		} else if (group.components.length > 0) {
			switch (expandsSeen) {
				case 0:
					near = group.components;
					break;
				case 1:
					if (totalExpands === 1) {
						far = group.components;
					} else if (totalExpands === 2) {
						center = group.components;
					}
					break;
				case 2:
					far = group.components;
					break;
				default:
					assert(false);
			}
		}
	});

	var aggregates = [
		near, afterNear, center, afterCenter, far
	].map(
		(components) => (components && components.some((comp) => hasBoxContent(comp))) ? components : null
	).map(
		StackedChildren.aggregate
	);
	var results = aggregates.filter((result) => !!result);

	var alignment = new Alignment(
		direction === sinf.horiz,
		aggregates[0] && aggregates[0].component,
		aggregates[1] && aggregates[1].component,
		aggregates[2] && aggregates[2].component,
		aggregates[3] && aggregates[3].component,
		aggregates[4] && aggregates[4].component,
		aggregates[0] && near && near.length > 1,
		aggregates[1] && afterNear && afterNear.length > 1,
		aggregates[2] && center && center.length > 1,
		aggregates[3] && afterCenter && afterCenter.length > 1,
		aggregates[4] && far && far.length > 1
	);
	results.push({
		component: component,
		attributes: [alignment],
		deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
	});

	return results;
}

function isLastChildAtFarEdge(component: c.Component): boolean {
	var direction = getDirection(component);

	var stackedChildren = StackedChildren.getFrom(component);
	assert(stackedChildren);

	var children = component.getChildren();
	assert(children.length > 0);

	var lastChild = children[children.length - 1];
	var lastChildPos = stackedChildren.getChildPosition(lastChild, null);
	var pos = sutil.getPosition<LengthAttribute>(lastChildPos, direction);
	var lastChildLength = LengthAttribute.getFrom(lastChild, direction);

	assert(pos && pos.px.isSet() && lastChildLength.px.isSet());

	var parentLength = LengthAttribute.getFrom(component, direction);
	assert(parentLength && parentLength.px.isSet());

	return (pos.px.value + lastChildLength.px.value) === parentLength.px.value;
}

function equalSizes(component: c.Component): Rules.RuleResult[] {
	var direction = getDirection(component);
	assert(!!direction);

	var stackedChildren = StackedChildren.getFrom(component);
	if (!stackedChildren)
		return;

	if (Alignment.getFrom(component, direction) ||
		Alignment.isAggregateInAlignment(component))
		return;

	var childrenAllHaveLengths = component.getChildren().every((child) => {
		var length = LengthAttribute.getFrom(child, direction);
		return length && length.px.isSet();
	});
	if (!childrenAllHaveLengths)
		return;

	var parentLength = LengthAttribute.getFrom(component, direction);
	if (!parentLength || !parentLength.px.isSet())
		return;

	var groups = groupChildren(component, hasBoxContent);
	if (!groups || groups.length === 0 || groups.length > 3) {
		return;
	}

	var near: c.Component[];
	var afterNear: c.Component[];
	var center: c.Component[];
	var afterCenter: c.Component[];
	var far: c.Component[];

	if (groups.length === 1) {
		if (groups[0].matched) {
			near = groups[0].components;
		}
		// else: otherwise, it's just space. Who cares.
	} else if (groups.length === 2) {
		if (groups[0].matched) {
			// Groups[0] has content, [1] is spacing.
			// This is left aligned.
			near = groups[0].components;
			afterNear = groups[1].components;
		} else {
			// Groups[1] has content, [0] is spacing
			// This could be right aligned.
			if (isLastChildAtFarEdge(component)) {
				afterCenter = groups[0].components;
				far = groups[1].components;
			}
		}
	} else if (groups.length === 3) {
		if (groups[0].matched) {
			// Near and far have content
			if (isLastChildAtFarEdge(component)) {
				near = groups[0].components;
				far = groups[2].components;
				afterNear = groups[1].components;
			}
		} else {
			// Center has content
			// Canonicalization should have folded the spaces already
			assert(groups[0].components.length === 1 && groups[2].components.length === 1);
			var nearLength = LengthAttribute.getFrom(groups[0].components[0], direction);
			var farLength = LengthAttribute.getFrom(groups[2].components[0], direction);
			assert(nearLength && nearLength.px.isSet() && farLength && farLength.px.isSet());
			if (nearLength.px.value === farLength.px.value) {
				near = groups[0].components;
				far = groups[2].components;
				center = groups[1].components;
			}
		}
	}

	var aggregates = [
		near, afterNear, center, afterCenter, far
	].map(
		StackedChildren.aggregate
	);
	var results = aggregates.filter((result) => !!result);

	if (results.length === 0)
		return;

	var alignment = new Alignment(
		direction === sinf.horiz,
		aggregates[0] && aggregates[0].component,
		aggregates[1] && aggregates[1].component,
		aggregates[2] && aggregates[2].component,
		aggregates[3] && aggregates[3].component,
		aggregates[4] && aggregates[4].component,
		aggregates[0] && near && near.length > 1,
		aggregates[1] && afterNear && afterNear.length > 1,
		aggregates[2] && center && center.length > 1,
		aggregates[3] && afterCenter && afterCenter.length > 1,
		aggregates[4] && far && far.length > 1
	);
	results.push({
		component: component,
		attributes: [alignment],
		deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
	});

	return results;
}

var bucket: Rules.Bucket = {
	name: 'alignment',
	rules: [
		{name: 'expand', rule: expand},
		{name: 'equalSizes', rule: equalSizes},
	],
};

export = bucket;

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

	var groups = groupChildren(component, (child) => {
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		var box = boxAttr.getBox();

		var length = LengthAttribute.getFrom(child, direction);
		return (
			sutil.lengthEquals(direction === sinf.horiz ? box.w : box.h, sinf.expand) &&
			(!length || !length.px.isSet())
		);
	});

	if (!groups || groups.length > 5 || groups.length <= 1) {
		// We can only handle when there are 2 expands, which is a max of
		// 5 groups (3 non expands with 2 expands interspersed)
		return;
	}

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

	// Don't worry about near, that's the default anyway
	if (!afterNear && !center && !afterCenter && !far) {
		return;
	}
	var aggregates = [
		near, afterNear, center, afterCenter, far
	].map(
		(components) => (components && components.some(hasBoxContent)) ? components : null
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

function leftAlign(component: c.Component): Rules.RuleResult[] {
	if (Alignment.isAggregateInAlignment(component))
		return;

	var direction = getDirection(component);
	if (direction !== sinf.horiz) {
		return;
	}
	var groups = groupChildren(component, (child) => {
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		var box = boxAttr.getBox();

		return sutil.lengthEquals(direction === sinf.horiz ? box.w : box.h, sinf.expand);
	});
	if (!groups || groups.length !== 1 || groups[0].matched) {
		return;
	}

	var stackedChildren = StackedChildren.getFrom(component);
	if (!stackedChildren)
		return;
	var children = stackedChildren.getComponentChildren();
	if (children.length <= 1)
		return;

	var aggregate = StackedChildren.aggregate(children);
	return [{
		component: component,
		attributes: [new Alignment(
			true,
			aggregate.component,
			null,
			null,
			null,
			null,
			true,
			false,
			false,
			false,
			false
		)],
		deleteAttributes: [Attributes.Type.STACKED_CHILDREN],
	}, aggregate];
}

var bucket: Rules.Bucket = {
	name: 'alignment',
	rules: [
		{name: 'leftAlign', rule: leftAlign},
		{name: 'expand', rule: expand},
	],
};

export = bucket;

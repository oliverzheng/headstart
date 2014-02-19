import Rules = require('../Rules');
import c = require('../Component');
import StackedChildren = require('../attributes/StackedChildren');
import LengthAttribute = require('../attributes/LengthAttribute');
import NodeAttribute = require('../attributes/NodeAttribute');
import Spacing = require('../attributes/Spacing');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');

function unfoldSameDirection(component: c.Component): Rules.RuleResult[] {
	var stackedChildren = StackedChildren.getFrom(component);
	if (!stackedChildren || stackedChildren.isEmpty())
		return;

	var direction = getDirection(component);

	var width = LengthAttribute.getFrom(component, sinf.horiz);
	var height = LengthAttribute.getFrom(component, sinf.vert);

	var newChildren: c.Component[] = [];
	var unfoldComponents = groupChildren(component, (child) => {
		// Already a node
		if (NodeAttribute.getFrom(child))
			return false;

		if (!hasBoxContent(child))
			return false;

		var childDirection = getDirection(component);
		if (childDirection !== direction)
			return false;

		var grandChildren = StackedChildren.getFrom(child);
		if (!grandChildren || grandChildren.isEmpty())
			return false;

		var grandChildrenLengths = grandChildren.get().map(
			(grandChild) => LengthAttribute.getFrom(grandChild, direction)
		);
		if (grandChildrenLengths.some((l) => !l))
			return false;

		var grandChildrenLengthSum = LengthAttribute.sum(grandChildrenLengths);

		// If the child specified its own length that is different from what
		// the children add up to, then this guy needs its own node.
		var childLength = LengthAttribute.getFrom(child, direction);
		if (!childLength.looksEqual(grandChildrenLengthSum)) {
			return false;
		}

		return true;
	});

	unfoldComponents.forEach((group) => {
		// Do not unfold
		if (!group.matched) {
			newChildren.push.apply(newChildren, group.components);
		} else {
			group.components.forEach((child) => {
				var grandChildren = StackedChildren.getFrom(child);
				newChildren.push.apply(newChildren, grandChildren.get());
			});
		}
	});

	return [{
		component: component,
		replaceAttributes: [
			new StackedChildren(newChildren),
		],
	}];
}

function getSizes(components: c.Component[], direction: sinf.Direction): LengthAttribute[] {
	return components.map((component) => {
		return LengthAttribute.getFrom(component, direction);
	});
}

function havePxSizes(components: c.Component[], direction: sinf.Direction): boolean {
	return getSizes(components, direction).every((length) => {
		return length && length.px.isSet();
	});
}

function coalesceSpaces(component: c.Component): Rules.RuleResult[] {
	var groupedChildren = groupChildren(component, hasBoxContent);
	if (!groupedChildren || groupedChildren.length <= 1) {
		return;
	}

	var direction = getDirection(component);

	var newChildren: c.Component[] = [];
	var results: Rules.RuleResult[] = [];
	groupedChildren.forEach((group) => {
		if (!group.matched && // !hasBoxContent
			havePxSizes(group.components, direction)) {
			var result = StackedChildren.aggregate(group.components);
			newChildren.push(result.component);
			results.push(result);
		} else {
			newChildren.push.apply(newChildren, group.components);
		}
	});

	// Nothing's changed if we don't change the # of children.
	var oldChildren = StackedChildren.getFrom(component).get();
	if (newChildren.length === oldChildren.length)
		return;

	results.push({
		component: component,
		replaceAttributes: [
			new StackedChildren(newChildren),
		],
	});
	return results;
}

function markSpaces(component: c.Component): Rules.RuleResult[] {
	if (!hasBoxContent(component) && !NodeAttribute.getFrom(component)) {
		// You will never be a node. Never.
		return [{
			component: component,
			attributes: [new Spacing()],
		}];
	}
}

var bucket: Rules.Bucket = {
	name: 'reduce',
	rules: [
		{name: 'unfoldSameDirection', rule: unfoldSameDirection},
		{name: 'coalesceSpaces', rule: coalesceSpaces},
		{name: 'markSpaces', rule: markSpaces},
	],
};

export = bucket;

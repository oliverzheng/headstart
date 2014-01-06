import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import StackedChildren = require('../attributes/StackedChildren');
import LengthAttribute = require('../attributes/LengthAttribute');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import sinf = require('../../spec/interfaces');
import getDirection = require('../patterns/getDirection');

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

var coalesceSpacesRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
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

export = coalesceSpacesRule;

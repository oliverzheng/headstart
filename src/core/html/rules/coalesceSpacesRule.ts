import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
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
	groupedChildren.forEach((group) => {
		if (!group.matched && // !hasBoxContent
			group.components.length > 1 && // Don't createa new component to wrap around 1 component
			havePxSizes(group.components, direction)) {

			var aggregate = new c.Component;
			newChildren.push(aggregate);
			aggregate.addAttributes([
				new ChildrenAttribute(group.components),
			]);

		} else {
			newChildren.push.apply(newChildren, group.components);
		}
	});

	return [{
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(newChildren),
		],
	}];
}

export = coalesceSpacesRule;

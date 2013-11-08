import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');

var coalesceSpacesRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var groupedChildren = groupChildren(component, hasBoxContent);
	if (!groupedChildren || groupedChildren.length <= 1) {
		return;
	}

	var newChildren: c.Component[] = [];
	groupedChildren.forEach((group) => {
		if (group.matched) {
			// hasBoxContent
			newChildren.push.apply(newChildren, group.components);
		} else if (group.components.length === 1) {
			// Don't createa new component to wrap around 1 component
			newChildren.push(group.components[0]);
		} else {
			var aggregate = new c.Component;
			aggregate.addAttributes([new ChildrenAttribute(group.components)]);
			newChildren.push(aggregate);
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

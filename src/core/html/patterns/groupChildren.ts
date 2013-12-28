import c = require('../Component');
import sinf = require('../../spec/interfaces');
import StackedChildren = require('../attributes/StackedChildren');

function groupChildren(
		component: c.Component,
		filter: (component: c.Component) => boolean
	): { matched: boolean; components: c.Component[]; }[] {
	var children = StackedChildren.getFrom(component);
	if (children.isEmpty()) {
		return;
	}

	var currentGroup: { matched: boolean; components: c.Component[]; };
	var groups: Array<typeof currentGroup> = [];
	children.get().forEach((child) => {
		var matched = filter(child);
		if (!currentGroup || currentGroup.matched !== matched) {
			currentGroup = {
				matched: matched,
				components: [],
			};
			groups.push(currentGroup);
		}
		currentGroup.components.push(child);
	});

	return groups;
}

export = groupChildren;

import c = require('../Component');
import sinf = require('../../spec/interfaces');
import Children = require('../attributes/Children');

function groupChildren(
		component: c.Component,
		filter: (component: c.Component) => boolean,
		isLayout: boolean = true
	): { matched: boolean; components: c.Component[]; }[] {
	var children = Children.getFrom(component, isLayout);
	if (children.isEmpty()) {
		return;
	}

	var currentGroup: { matched: boolean; components: c.Component[]; };
	var groups: Array<typeof currentGroup> = [];
	children.getComponents().forEach((child) => {
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

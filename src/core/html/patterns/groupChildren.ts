import c = require('../Component');
import sinf = require('../../spec/interfaces');

function groupChildren(
		component: c.Component,
		filter: (component: c.Component) => boolean
	): { matched: boolean; components: c.Component[]; }[] {
	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}

	var currentGroup: { matched: boolean; components: c.Component[]; };
	var groups: Array<typeof currentGroup> = [];
	childrenAttr.getChildren().forEach((child) => {
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

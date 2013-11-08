import c = require('../Component');
import sinf = require('../../spec/interfaces');

function matchChildren<T>(
		component: c.Component,
		pattern: (components: c.Component[]) => T
	): { startIndex: number; capture: T; }[] {
	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}
	var children = childrenAttr.getChildren();

	var matches: { startIndex: number; capture: T; }[] = [];
	for (var ii = 0; ii < children.length; ++ii) {
		var capture = pattern(children.slice(ii));
		if (capture) {
			matches.push({ startIndex: ii, capture: capture });
		}
	}

	return matches;
}

export = matchChildren;

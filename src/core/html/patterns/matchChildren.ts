import c = require('../Component');
import sinf = require('../../spec/interfaces');
import StackedChildren = require('../attributes/StackedChildren');

function matchChildren<T>(
		component: c.Component,
		pattern: (components: c.Component[]) => T
	): { startIndex: number; capture: T; }[] {
	var children = StackedChildren.getFrom(component);
	if (!children || children.isEmpty())
		return;
	var childrenComponents = children.get();

	var matches: { startIndex: number; capture: T; }[] = [];
	for (var ii = 0; ii < childrenComponents.length; ++ii) {
		var capture = pattern(childrenComponents.slice(ii));
		if (capture) {
			matches.push({ startIndex: ii, capture: capture });
		}
	}

	return matches;
}

export = matchChildren;

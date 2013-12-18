import c = require('../Component');
import sinf = require('../../spec/interfaces');
import Children = require('../attributes/Children');

function matchChildren<T>(
		component: c.Component,
		pattern: (components: c.Component[]) => T,
		isLayout: boolean = true
	): { startIndex: number; capture: T; }[] {
	var children = Children.getFrom(component, isLayout);
	var childrenComponents = children.getComponents();
	if (childrenComponents.length === 0) {
		return;
	}

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

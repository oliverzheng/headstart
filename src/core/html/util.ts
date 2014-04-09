import assert = require('assert');

import c = require('./Component');
import Rules = require('./Rules');

export function wrapComponent(component: c.Component): Rules.RuleResult[] {
	if (component.isRoot()) {
		// TODO
		assert(false);
	} else {
		var parent = component.getParent();
		var childrenManager = parent.getChildrenManager();
		return childrenManager.wrapChildren([component]);
	}
}

import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
//import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import NodeAttribute = require('../attributes/NodeAttribute');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import layout = require('../../spec/layout');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

// Create a new component to wrap around the child that's middle aligned and has
// siblings.
var middleAlignmentRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	/*
	var childrenAttr = component.childrenAttr();
	var groups = groupChildren(component, (child) => {
		var alignmentAttr = AlignmentAttribute.getFrom(child);
		if (!alignmentAttr) {
			return false;
		}
		return alignmentAttr.vert === sinf.center;
	});

	if (!groups || groups.length <= 1) {
		return;
	}

	var children: c.Component[] = [];
	var results: Rules.RuleResult[] = [];
	groups.forEach((group) => {
		if (!group.matched) {
			children.push.apply(children, group.components);
		} else {
			var	child = new c.Component;
			children.push(child);
			results.push({
				component: child,
				attributes: [
					new ChildrenAttribute(group.components),
					new NodeAttribute(),
				]
			});
		}
	});

	results.push({
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(children),
		]
	});

	return results;
	*/
	return;
}

export = middleAlignmentRule;

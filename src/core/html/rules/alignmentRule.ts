import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import layout = require('../../spec/layout');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

var alignmentRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	// TODO handle shrink
	//var horizChildren = layout.getEffectiveChildren(box, sinf.horiz);

	var groups = groupChildren(component, (child) => {
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		var box = boxAttr.getBox();

		return sutil.lengthEquals(box.h, sinf.expand);
	});

	if (!groups || groups.length > 5 || groups.length <= 1) {
		// We can only handle when there are 2 expands, which is a max of
		// 5 groups
		return;
	}

	var topChildren: c.Component[];
	var middleChildren: c.Component[];
	var bottomChildren: c.Component[];

	var totalExpands = groups.filter((group) => group.matched).length;
	var expandsSeen = 0;
	groups.forEach((group) => {
		if (group.matched) {
			expandsSeen++;
		} else if (group.components.length > 0) {
			switch (expandsSeen) {
				case 0:
					topChildren = group.components;
					break;
				case 1:
					if (totalExpands === 1) {
						bottomChildren = group.components;
					} else if (totalExpands === 2) {
						middleChildren = group.components;
					}
					break;
				case 2:
					bottomChildren = group.components;
					break;
			}
		}
	});

	var results: Rules.RuleResult[] = [];
	[topChildren, middleChildren, bottomChildren].forEach((children, i) => {
		if (!children) {
			return;
		}
		var alignment = [sinf.near, sinf.center, sinf.far][i];
		var attributes: Attributes.BaseAttribute[] = [
			new AlignmentAttribute(sinf.defaultAlignment, alignment),
		];

		var component: c.Component;
		if (children.length === 1) {
			component = children[0];
		} else {
			component = new c.Component;
			attributes.push(new ChildrenAttribute(children));
		}

		results.push({
			component: component,
			attributes: attributes,
		});
	});
	if (results.length === 0) {
		return;
	}

	results.unshift({
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(results.map((result) => result.component))
		],
	});

	return results;
}

export = alignmentRule;

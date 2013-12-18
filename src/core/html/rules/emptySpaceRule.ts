import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import SpacingAttribute = require('../attributes/SpacingAttribute');
import matchChildren = require('../patterns/matchChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sizePatterns = require('../patterns/size');
import sinf = require('../../spec/interfaces');
import assert = require('assert');

interface SpaceMatch {
	previous: c.Component;
	space: c.Component;
	next: c.Component;
}

function matchSpace(components: c.Component[]): SpaceMatch {
	if (components.length >= 3 &&
		hasBoxContent(components[0]) &&
		hasBoxContent(components[2]) &&
		!hasBoxContent(components[1])) {
		return {
			previous: components[0],
			space: components[1],
			next: components[2],
		};
	}
}

var emptySpaceRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	/*
	var matches = matchChildren(component, matchSpace);
	var direction = getDirection(component);
	if (!matches || !direction) {
		return;
	}

	var results: Rules.RuleResult[] = [];
	var emptyComponents: c.Component[] = [];
	matches.forEach((match) => {
		var capture = match.capture;
		var size = sizePatterns.getAggregatedSize(capture.space, direction);
		results.push({
			component: capture.previous,
			attributes: [
				direction === sinf.horiz
				? SpacingAttribute.right(size)
				: SpacingAttribute.bottom(size)
			],
		});
		results.push({
			component: capture.next,
			attributes: [
				direction === sinf.horiz
				? SpacingAttribute.left(size)
				: SpacingAttribute.top(size)
			],
		});
		emptyComponents.push(capture.space);
	});

	var childrenAttr = component.childrenAttr();
	assert(!!childrenAttr);
	var existingChildren = childrenAttr.getChildren();
	results.push({
		component: component,
		replaceAttributes: [
			new ChildrenAttribute(existingChildren.filter((child) => {
				return emptyComponents.indexOf(child) === -1;
			}))
		],
	});

	return results;
	*/
	return;
}

export = emptySpaceRule;

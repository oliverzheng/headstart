import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
//import ChildrenAttribute = require('../attributes/ChildrenAttribute');
//import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import PositionAttribute = require('../attributes/PositionAttribute');
import CSSAttribute = require('../attributes/CSSAttribute');
import matchChildren = require('../patterns/matchChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sizePatterns = require('../patterns/size');
import sinf = require('../../spec/interfaces');
import assert = require('assert');

var cssVerticalBottom: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	/*
	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}
	var children = childrenAttr.getChildren();

	var bottoms = children.filter((child) => {
		var alignAttr = AlignmentAttribute.getFrom(child);
		return alignAttr && alignAttr.vert === sinf.far;
	});
	if (bottoms.length === 0) {
		return;
	}
	var bottom = bottoms[0];

	return [{
		component: component,
		attributes: [
			PositionAttribute.relative,
		],
	}, {
		component: bottom,
		attributes: [
			PositionAttribute.absolute,
			new CSSAttribute({
				'bottom': '0',
			})
		],
	}];
	*/
	return;
}

export = cssVerticalBottom;

import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
//import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import SpacingAttribute = require('../attributes/SpacingAttribute');
import CSSAttribute = require('../attributes/CSSAttribute');
//import SealedAttribute = require('../attributes/SealedAttribute');
import matchChildren = require('../patterns/matchChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sizePatterns = require('../patterns/size');
import sinf = require('../../spec/interfaces');
import assert = require('assert');

var cssMarginRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	/*
	var nodeAttr = component.nodeAttr();
	if (!nodeAttr) {
		return;
	}

	var spacing = SpacingAttribute.getFrom(component);
	if (!spacing) {
		return;
	}

	var margin = [
		spacing.top,
		spacing.right,
		spacing.bottom,
		spacing.left
	].map((space) => {
		if (!space) {
			return '0px';
		}
		assert(space.unit === sinf.LengthUnit.PIXELS);
		return space.value + 'px';
	}).join(' ');

	return [{
		component: component,
		attributes: [
			new CSSAttribute({'margin': margin}),
			//new SealedAttribute(),
		]
	}];
	*/
	return;
}

export = cssMarginRule;

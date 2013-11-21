import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import PositionAttribute = require('../attributes/PositionAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import matchChildren = require('../patterns/matchChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sizePatterns = require('../patterns/size');
import sinf = require('../../spec/interfaces');
import util = require('../../spec/util');
import assert = require('assert');

function makeResults(
		component: c.Component, width: LengthAttribute, height: LengthAttribute
	): Rules.RuleResult[] {

	if (!width && !height) {
		return;
	}

	var attributes: Attributes.BaseAttribute[] = [];
	if (width) {
		attributes.push(width);
	}
	if (height) {
		attributes.push(height);
	}
	return [{
		component: component,
		attributes: attributes,
	}];
}

export var sizeUserExplicit: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var width: LengthAttribute = null;
	var height: LengthAttribute = null;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		var box = boxAttr.getBox();
		// The user specified these should be exactly this length
		if (!width && box.w && sinf.fixedLengthUnits.indexOf(box.w.unit) !== -1) {
			width = LengthAttribute.fromUser(box.w, sinf.horiz);
		}
		if (!height && box.h && sinf.fixedLengthUnits.indexOf(box.h.unit) !== -1) {
			height = LengthAttribute.fromUser(box.h, sinf.vert);
		}
	}

	return makeResults(component, width, height);
}

// Get components that wrap around children (all components without boxes do by
// default), or components with boxes that have SHRINK for size.
export var sizeByChildrenSum: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var width: LengthAttribute = null;
	var height: LengthAttribute = null;
	var doWidth = true;
	var doHeight = true;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		var box = boxAttr.getBox();
		if (box.w.unit !== sinf.LengthUnit.SHRINK) {
			doWidth = false;
		}
		if (box.h.unit !== sinf.LengthUnit.SHRINK) {
			doHeight = false;
		}
	}

	var childrenAttr = component.childrenAttr();
	var direction = getDirection(component);
	if (childrenAttr && childrenAttr.getChildren().length > 0 && direction) {
		// Sum up children lengths
		var children = childrenAttr.getChildren();

		var childrenWidths = children.map(
			(child) => LengthAttribute.getFrom(child, sinf.horiz)
		).filter((attr) => !!attr);
		if (childrenWidths.length === children.length) {
			// TODO take into account spacing
			if (direction === sinf.horiz) {
				width = childrenWidths.reduce(LengthAttribute.add).makeImplicit();
			} else {
				var canCompare = childrenWidths.every((w, i) => {
					if (i === 0) {
						return true;
					} else {
						return w.canCompare(childrenWidths[i-1]);
					}
				});
				// Find the max
				if (canCompare) {
					childrenWidths.sort(LengthAttribute.compare);
					width = childrenWidths[childrenWidths.length - 1].makeImplicit();
				}
			}
		}

		var childrenHeights = children.map(
			(child) => LengthAttribute.getFrom(child, sinf.vert)
		).filter((attr) => !!attr);
		if (childrenHeights.length === children.length) {
			// TODO take into account spacing
			if (direction === sinf.vert) {
				height = childrenHeights.reduce(LengthAttribute.add).makeImplicit();
			} else {
				var canCompare = childrenHeights.every((h, i) => {
					if (i === 0) {
						return true;
					} else {
						return h.canCompare(childrenHeights[i-1]);
					}
				});
				// Find the max
				if (canCompare) {
					childrenHeights.sort(LengthAttribute.compare);
					height = childrenHeights[childrenHeights.length - 1].makeImplicit();
				}
			}
		}
	}

	return makeResults(component, doWidth ? width : null, doHeight ? height : null);
}

export var sizePercentChildren: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var parentWidth = LengthAttribute.getFrom(component, sinf.horiz);
	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);

	var childrenAttr = component.childrenAttr();
	if (childrenAttr && childrenAttr.getChildren().length > 0) {
		var children = childrenAttr.getChildren();

		var results: Rules.RuleResult[] = [];
		children.forEach((child) => {
			var childWidth = LengthAttribute.getFrom(child, sinf.horiz);
			if (parentWidth && childWidth &&
				parentWidth.px.isSet() && !childWidth.px.isSet() && childWidth.pct.isSet()) {
				results.push({
					component: child,
					attributes: [childWidth.percentOf(parentWidth)],
				});
			}
			var childHeight = LengthAttribute.getFrom(child, sinf.vert);
			if (parentHeight && childHeight &&
				parentHeight.px.isSet() && !childHeight.px.isSet() && childHeight.pct.isSet()) {
				results.push({
					component: child,
					attributes: [childHeight.percentOf(parentHeight)],
				});
			}
		});
		return results;
	}
}


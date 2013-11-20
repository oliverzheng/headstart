import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import PositionAttribute = require('../attributes/PositionAttribute');
import SizeAttribute = require('../attributes/SizeAttribute');
import Length = require('../Length');
import matchChildren = require('../patterns/matchChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sizePatterns = require('../patterns/size');
import sinf = require('../../spec/interfaces');
import util = require('../../spec/util');
import assert = require('assert');

function sizeComponent(component: c.Component): Rules.RuleResult[] {
	var sizeAttr = SizeAttribute.getFrom(component);
	var width: Length = sizeAttr ? sizeAttr.width : null;
	var height: Length = sizeAttr ? sizeAttr.height : null;;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		var box = boxAttr.getBox();
		// The user specified these should be exactly this length
		if (!width && box.w && sinf.fixedLengthUnits.indexOf(box.w.unit) !== -1) {
			width = Length.makeLength(box.w, true);
		}
		if (!height && box.h && sinf.fixedLengthUnits.indexOf(box.h.unit) !== -1) {
			height = Length.makeLength(box.h, true);
		}
	}

	var childrenAttr = component.childrenAttr();
	var direction = getDirection(component);
	if (childrenAttr && childrenAttr.getChildren().length > 0 && direction) {
		// Sum up children lengths
		var children = childrenAttr.getChildren();
		var childrenSizeAttrs = children.map(
			(child) => SizeAttribute.getFrom(child)
		).filter((attr) => !!attr);
		if (childrenSizeAttrs.length === children.length) {
			if (!width) {
				var childrenWidths = childrenSizeAttrs.map((attr) => attr.width);
				if (childrenWidths.length === children.length) {
					// TODO take into account spacing
					if (direction === sinf.horiz) {
						width = Length.makeImplicit(childrenWidths.reduce(Length.add));
					} else {
						var canCompare = childrenWidths.every((w, i) => {
							if (i === 0) {
								return true;
							} else {
								return Length.canCompare(w, childrenWidths[i-1]);
							}
						});
						// Find the max
						if (canCompare) {
							childrenWidths.sort(Length.compare);
							width = Length.makeImplicit(childrenWidths[childrenWidths.length - 1]);
						}
					}
				}
			}
			if (!height) {
				var childrenHeights = childrenSizeAttrs.map(
					(attr) => attr.height
				);
				if (childrenHeights.length === children.length) {
					// TODO take into account spacing
					if (direction === sinf.vert) {
						height = Length.makeImplicit(childrenHeights.reduce(Length.add));
					} else {
						var canCompare = childrenHeights.every((h, i) => {
							if (i === 0) {
								return true;
							} else {
								return Length.canCompare(h, childrenHeights[i-1]);
							}
						});
						// Find the max
						if (canCompare) {
							childrenHeights.sort(Length.compare);
							height = Length.makeImplicit(childrenHeights[childrenHeights.length - 1]);
						}
					}
				}
			}
		}
	}

	if (width || height) {
		return [{
			component: component,
			attributes: [
				new SizeAttribute(width, height),
			],
		}];
	}
}

function sizeChildren(component: c.Component): Rules.RuleResult[] {
	return;
}

var sizeRule: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var results: Rules.RuleResult[] = [];
	results.push.apply(results, sizeComponent(component));
	results.push.apply(results, sizeChildren(component));
	return results;
}

export = sizeRule;

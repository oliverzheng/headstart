import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import ChildrenAttribute = require('../attributes/ChildrenAttribute');
import AlignmentAttribute = require('../attributes/AlignmentAttribute');
import Measurement = require('../attributes/Measurement');
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

// All components without boxes wrap around their children by default. This does
// not size components that have boxes.
export var sizeByChildrenSum: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var width: LengthAttribute = null;
	var height: LengthAttribute = null;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		return;
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

	return makeResults(component, width, height);
}

// Set the px length of children that have % lengths and if the parent has
// a known px length.
export var sizePercentChildren: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var parentWidth = LengthAttribute.getFrom(component, sinf.horiz);
	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);

	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}
	var children = childrenAttr.getChildren();

	// This can only be used for when the entire tree is a box tree.
	assert(children.every((child) => <boolean>child.boxAttr()));

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

// Set the % and px lengths of children that expand.
export function sizeExpandedChildren(component: c.Component): Rules.RuleResult[] {
	var parentWidth = LengthAttribute.getFrom(component, sinf.horiz);
	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);
	var direction = getDirection(component);

	var childrenAttr = component.childrenAttr();
	if (!childrenAttr || childrenAttr.getChildren().length === 0) {
		return;
	}
	var children = childrenAttr.getChildren();

	var results: Rules.RuleResult[] = [];

	if (parentWidth) {
		var unsizedExpandHorizChildren = children.filter((child) => {
			if (LengthAttribute.getFrom(child, sinf.horiz)) {
				return false;
			}
			var boxAttr = child.boxAttr();
			if (!boxAttr) {
				return false;
			}
			return boxAttr.getBox().w.unit === sinf.LengthUnit.EXPAND;
		});
		if (direction === sinf.horiz) {
			var sizedChildrenWidths = children.map((child) => {
				return LengthAttribute.getFrom(child, sinf.horiz);
			}).filter((length) => <boolean>length);

			// We can't figure out the size of other EXPAND children if not all
			// non-EXPAND children are sized.
			var horizUnsizedChildrenAllExpand =
				sizedChildrenWidths.length + unsizedExpandHorizChildren.length === children.length;
				
			if (horizUnsizedChildrenAllExpand && unsizedExpandHorizChildren.length > 0) {
				var widthOfSizedChildren: LengthAttribute;
				if (sizedChildrenWidths.length > 0) {
					widthOfSizedChildren =
						sizedChildrenWidths.reduce(LengthAttribute.add).makeImplicit();
				} else {
					widthOfSizedChildren = LengthAttribute.horizZero;
				}

				var leftOverWidth = parentWidth.subtract(widthOfSizedChildren);
				if (leftOverWidth &&
					leftOverWidth.canCompare(LengthAttribute.horizZero)) {
					if (leftOverWidth.compare(LengthAttribute.horizZero) < 0) {
						leftOverWidth = LengthAttribute.horizZero;
					}
					var splitWidth = leftOverWidth.split(unsizedExpandHorizChildren.length);

					results.push.apply(results, unsizedExpandHorizChildren.map((child) => {
						return {
							component: child,
							attributes: [splitWidth],
						};
					}));
				}
			}
		} else if (direction === sinf.vert) {
			var oneHundredPct =
				new LengthAttribute(sinf.horiz, null, Measurement.implicit(1));
			var widthFromParent = oneHundredPct.percentOf(parentWidth);
			results.push.apply(results, unsizedExpandHorizChildren.map((child) => {
				return {
					component: child,
					attributes: [widthFromParent],
				};
			}));
		}
	}

	if (parentHeight) {
		var unsizedExpandVertChildren = children.filter((child) => {
			if (LengthAttribute.getFrom(child, sinf.vert)) {
				return false;
			}
			var boxAttr = child.boxAttr();
			if (!boxAttr) {
				return false;
			}
			return boxAttr.getBox().h.unit === sinf.LengthUnit.EXPAND;
		});
		if (direction === sinf.vert) {
			var sizedChildrenHeights = children.map((child) => {
				return LengthAttribute.getFrom(child, sinf.vert);
			}).filter((length) => <boolean>length);

			// We can't figure out the size of other EXPAND children if not all
			// non-EXPAND children are sized.
			var vertUnsizedChildrenAllExpand =
				sizedChildrenHeights.length + unsizedExpandVertChildren.length === children.length;
				
			if (vertUnsizedChildrenAllExpand && unsizedExpandVertChildren.length > 0) {
				var heightOfSizedChildren: LengthAttribute;
				if (sizedChildrenHeights.length > 0) {
					heightOfSizedChildren =
						sizedChildrenHeights.reduce(LengthAttribute.add).makeImplicit();
				} else {
					heightOfSizedChildren = LengthAttribute.vertZero;
				}

				var leftOverHeight = parentHeight.subtract(heightOfSizedChildren);
				if (leftOverHeight &&
					leftOverHeight.canCompare(LengthAttribute.vertZero)) {
					if (leftOverHeight.compare(LengthAttribute.vertZero) < 0) {
						leftOverHeight = LengthAttribute.vertZero;
					}
					var splitHeight = leftOverHeight.split(unsizedExpandVertChildren.length);

					results.push.apply(results, unsizedExpandVertChildren.map((child) => {
						return {
							component: child,
							attributes: [splitHeight],
						};
					}));
				}
			}
		} else if (direction === sinf.horiz) {
			var oneHundredPct =
				new LengthAttribute(sinf.vert, null, Measurement.implicit(1));
			var heightFromParent = oneHundredPct.percentOf(parentHeight);
			results.push.apply(results, unsizedExpandVertChildren.map((child) => {
				return {
					component: child,
					attributes: [heightFromParent],
				};
			}));
		}
	}

	return results;
}

export function sizeShrink(component: c.Component): Rules.RuleResult[] {
	var boxAttr = component.boxAttr();
	if (!boxAttr) {
		return;
	}
	var box = boxAttr.getBox();

	var shrinkWidth = box.w.unit === sinf.LengthUnit.SHRINK;
	var shrinkHeight = box.h.unit === sinf.LengthUnit.SHRINK;
	if (!shrinkWidth && !shrinkHeight) {
		return;
	}

	var childrenAttr = component.childrenAttr()
	var children: c.Component[];
	if (childrenAttr) {
		children = childrenAttr.getChildren();
	} else {
		children = [];
	}
	var direction = getDirection(component);
	assert(!!direction);

	// This can only be used for when the entire tree is a box tree.
	assert(children.every((child) => <boolean>child.boxAttr()));

	var results: Rules.RuleResult[] = [];

	if (shrinkWidth) {
		var horizSizedWidths = children.map((child) => {
			return LengthAttribute.getFrom(child, sinf.horiz);
		}).filter((length) => length && length.px.isSet());
		var horizPctAndExpandChildren = children.filter((child) => {
			var box = child.boxAttr().getBox();
			return (
				box.w.unit === sinf.LengthUnit.PERCENT ||
				box.w.unit === sinf.LengthUnit.EXPAND
			);
		});
		if ((horizSizedWidths.length + horizPctAndExpandChildren.length) !==
			children.length) {
			// We need all the explicit lengths to be calculated first
			return;
		}

		if (direction === sinf.horiz) {
			var widthSum: LengthAttribute;
			if (horizSizedWidths.length > 0) {
				widthSum = horizSizedWidths.reduce(LengthAttribute.add).makeImplicit();
			} else {
				widthSum = LengthAttribute.horizZero;
			}
			results.push({
				component: component,
				attributes: [widthSum],
			});

			results.push.apply(results,
				horizPctAndExpandChildren.map((child) => {
					return {
						component: child,
						attributes: [LengthAttribute.horizZeroPx],
					};
				})
			);
		} else {
			var maxWidth: LengthAttribute;
			if (horizSizedWidths.length > 0) {
				horizSizedWidths.sort(LengthAttribute.compare);
				maxWidth = horizSizedWidths[horizSizedWidths.length - 1].makeImplicit();
			} else {
				maxWidth = LengthAttribute.horizZero;
			}
			results.push({
				component: component,
				attributes: [maxWidth],
			});
		}
	}

	if (shrinkHeight) {
		var vertSizedHeights = children.map((child) => {
			return LengthAttribute.getFrom(child, sinf.vert);
		}).filter((length) => length && length.px.isSet());
		var vertPctAndExpandChildren = children.filter((child) => {
			var box = child.boxAttr().getBox();
			return (
				box.h.unit === sinf.LengthUnit.PERCENT ||
				box.h.unit === sinf.LengthUnit.EXPAND
			);
		});
		if ((vertSizedHeights.length + vertPctAndExpandChildren.length) !==
			children.length) {
			// We need all the explicit lengths to be calculated first
			return;
		}

		if (direction === sinf.vert) {
			var heightSum: LengthAttribute;
			if (vertSizedHeights.length > 0) {
				heightSum = vertSizedHeights.reduce(LengthAttribute.add).makeImplicit();
			} else {
				heightSum = LengthAttribute.vertZero;
			}
			results.push({
				component: component,
				attributes: [heightSum],
			});

			results.push.apply(results,
				vertPctAndExpandChildren.map((child) => {
					return {
						component: child,
						attributes: [LengthAttribute.vertZeroPx],
					};
				})
			);
		} else {
			var maxHeight: LengthAttribute;
			if (vertSizedHeights.length > 0) {
				vertSizedHeights.sort(LengthAttribute.compare);
				maxHeight = vertSizedHeights[vertSizedHeights.length - 1].makeImplicit();
			} else {
				maxHeight = LengthAttribute.vertZero;
			}
			results.push({
				component: component,
				attributes: [maxHeight],
			});
		}
	}

	return results;
}

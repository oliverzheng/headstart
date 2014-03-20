import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import StackedChildren = require('../attributes/StackedChildren');
import Measurement = require('../attributes/Measurement');
import PositionAttribute = require('../attributes/PositionAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import TextContent = require('../attributes/TextContent');
import CSSAttribute = require('../attributes/CSSAttribute');
import BlockFormat = require('../attributes/BlockFormat');
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

var sizeUserExplicit: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var width: LengthAttribute = null;
	var height: LengthAttribute = null;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		var box = boxAttr.getBox();
		// The user specified these should be exactly this length
		if (!width && box.w && sinf.fixedLengthUnits.indexOf(box.w.unit) !== -1 && !box.w.runtime) {
			width = LengthAttribute.fromUser(box.w, sinf.horiz);
		}
		if (!height && box.h && sinf.fixedLengthUnits.indexOf(box.h.unit) !== -1 && !box.h.runtime) {
			height = LengthAttribute.fromUser(box.h, sinf.vert);
		}
	}

	return makeResults(component, width, height);
}

// All components without boxes wrap around their children by default. This does
// not size components that have boxes.
var sizeByChildrenSum: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var width: LengthAttribute = null;
	var height: LengthAttribute = null;

	var boxAttr = component.boxAttr();
	if (boxAttr) {
		return;
	}

	var direction = getDirection(component);
	var children = StackedChildren.getFrom(component);
	if (direction && children && !children.isEmpty()) {
		// Sum up children lengths
		var childrenComponents = children.get();
		var childrenWidths = childrenComponents.map(
			(child) => LengthAttribute.getFrom(child, sinf.horiz)
		).filter((attr) => !!attr);
		if (childrenWidths.length === childrenComponents.length) {
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

		var childrenHeights = childrenComponents.map(
			(child) => LengthAttribute.getFrom(child, sinf.vert)
		).filter((attr) => !!attr);
		if (childrenHeights.length === childrenComponents.length) {
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
var sizePercentChildren: Rules.Rule = function(component: c.Component): Rules.RuleResult[] {
	var parentWidth = LengthAttribute.getFrom(component, sinf.horiz);
	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);

	var children = StackedChildren.getFrom(component);
	if (!children || children.isEmpty()) {
		return;
	}
	var childrenComponents = children.get();

	var results: Rules.RuleResult[] = [];

	childrenComponents.forEach((child) => {
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
function sizeExpandedChildren(component: c.Component): Rules.RuleResult[] {
	var parentWidth = LengthAttribute.getFrom(component, sinf.horiz);
	var parentHeight = LengthAttribute.getFrom(component, sinf.vert);
	var direction = getDirection(component);

	var children = StackedChildren.getFrom(component);
	if (!children || children.isEmpty()) {
		return;
	}
	var childrenComponents = children.get();

	var results: Rules.RuleResult[] = [];

	var unsizedExpandHorizChildren = childrenComponents.filter((child) => {
		if (LengthAttribute.getFrom(child, sinf.horiz)) {
			return false;
		}
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		return boxAttr.getBox().w.unit === sinf.LengthUnit.EXPAND;
	});
	if (parentWidth) {
		if (direction === sinf.horiz) {
			var sizedChildrenWidths = childrenComponents.map((child) => {
				return LengthAttribute.getFrom(child, sinf.horiz);
			}).filter((length) => !!length);

			// We can't figure out the size of other EXPAND children if not all
			// non-EXPAND children are sized.
			var horizUnsizedChildrenAllExpand =
				sizedChildrenWidths.length + unsizedExpandHorizChildren.length === childrenComponents.length;
				
			if (horizUnsizedChildrenAllExpand && unsizedExpandHorizChildren.length > 0) {
				var widthOfSizedChildren: LengthAttribute;
				if (sizedChildrenWidths.length > 0) {
					widthOfSizedChildren =
						sizedChildrenWidths.reduce(LengthAttribute.add).makeImplicit();
				} else {
					widthOfSizedChildren = LengthAttribute.getHorizZero();
				}

				var leftOverWidth = parentWidth.subtract(widthOfSizedChildren);
				if (leftOverWidth &&
					leftOverWidth.canCompare(LengthAttribute.getHorizZero())) {
					if (leftOverWidth.compare(LengthAttribute.getHorizZero()) < 0) {
						leftOverWidth = LengthAttribute.getHorizZero();
					}
					results.push.apply(results, unsizedExpandHorizChildren.map((child) => {
						var splitWidth = leftOverWidth.split(unsizedExpandHorizChildren.length);
						return {
							component: child,
							attributes: [splitWidth],
						};
					}));
				}
			}
		} else if (direction === sinf.vert) {
			var oneHundredPct = LengthAttribute.get100Pct(sinf.horiz);
			results.push.apply(results, unsizedExpandHorizChildren.map((child) => {
				var widthFromParent = oneHundredPct.percentOf(parentWidth);
				return {
					component: child,
					attributes: [widthFromParent],
				};
			}));
		}
	} else if (direction === sinf.vert) {
		results.push.apply(results, unsizedExpandHorizChildren.map((child) => {
			return {
				component: child,
				attributes: [LengthAttribute.get100Pct(sinf.horiz)],
			};
		}));
	}

	var unsizedExpandVertChildren = childrenComponents.filter((child) => {
		if (LengthAttribute.getFrom(child, sinf.vert)) {
			return false;
		}
		var boxAttr = child.boxAttr();
		if (!boxAttr) {
			return false;
		}
		return boxAttr.getBox().h.unit === sinf.LengthUnit.EXPAND;
	});
	if (parentHeight) {
		if (direction === sinf.vert) {
			var sizedChildrenHeights = childrenComponents.map((child) => {
				return LengthAttribute.getFrom(child, sinf.vert);
			}).filter((length) => !!length);

			// We can't figure out the size of other EXPAND children if not all
			// non-EXPAND children are sized.
			var vertUnsizedChildrenAllExpand =
				sizedChildrenHeights.length + unsizedExpandVertChildren.length === childrenComponents.length;
				
			if (vertUnsizedChildrenAllExpand && unsizedExpandVertChildren.length > 0) {
				var heightOfSizedChildren: LengthAttribute;
				if (sizedChildrenHeights.length > 0) {
					heightOfSizedChildren =
						sizedChildrenHeights.reduce(LengthAttribute.add).makeImplicit();
				} else {
					heightOfSizedChildren = LengthAttribute.getVertZero();
				}

				var leftOverHeight = parentHeight.subtract(heightOfSizedChildren);
				if (leftOverHeight &&
					leftOverHeight.canCompare(LengthAttribute.getVertZero())) {
					if (leftOverHeight.compare(LengthAttribute.getVertZero()) < 0) {
						leftOverHeight = LengthAttribute.getVertZero();
					}
					results.push.apply(results, unsizedExpandVertChildren.map((child) => {
						var splitHeight = leftOverHeight.split(unsizedExpandVertChildren.length);
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
			results.push.apply(results, unsizedExpandVertChildren.map((child) => {
				var heightFromParent = oneHundredPct.percentOf(parentHeight);
				return {
					component: child,
					attributes: [heightFromParent],
				};
			}));
		}
	} else if (direction === sinf.horiz) {
		results.push.apply(results, unsizedExpandVertChildren.map((child) => {
			return {
				component: child,
				attributes: [LengthAttribute.get100Pct(sinf.vert)],
			};
		}));
	}

	return results;
}

function sizeShrink(component: c.Component): Rules.RuleResult[] {
	var boxAttr = component.boxAttr();
	if (!boxAttr)
		return;
	var box = boxAttr.getBox();

	var staticText = box.staticContent ? box.staticContent.text : null;
	var hasStaticText = !!staticText;
	if (hasStaticText) {
		return;
	}

	var componentDirection = getDirection(component);
	assert(!!componentDirection);

	var children = component.getChildren();
	// This can only be used for when the entire tree is a box tree.
	if (!children.every((child) => !!child.boxAttr()))
		return;

	var results: Rules.RuleResult[] = [];

	util.forEachDirection((direction: sinf.Direction) => {
		var shrinks = util.getLength<sinf.Length>(box, direction).unit === sinf.LengthUnit.SHRINK;
		if (!shrinks)
			return;

		if (LengthAttribute.getFrom(component, direction))
			return;

		var sizedChildren = children.filter((child) => {
			var length = LengthAttribute.getFrom(child, direction);
			return length && length.px.isSet();
		});
		var pctAndExpandChildren = children.filter((child) => {
			var box = child.boxAttr().getBox();
			var unit = util.getLength<sinf.Length>(box, direction).unit;
			return (
				unit === sinf.LengthUnit.PERCENT ||
				unit === sinf.LengthUnit.EXPAND
			);
		});

		// There is a case when the parent shrinks to children, and all but
		// one children expand. That child also shrinks. The lengths cannot be
		// determined but for sure they are equal.
		if (sizedChildren.length === 0) {
			var shrinkChildren = children.filter((child) => {
				var box = child.boxAttr().getBox();
				var unit = util.getLength<sinf.Length>(box, direction).unit;
				return unit === sinf.shrinkUnit;
			});
			if (shrinkChildren.length === 1 && (pctAndExpandChildren.length + 1) === children.length) {
				results.push({
					component: shrinkChildren[0],
					attributes: [LengthAttribute.get100Pct(direction)],
				});
			}
		}

		if ((sizedChildren.length + pctAndExpandChildren.length) !== children.length) {
			// We need all the explicit lengths to be calculated first
			return;
		}

		var childrenManager = component.getChildrenManager();
		var sizedPositions = sizedChildren.map((child) => {
			return childrenManager.getChildPosition(child, 0);
		});
		// All the positions must be specified.
		if (sizedPositions.some((position: Attributes.ChildPosition) => !util.getPosition(position, direction)))
			return;

		var sizedLengths = sizedChildren.map((child) => {
			return LengthAttribute.getFrom(child, direction);
		});

		var bounds = sizedChildren.map((child, i) => {
			var position = util.getPosition<LengthAttribute>(sizedPositions[i], direction);
			var length = sizedLengths[i];
			assert(position.px.isSet() && length.px.isSet());
			return position.add(length);
		});

		bounds.push(LengthAttribute.getZeroPx(direction));
		var max = LengthAttribute.max(bounds);
		results.push({
			component: component,
			attributes: [max],
		});

		if (componentDirection === direction) {
			results.push.apply(results, pctAndExpandChildren.map((child) => {
				return {
					component: child,
					attributes: [LengthAttribute.getZeroPx(direction)],
				};
			}));
		} else {
			assert(max.px.isSet());
			results.push.apply(results, sizedChildren.map((sizedChild, i) => {
				var length = sizedLengths[i];
				if (length.px.isSet() && !length.pct.isSet() && length.px.value === max.px.value) {
					return {
						component: sizedChild,
						attributes: [LengthAttribute.get100Pct(direction)],
					};
				}
			}).filter((a) => !!a));
		}
	});

	return results;
}

function sizeShrinkHeightToText(component: c.Component): Rules.RuleResult[] {
	var textAttr = TextContent.getFrom(component);
	if (!textAttr) {
		return;
	}
	var box = component.boxAttr().getBox();
	var shrinkHeight = box.h.unit === sinf.LengthUnit.SHRINK;
	if (!shrinkHeight) {
		return;
	}

	var text = textAttr.getText();
	// Only do exactly N lines for now
	var lines = util.textExactLines(text);
	if (lines == null)
		return;

	var height = lines * text.lineHeight;

	return [{
		component: component,
		attributes: [
			new LengthAttribute(
				sinf.vert,
				Measurement.implicit(height),
				null,
				Measurement.explicit(lines)
			)
		],
	}];
}

var bucket: Rules.Bucket = {
	name: 'sizing',
	rules: [
		{name: 'userExplicit', rule: sizeUserExplicit},
		{name: 'percentChildren', rule: sizePercentChildren},
		{name: 'expandedChildren', rule: sizeExpandedChildren},
		{name: 'shrink', rule: sizeShrink},
		{name: 'shrinkHeightToText', rule: sizeShrinkHeightToText},
		{name: 'childrenSum', rule: sizeByChildrenSum},
	],
};

export = bucket;

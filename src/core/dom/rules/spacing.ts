import assert = require('assert');

import inf = require('../interfaces');
import sinf = require('../../spec/interfaces');
import l = require('../../spec/layout');
import d = require('../dom');

class Spacing {
	boxes: sinf.Box[];
	parent: sinf.Box;
	direction = sinf.Direction;

	constructor(boxes: sinf.Box[]) {
		assert(boxes.length > 0);

		this.boxes = boxes;
		this.parent = boxes[0].parent;
		this.direction = this.parent.direction;

		assert(boxes.every((box) => box.parent === this.parent));
	}

	static SpacingFromBoxes(boxes: sinf.Box[]): Spacing {
		if (boxes.length > 0) {
			return new Spacing(boxes);
		}
		return null;
	}

	isAll(unit: sinf.LengthUnit): boolean {
		return this.boxes.every((box) => {
			if (this.direction === sinf.horiz) {
				return box.w.unit === unit;
			} else if (this.direction === sinf.vert) {
				return box.h.unit === unit;
			} else {
				assert(false);
			}
		});
	}

	getLengthsByUnit(unit: sinf.LengthUnit): sinf.Length[] {
		return this.boxes.map((box) => {
			if (this.direction === sinf.horiz) {
				return box.w;
			} else if (this.direction === sinf.vert) {
				return box.h;
			} else {
				assert(false);
			}
		}).filter((length) => length.unit === unit);
	}

	getLengthValueByUnit(unit: sinf.LengthUnit): number {
		return this.getLengthsByUnit(unit).map(
			(length) => length.value
		).reduce((cur, prev) => cur + prev);
	}
}

interface ChildrenBySpacing {
	spacings: Spacing[];
	nonSpacings: sinf.Box[];
}

function hasNodes(dom: d.Dom, box: sinf.Box): boolean {
	if (dom.getNodeForBox(box)) {
		return true;
	}

	return (box.children || <sinf.Box[]>[]).some(hasNodes.bind(this, dom));
}

function getChildrenBySpacing(dom: d.Dom, parent: sinf.Box) {
	var childrenBySpacing: ChildrenBySpacing = {
		spacings: [],
		nonSpacings: [],
	};

	var spacingBoxes: sinf.Box[] = [];
	(parent.children || <sinf.Box[]>[]).forEach((childBox) => {
		if (hasNodes(dom, childBox)) {
			childrenBySpacing.nonSpacings.push(childBox);

			childrenBySpacing.spacings.push(
				Spacing.SpacingFromBoxes(spacingBoxes)
			);
			spacingBoxes = [];
		} else {
			spacingBoxes.push(childBox);
		}
	});
	childrenBySpacing.spacings.push(
		Spacing.SpacingFromBoxes(spacingBoxes)
	);

	return childrenBySpacing;
}

export function Margin(layout: l.Layout, dom: d.Dom, box: sinf.Box): inf.RuleResult {
	if (!box.children)
		return;

	var childrenBySpacing = getChildrenBySpacing(dom, box);
	if (childrenBySpacing.nonSpacings.length === 0)
		return;

	if (!childrenBySpacing.spacings.every(
			(spacing) => !spacing || spacing.isAll(sinf.LengthUnit.PIXELS)
		))
		return;

	var dir = box.direction;
	if (dir === sinf.horiz) {
		var marginBefore = 'margin-left';
		var marginAfter = 'margin-right';
	} else if (dir === sinf.vert) {
		var marginBefore = 'margin-top';
		var marginAfter = 'margin-bottom';
	} else {
		assert(false);
	}

	var boxStyles: inf.BoxStyle[] = [];
	childrenBySpacing.spacings.forEach((spacing, i) => {
		if (!spacing)
			return;

		if (i === 0) {
			var box = childrenBySpacing.nonSpacings[0];
			var marginName = marginBefore;
		} else {
			var box = childrenBySpacing.nonSpacings[i - 1];
			var marginName = marginAfter;
		}
		var value = spacing.getLengthValueByUnit(sinf.LengthUnit.PIXELS);

		if (value > 0) {
			boxStyles.push({
				box: box,
				style: {
					name: marginName,
					value: value + 'px',
					becauseOf: spacing.boxes,
				}
			});
		}
	});

	return {
		isNode: false,
		boxStyles: boxStyles,
	};
}

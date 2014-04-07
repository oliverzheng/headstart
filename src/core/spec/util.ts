import assert = require('assert');
import inf = require('./interfaces');

export function sortNumbers(numbers: number[]) {
	/* Damn it JavaScript. Why is this not built in? Go home, you are drunk. */
	numbers.sort((a, b) => {
		return a - b;
	});
}

var genIdCounter = 0;
export function genId(): string {
	return 'gen' + (genIdCounter++);
}

function cloneTreeAny(obj: any): any {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Array
    if (obj instanceof Array) {
        var copyArray = <any[]>[];
        for (var i = 0, len = obj.length; i < len; i++) {
            copyArray[i] = cloneTreeAny(obj[i]);
        }
        return copyArray;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy: any = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr) && attr !== 'parent')
				copy[attr] = cloneTreeAny(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function cloneTree(box: inf.Box): inf.Box {
	return cloneTreeAny(box);
}

// TODO: Make a god damn copy function already.

/*
export function boxToJSON(box: inf.Box): inf.Box {
	delete box.parent;
	(box.children || []).forEach((child) => {
		boxToJSON(child);
	});
	return box;
}

export function boxFromJSON(box: inf.Box): inf.Box {
	tree.refreshParents(box);
	return box;
}
*/

export function refreshParents(root: inf.Box): void {
	(function refresh(box: inf.Box) {
		if (box.children)
			box.children.forEach((child) => {
				child.parent = box;
				refresh(child);
			});
	})(root);
}

export function isAncestor(ancestor: inf.Box, descendant: inf.Box): boolean {
	while (descendant) {
		if (descendant === ancestor)
			return true;
		descendant = descendant.parent;
	}
	return false;
}

export function reparent(box: inf.Box, newParent: inf.Box) {
	assert(box.parent && newParent);

	if (box.parent === newParent) {
		return;
	}

	assert(!isAncestor(box, newParent));

	var index = box.parent.children.indexOf(box);
	box.parent.children.splice(index, 1);

	if (!newParent.children) {
		newParent.children = [];
	}
	newParent.children.push(box);

	refreshParents(newParent);
}

/**
 * Whether the two lengths are identical.
 */
export function lengthEquals(first: inf.Length, second: inf.Length): boolean {
	if (!first)
		first = defaultFixedLength;
	if (!second)
		second = defaultFixedLength;

	if (first.unit === second.unit) {
		if (first.unit === inf.LengthUnit.EXPAND ||
			first.unit === inf.LengthUnit.SHRINK)
			return true;
		else
			return first.value === second.value;
	}

	return false;
}

var fixedUnits = [inf.LengthUnit.PIXELS, inf.LengthUnit.PERCENT];
var defaultFixedLength = inf.px(0);

export function fixedLengthsEqual(
		first: inf.Length,
		second: inf.Length
	): boolean {
	first = first || defaultFixedLength;
	second = second || defaultFixedLength;

	if (fixedUnits.indexOf(first.unit) === -1 ||
		fixedUnits.indexOf(second.unit) === -1) {
		return false;
	}

	if (fixedUnits.indexOf(first.unit) !== -1 &&
		fixedUnits.indexOf(second.unit) !== -1 &&
		first.value === 0 && second.value === 0) {
		return true;
	}
	return lengthEquals(first, second);
}

export function addFixedLengths(
		first: inf.Length,
		second: inf.Length
	): inf.Length {
	first = first || inf.px(0);
	second = second || inf.px(0);
	if (fixedUnits.indexOf(first.unit) === -1 ||
		fixedUnits.indexOf(second.unit) === -1) {
		return null;
	}
	var unit: inf.LengthUnit;
	if (first.unit === second.unit) {
		unit = first.unit;
	} else {
		if (first.value === 0) {
			unit = second.unit;
		} else if (second.value === 0) {
			unit = first.unit;
		} else {
			return null;
		}
	}
	return {
		unit: unit,
		value: first.value + second.value,
	};
}

/*
export function addLengths(
		first: inf.Length,
		second: inf.Length
	): inf.Length {
	var sum = addFixedLength(first, second);
	if (sum) {
		return sum;
	}

	if (first.unit === inf.LengthUnit.EXPAND &&
		second.unit === inf.LengthUnit.EXPAND) {
		return inf.expand;
	}
}
*/

export function serializeLength(length: inf.Length): string {
	var value: string;
	var unit: string;
	switch (length.unit) {
		case inf.LengthUnit.PIXELS:
			value = length.value.toString();
			unit = 'px';
			break;
		case inf.LengthUnit.PERCENT:
			value = length.value.toString();
			unit = '%';
			break;
		default:
			return null;
	}
	return value + unit;
}

/**
 * Get the other direction.
 */
export function otherDirection(dir: inf.Direction): inf.Direction {
	if (dir === inf.Direction.HORIZONTAL)
		return inf.Direction.VERTICAL;
	if (dir === inf.Direction.VERTICAL)
		return inf.Direction.HORIZONTAL;
	throw 'Invalid direction';
}

/**
 * Returns if two rects are the same.
 */
export function rectEquals(rect1: inf.Rect, rect2: inf.Rect): boolean {
	return (
		rect1.x === rect2.x &&
		rect1.y === rect2.y &&
		rect1.w === rect2.w &&
		rect1.h === rect2.h
	);
}

/**
 * Returns true if a rect is empty.
 */
export function rectEmpty(rect: inf.Rect): boolean {
	return rect.w <= 0 || rect.h <= 0;
}

/**
 * Returns whether or not rect1 completely contains rect2.
 */
export function rectContains(rect1: inf.Rect, rect2: inf.Rect): boolean {
	return (
		rect1.x <= rect2.x &&
		rect1.y <= rect2.y &&
		(rect1.x + rect1.w) >= (rect2.x + rect2.w) &&
		(rect1.y + rect1.h) >= (rect2.y + rect2.h)
	);
}

/**
 * Returns if one rect is bigger than another. This differs from rectContains in
 * that it returns false when any edges touch.
 */
export function rectBiggerThan(rect1: inf.Rect, rect2: inf.Rect): boolean {
	return (
		rect1.x < rect2.x &&
		rect1.y < rect2.y &&
		(rect1.x + rect1.w) > (rect2.x + rect2.w) &&
		(rect1.y + rect1.h) > (rect2.y + rect2.h)
	);
}

/**
 * Returns whether or not rect1 overlaps rect2.
 */
export function rectOverlaps(rect1: inf.Rect, rect2: inf.Rect): boolean {
	var horizOverlap = (
		/* Left edge of rect1 is between rect2. */
		(rect1.x >= rect2.x && rect1.x < (rect2.x + rect2.w) &&
		 rect1.x + rect1.w > rect2.x) || /* Zero width does not overlap. */
		/* Left edge of rect2 is between rect1. */
		(rect2.x >= rect1.x && rect2.x < (rect1.x + rect1.w) &&
		 rect2.x + rect2.w > rect1.x)
	);

	var vertOverlap = (
		/* Top edge of rect1 is between rect2. */
		(rect1.y >= rect2.y && rect1.y < (rect2.y + rect2.h) &&
		 rect1.y + rect1.h > rect2.y) ||
		/* Top edge of rect2 is between rect1. */
		(rect2.y >= rect1.y && rect2.y < (rect1.y + rect1.h) &&
		 rect2.y + rect2.h > rect1.y)
	);

	return horizOverlap && vertOverlap;
}

/**
 * Returns the area of a rect.
 */
export function rectArea(rect: inf.Rect): number {
	return rect.w * rect.h;
}

/**
 * Sort comparison function for the area of two rectangles. If both rectangles
 * have zero area, the one with a longer side is bigger.
 */
export function rectCmpArea(rect1: inf.Rect, rect2: inf.Rect): number {
	var rectArea1 = rectArea(rect1);
	var rectArea2 = rectArea(rect2);
	if (rectArea1 !== 0 && rectArea2 !== 0)
		return rectArea1 - rectArea2;
	else
		return Math.max(rect1.w, rect1.h) - Math.max(rect2.w, rect2.h);
}

/**
 * Given two rects that are aligned horizontally or vertically, get the rect
 * that fills the gap between them.
 */
export function getRectBetween(rect1: inf.Rect, rect2: inf.Rect): inf.Rect {
	var horizontal = [rect1.x, rect1.x + rect1.w, rect2.x, rect2.x + rect2.w];
	var vertical = [rect1.y, rect1.y + rect1.h, rect2.y, rect2.y + rect2.h];
	sortNumbers(horizontal);
	sortNumbers(vertical);
	return {
		x: horizontal[1],
		y: vertical[1],
		w: horizontal[2] - horizontal[1],
		h: vertical[2] - vertical[1],
	};
}

/**
 * Get the rectangle that most tightly fits an input of rectangles.
 */
export function getBoundingRect(rects: inf.Rect[]): inf.Rect {
	if (rects.length === 0)
		throw 'No rects';

	/* Don't modify the original rects. */
	var first = rects.pop();
	var bound = {
		x: first.x,
		y: first.y,
		w: first.w,
		h: first.h,
	};
	while (rects.length > 0) {
		var rect = rects.pop();
		bound = {
			x: Math.min(bound.x, rect.x),
			y: Math.min(bound.y, rect.y),
			w: Math.max(bound.x + bound.w, rect.x + rect.w),
			h: Math.max(bound.y + bound.h, rect.y + rect.h),
		};
		bound.w -= bound.x;
		bound.h -= bound.y;
	}
	return bound;
}

/**
 * Whether or not this box is rendered with any content, including bitmaps,
 * gradients, text, etc.
 */
/*
export function hasContent(box: inf.Box): boolean {
	return !box.generated;
}
*/

/**
 * Returns box1 - box2.
 */
export function rectOffset(rect1: inf.Rect, rect2: inf.Rect): inf.Position {
	return {
		x: rect1.x - rect2.x,
		y: rect1.y - rect2.y,
	};
}

export function textExactLines(text: inf.StaticText): number {
	if (!text.inputMinLines || !text.inputMaxLines ||
		text.inputMinLines !== text.inputMaxLines) {
		return;
	}
	var lines = text.inputMinLines;
	if (text.outputMaxLines && text.outputMaxLines !== lines) {
		return;
	}
	return lines;
}

export function getLength<LengthType>(obj: any, direction: inf.Direction): LengthType {
	if (direction === inf.horiz) {
		return <LengthType>(obj.w);
	} else if (direction === inf.vert) {
		return <LengthType>(obj.h);
	}
}

export function getPosition<PositionType>(obj: any, direction: inf.Direction): PositionType {
	if (direction === inf.horiz) {
		return <PositionType>(obj.x);
	} else if (direction === inf.vert) {
		return <PositionType>(obj.y);
	}
}

export function forEachDirection(callback: (direction: inf.Direction) => any) {
	callback(inf.horiz);
	callback(inf.vert);
}

import BoxAttribute = require('../attributes/BoxAttribute');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

export function getBoxFixedSize(
		component: c.Component,
		direction: sinf.Direction,
		allowPercentage: boolean
	): sinf.Length {

	var boxAttr = component.boxAttr();
	if (!boxAttr) {
		return;
	}
	var box = boxAttr.getBox();

	var len: sinf.Length;
	if (direction === sinf.vert) {
		len = box.h;
	} else if (direction === sinf.horiz) {
		len = box.w;
	}

	if (len.unit !== sinf.LengthUnit.PIXELS &&
		len.unit !== sinf.LengthUnit.PERCENT) {
		return;
	}
	
	if (!allowPercentage && len.unit === sinf.LengthUnit.PERCENT) {
		return;
	}

	return len;
}

export function isBoxSizePercent(
		component: c.Component,
		direction: sinf.Direction
	): boolean {
	var size = getBoxFixedSize(component, direction, true);
	return size && size.unit === sinf.LengthUnit.PERCENT;
}

export function getAggregatedSize(
		component: c.Component,
		direction: sinf.Direction
	): sinf.Length {
	var size = getBoxFixedSize(component, direction, false);
	if (size) {
		return size;
	}

	var childrenAttr = component.childrenAttr();
	if (!childrenAttr) {
		return;
	}
	var children = childrenAttr.getChildren();
	var lengths = children.map((child) => {
		return getAggregatedSize(child, direction);
	});
	if (lengths.some((length) => !length)) {
		return;
	}
	return lengths.reduce(sutil.addFixedLengths);
}

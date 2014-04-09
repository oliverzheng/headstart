import assert = require('assert');

import c = require('./Component');
import reqs = require('./requirements');
import Attributes = require('./Attributes');
import LengthAttribute = require('./attributes/LengthAttribute');
import Spacing = require('./attributes/Spacing');
import Alignment = require('./attributes/Alignment');
import CSSAttribute = require('./attributes/CSSAttribute');
import sinf = require('../spec/interfaces');
import sutil = require('../spec/util');

export function getSpacingBetween(c1: c.Component, c2: c.Component, direction: sinf.Direction): LengthAttribute {
	var common = c.Component.getCommonAncestor(c1, c2);
	assert(common.ancestor);

	var pos1 = getDescendentPosition(common.ancestor, c1);
	var firstDistance = sutil.getPosition<LengthAttribute>(pos1, direction);
	if (!firstDistance || !firstDistance.px.isSet())
		return null;
	var firstLength = LengthAttribute.getFrom(c1, direction);
	if (!firstLength || !firstLength.px.isSet())
		return null;

	firstDistance = firstDistance.add(firstLength);

	var pos2 = getDescendentPosition(common.ancestor, c2);
	var secondDistance = sutil.getPosition<LengthAttribute>(pos2, direction);
	if (!secondDistance || !secondDistance.px.isSet())
		return null;

	return secondDistance.subtract(firstDistance);
}

export function canLengthBeMarginOrPadding(length: LengthAttribute): boolean {
	if (length.direction === sinf.horiz)
		return length.px.isSet() || length.pct.isSet();
	else
		return length.px.isSet();
}

export function getDescendentPosition(ancestor: c.Component, descendent: c.Component, bottomRight: boolean = false): Attributes.ChildPosition {
	assert(descendent.isDescendentOf(ancestor));
	var descendentPosition: Attributes.ChildPosition;
	while (descendent !== ancestor) {
		var position = descendent.getParent().getChildrenManager().getChildPosition(descendent, null, bottomRight);
		if (!descendentPosition) {
			descendentPosition = position;
		} else {
			if (descendentPosition.x)
				descendentPosition.x = LengthAttribute.addChild(position.x, descendentPosition.x);
			if (descendentPosition.y)
				descendentPosition.y = LengthAttribute.addChild(position.y, descendentPosition.y);
		}

		if (!descendentPosition.x && !descendentPosition.y)
			break;

		descendent = descendent.getParent();
	}
	return descendentPosition;
}

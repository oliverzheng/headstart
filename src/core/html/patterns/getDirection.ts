import c = require('../Component');
import sinf = require('../../spec/interfaces');
import BlockFormattingAttribute = require('../attributes/BlockFormattingAttribute');
import FloatFormattingAttribute = require('../attributes/FloatFormattingAttribute');

function getDirection(component: c.Component): sinf.Direction {
	var boxAttr = component.boxAttr();
	if (boxAttr) {
		return boxAttr.getBox().direction;
	}

	var bf = BlockFormattingAttribute.getFrom(component);
	if (bf) {
		return sinf.vert;
	}

	var ff = FloatFormattingAttribute.getFrom(component);
	if (ff) {
		return sinf.horiz;
	}

	var parent = component.getParent();
	if (parent) {
		return getDirection(parent);
	}
}

export = getDirection;

import c = require('../Component');
import sinf = require('../../spec/interfaces');

function getDirection(component: c.Component): sinf.Direction {
	var boxAttr = component.boxAttr();
	if (boxAttr) {
		return boxAttr.getBox().direction;
	}

	var parent = component.getParent();
	if (parent) {
		return getDirection(parent);
	}
}

export = getDirection;

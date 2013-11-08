import c = require('../Component');
import sinf = require('../../spec/interfaces');

function getDirection(component: c.Component): sinf.Direction {
	var boxAttr = component.boxAttr();
	if (!boxAttr) {
		return;
	}
	return boxAttr.getBox().direction;
}

export = getDirection;

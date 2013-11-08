import c = require('../Component');
import sinf = require('../../spec/interfaces');

function getDynamicBox(component: c.Component): sinf.Box {
	var boxAttr = component.boxAttr();
	if (boxAttr && boxAttr.getBox().content === sinf.Content.DYNAMIC_BOX) {
		return boxAttr.getBox();
	}
}

export = getDynamicBox;

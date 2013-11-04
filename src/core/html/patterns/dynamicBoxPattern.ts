import Component = require('../Component');
import sinf = require('../spec/interfaces');

function dynamicBoxPattern(component: Component): sinf.Box {
	var boxAttr = component.boxAttr();
	if (boxAttr && boxAttr.getBox().content === sinf.Content.DYNAMIC_BOX) {
		return boxAttr.getBox();
	}
}

export = dynamicBoxPattern;

import c = require('../Component');
import sinf = require('../../spec/interfaces');

function isText(component: c.Component): boolean {
	var boxAttr = component.boxAttr();
	if (!boxAttr)
		return false;
	var box = boxAttr.getBox();
	return (
		box.staticContent != null &&
		box.staticContent.text != null
	);
}

export = isText;

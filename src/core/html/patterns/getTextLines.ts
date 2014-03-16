import c = require('../Component');
import sinf = require('../../spec/interfaces');
import util = require('../../spec/util');

function getTextLines(component: c.Component): number {
	var box = component.getBox();
	if (box && box.staticContent && box.staticContent.text) {
		return util.textExactLines(box.staticContent.text);
	} else {
		var sum = 0;
		component.getChildren().forEach((child) => (sum += getTextLines(child)));
		return sum;
	}
}

export = getTextLines;

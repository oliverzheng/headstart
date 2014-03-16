import c = require('../Component');
import sinf = require('../../spec/interfaces');

function isText(component: c.Component, excludeDescendents: boolean = false): boolean {
	if (component.nodeAttr())
		return false;

	var box = component.getBox();
	if (box && box.staticContent && box.staticContent.text) {
		return true;
	} else if (!excludeDescendents) {
		var children = component.getChildren();
		return (
			children.some((child) => isText(child)) &&
			children.every((child) => !component.nodeAttr())
		);
	}
	return false;
}

export = isText;

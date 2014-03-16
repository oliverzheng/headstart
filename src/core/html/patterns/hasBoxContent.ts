import c = require('../Component');
import sinf = require('../../spec/interfaces');

function doesBoxHaveContent(box: sinf.Box, excludeStatic : boolean): boolean {
	return (!excludeStatic && box.staticContent != null) || box.createNode;
}

function hasBoxContent(component: c.Component, excludeStatic: boolean = false): boolean {
	var boxAttr = component.boxAttr();
	if (boxAttr && doesBoxHaveContent(boxAttr.getBox(), excludeStatic)) {
		return true;
	}

	var hasNonEmptyChild = false;
	component.iterateChildrenBreadthFirst((childComponent) => {
		if (hasNonEmptyChild) {
			return;
		}
		var boxAttr = childComponent.boxAttr();
		if (boxAttr && doesBoxHaveContent(boxAttr.getBox(), excludeStatic)) {
			hasNonEmptyChild = true;
		}
	});

	return hasNonEmptyChild;
}

export = hasBoxContent;

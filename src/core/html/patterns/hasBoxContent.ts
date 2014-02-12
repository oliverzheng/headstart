import c = require('../Component');
import sinf = require('../../spec/interfaces');

function doesBoxHaveContent(box: sinf.Box): boolean {
	return box.staticContent != null || box.createNode;
}

function hasBoxContent(component: c.Component): boolean {
	var boxAttr = component.boxAttr();
	if (boxAttr && doesBoxHaveContent(boxAttr.getBox())) {
		return true;
	}

	var hasNonEmptyChild = false;
	component.iterateChildrenBreadthFirst((childComponent) => {
		if (hasNonEmptyChild) {
			return;
		}
		var boxAttr = childComponent.boxAttr();
		if (boxAttr && doesBoxHaveContent(boxAttr.getBox())) {
			hasNonEmptyChild = true;
		}
	});

	return hasNonEmptyChild;
}

export = hasBoxContent;

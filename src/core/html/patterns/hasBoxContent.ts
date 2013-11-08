import c = require('../Component');
import sinf = require('../../spec/interfaces');

function doesBoxHaveContent(box: sinf.Box): boolean {
	return box.content != null && box.content !== sinf.Content.NONE;
}

function hasBoxContent(component: c.Component): boolean {
	var boxAttr = component.boxAttr();
	if (boxAttr && doesBoxHaveContent(boxAttr.getBox())) {
		return true;
	}

	var childrenAttr = component.childrenAttr();
	var hasNonEmptyChild = false;
	if (childrenAttr) {
		childrenAttr.breadthFirst((childComponent) => {
			if (hasNonEmptyChild) {
				return;
			}
			var boxAttr = childComponent.boxAttr();
			if (boxAttr && doesBoxHaveContent(boxAttr.getBox())) {
				hasNonEmptyChild = true;
			}
		});
	}

	return hasNonEmptyChild;
}

export = hasBoxContent;

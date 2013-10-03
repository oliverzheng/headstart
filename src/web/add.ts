import inf = require('../core/visual/interfaces');
import box = require('./box');

var boxCounter = 0;
export function createBox(width: number = 40, height: number = 40): inf.Box {
	return {
		id: (boxCounter++).toString(),
		w: inf.px(width),
		h: inf.px(height),
		direction: inf.horiz
	};
}

export function deleteBox(box: inf.Box): void {
	box.parent.children.splice(box.parent.children.indexOf(box), 1);
}

export function addChild(parent: inf.Box, child: inf.Box) {
	if (!parent.children) {
		parent.children = [];
	}

	parent.children.push(child);
	child.parent = parent;
}

import inf = require('../visual/interfaces');
import l = require('../visual/layout');

export interface Style {
	name: string;
	value: string;
	becauseOf: inf.Box;
}

export interface Node {
	tag: string;
	content?: string;
	children?: Node[];
	classes?: string[];
	styles?: Style[];
	becauseOf: inf.Box;
}

export class Rule {
	layout: l.Layout;

	constructor(layout: l.Layout) {
		this.layout = layout;
	}

	applies(box: inf.Box): boolean {
		return false;
	}

	getNode(box: inf.Box): Node {
		return null;
	}

	getChildrenNodes(box: inf.Box): Node[] {
		return [];
	}
}

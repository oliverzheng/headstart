import inf = require('../visual/interfaces');
import l = require('../visual/layout');

export interface DOMNode {
	tag: string;
	content?: string;
	children?: DOMNode[];
	classes?: string[];
	styles?: {[styleName: string]: string;};
}

export class Rule {
	layout: l.Layout;

	constructor(layout: l.Layout) {
		this.layout = layout;
	}

	applies(box: inf.Box): boolean {
		return false;
	}

	getNode(box: inf.Box): DOMNode {
		return null;
	}

	getChildrenNodes(box: inf.Box): DOMNode[] {
		return [];
	}
}

import inf = require('../visual/interfaces');
import l = require('../visual/layout');

export interface DOMNode {
	tag: string;
	content?: string;
	children?: DOMNode[];
}

export interface Rule {
	applies(layout: l.Layout, box: inf.Box): boolean;

	getNode?(layout: l.Layout, box: inf.Box): DOMNode;

	getChildrenNodes?(layout: l.Layout, box: inf.Box): DOMNode[];
}

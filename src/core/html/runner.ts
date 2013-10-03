/// <reference path='../../../d.ts/typings.d.ts' />
import assert = require('assert');

import inf = require('./interfaces');
import vinf = require('../visual/interfaces');
import l = require('../visual/layout');
import rules = require('./rules');

/*
interface DOMNode {
	layout: l.Layout;
	box?: vinf.Box;
	direction?: vinf.Direction;
	children?: DOMNode[];
	childrenSpacing?: inf.Length[];
	spacingNear?: inf.Length;
	spacingFar?: inf.Length;
}

interface BoxToDOMNodeResult {
	node: DOMNode;
	spacingNear: inf.Length;
	spacingFar: inf.Length;
}

function boxToDOMNode(layout: l.Layout, box: inf.Box): BoxToDOMNodeResult {
	return null;
}
*/

var availableRules = [
	rules.RootRule,
];

export class NoRulesError {
	box: vinf.Box;

	constructor(box: vinf.Box) {
		this.box = box;
	}
}

export function runRules(layout: l.Layout, box: vinf.Box = null): inf.DOMNode[] {
	var box = box || layout.root;
	for (var i = 0; i < availableRules.length; ++i) {
		var rule = availableRules[i];
		if (rule.applies(layout, box)) {
			var node: inf.DOMNode;
			if (rule.getNode) {
				node = rule.getNode(layout, box);
			}
			if (node) {
				var children = box.children || <vinf.Box[]>[];
				node.children = (<inf.DOMNode[]>[]).concat.apply([], children.map((child) => {
					return runRules(layout, child);
				}));
				return [node];
			} else {
				return rule.getChildrenNodes(layout, box);
			}
		}
	}
	throw new NoRulesError(box);
}

export function nodeToHtml(node: inf.DOMNode): string {
	assert(!(node.content && node.children));
	var inside = '';
	if (node.content) {
		inside = node.content;
	} else if (node.children) {
		inside = nodesToHtml(node.children);
	}
	return '<' + node.tag + '>' + inside + '</' + node.tag + '>';
}

export function nodesToHtml(nodes: inf.DOMNode[]): string {
	return nodes.map(nodeToHtml).join('');
}

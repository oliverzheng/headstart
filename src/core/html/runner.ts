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

export class Runner {
	rules: inf.Rule[];
	layout: l.Layout;

	constructor(layout: l.Layout) {
		this.layout = layout;
		this.rules = [
			new rules.RootRule(layout),
		];
	}

	toNodes(box: vinf.Box = null): inf.DOMNode[] {
		var box = box || this.layout.root;
		for (var i = 0; i < this.rules.length; ++i) {
			var rule = this.rules[i];
			if (rule.applies(box)) {
				var node = rule.getNode(box);
				if (node) {
					var children = box.children || <vinf.Box[]>[];
					node.children = (<inf.DOMNode[]>[]).concat.apply([], children.map((child) => {
						return this.toNodes(child);
					}));
					return [node];
				} else {
					return rule.getChildrenNodes(box);
				}
			}
		}
		throw new NoRulesError(box);
	}
}

export function nodeToHtml(node: inf.DOMNode): string {
	assert(!(node.content && node.children));
	var inside = '';
	if (node.content) {
		inside = node.content;
	} else if (node.children) {
		inside = nodesToHtml(node.children);
	}
	var attrs = '';
	if (node.styles) {
		attrs += ' style="';
		for (var name in node.styles) {
			if (node.styles.hasOwnProperty(name)) {
				attrs += name + ': ' + node.styles[name] + '; ';
			}
		}
		attrs += '"';
	}
	if (node.classes) {
		attrs += ' class="';
		attrs += node.classes.join(' ');
		attrs += '"';
	}
	return '<' + node.tag + attrs + '>' + inside + '</' + node.tag + '>';
}

export function nodesToHtml(nodes: inf.DOMNode[]): string {
	return nodes.map(nodeToHtml).join('');
}

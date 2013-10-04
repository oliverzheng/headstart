/// <reference path='../../../d.ts/typings.d.ts' />
import assert = require('assert');

import gen = require('../visual/generator');
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
			new rules.FixedUserManagedBoxRule(layout),
		];
	}

	toNodes(box: vinf.Box = null): inf.Node[] {
		var box = box || this.layout.root;
		for (var i = 0; i < this.rules.length; ++i) {
			var rule = this.rules[i];
			if (rule.applies(box)) {
				var node = rule.getNode(box);
				if (node) {
					var children = box.children || <vinf.Box[]>[];
					node.children = (<inf.Node[]>[]).concat.apply([], children.map((child) => {
						return this.toNodes(child);
					}));
					return [node];
				} else {
					return rule.getChildrenNodes(box);
				}
			}
		}
		return [];
	}
}

export function nodeToHtml(node: inf.Node): string {
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
		attrs += node.styles.map((style) => style.name + ': ' + style.value + ';').join(' ');
		attrs += '"';
	}
	if (node.classes) {
		attrs += ' class="';
		attrs += node.classes.join(' ');
		attrs += '"';
	}
	return '<' + node.tag + attrs + '>' + inside + '</' + node.tag + '>';
}

export function nodesToHtml(nodes: inf.Node[]): string {
	return nodes.map(nodeToHtml).join('');
}

function getNodesForBox(node: inf.Node, box: vinf.Box): inf.Node[] {
	var nodes: inf.Node[] = [];
	var boxUsed = false;
	if (node.becauseOf === box) {
		boxUsed = true;
	}
	if (!boxUsed && node.styles) {
		node.styles.forEach((style) => {
			if (style.becauseOf === box) {
				boxUsed = true;
			}
		});
	}
	if (boxUsed) {
		nodes.push(node);
	}
	if (node.children) {
		nodes.push.apply(nodes,
			[].concat.apply(
				[],
				node.children.map((child) => getNodesForBox(child, box))
			)
		);
	}
	return nodes;
}

export function boxesNotUsed(rootNode: inf.Node, layout: l.Layout): vinf.Box[] {
	var depthFirst = new gen.DepthFirst(layout.root);
	return depthFirst.filter((box) => getNodesForBox(rootNode, box).length === 0).toArray();
}

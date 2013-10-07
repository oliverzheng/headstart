import assert = require('assert');

import sinf = require('../spec/interfaces');
import inf = require('./interfaces');

export interface NodeStyle {
	node: inf.Node;
	style: inf.Style;
}

export class Dom {
	nodes: inf.NodeFromBox[] = [];

	private getNodesForBox(box: sinf.Box): inf.NodeFromBox[] {
		return this.nodes.filter((node) => node.becauseOf.indexOf(box) !== -1);
	}

	getNodeForBox(box: sinf.Box): inf.NodeFromBox {
		var nodes = this.getNodesForBox(box);
		assert(nodes.length <= 1);
		return nodes[0];
	}

	getStylesForBox(box: sinf.Box): NodeStyle[] {
		var styles: NodeStyle[] = [];
		var nodesWithStyles: inf.NodeFromBox[] = this.nodes.filter(
			(node) => !!node.styles
		);
		var nodeStyles: NodeStyle[][] = nodesWithStyles.map((node: inf.NodeFromBox) => {
			var stylesBecauseOf: inf.Style[] = node.styles.filter(
				(style) => style.becauseOf.indexOf(box) !== -1
			);
			return stylesBecauseOf.map((style) => {
				return {
					node: node,
					style: style,
				};
			});
		});
		styles = styles.concat.apply(styles, nodeStyles);

		return styles;
	}

	makeHierarchy(root: sinf.Box): inf.NodeFromBox[] {
		var childrenNodes: inf.NodeFromBox[] = [];
		if (root.children) {
			childrenNodes = childrenNodes.concat.apply(
				childrenNodes, root.children.map(this.makeHierarchy.bind(this))
			);
		}

		var node = this.getNodeForBox(root);
		if (node) {
			if (childrenNodes.length > 0) {
				node.children = childrenNodes;
			}
			return [node];
		} else {
			return childrenNodes;
		}
	}

	private static stylesToHtml(styles: inf.Style[]): string {
		return styles.map(
			(style) => style.name + ': ' + style.value + ';'
		).join(' ');
	}

	toHtml(node: inf.Node = null): string {
		var children = '';
		if (node.children) {
			children = node.children.map(this.toHtml.bind(this)).join('');
		}
		var attrs = '';
		if (node.styles) {
			attrs += ' style="' + Dom.stylesToHtml(node.styles) + '"';
		}
		return '<node' + attrs + '>' + children + '</node>';
	}
}

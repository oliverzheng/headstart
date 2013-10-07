/// <reference path='../../../d.ts/typings.d.ts' />
import assert = require('assert');

import gen = require('../spec/generator');
import inf = require('./interfaces');
import sinf = require('../spec/interfaces');
import l = require('../spec/layout');
import d = require('./dom');
import allRules = require('./allRules');

export class Runner {
	dom: d.Dom;
	layout: l.Layout;
	ran: boolean;

	constructor(layout: l.Layout) {
		this.dom = new d.Dom();
		this.layout = layout;
		this.ran = false;
	}

	run() {
		var depthFirst = new gen.DepthFirst(this.layout.root);
		depthFirst.forEach((box) => {
			for (var ii = 0; ii < allRules.length; ++ii) {
				var rule = allRules[ii];
				var result = rule(this.layout, this.dom, box);
				if (!result)
					continue;

				if (result.isNode && !this.dom.getNodeForBox(box)) {
					var node: inf.NodeFromBox = {
						becauseOf: [box],
					};
					this.dom.nodes.push(node);
				}
				if (result.boxStyles) {
					result.boxStyles.forEach((boxStyle) => {
						var node = this.dom.getNodeForBox(boxStyle.box);
						if (!node) {
							var node = {
								becauseOf: [boxStyle.box],
							};
							this.dom.nodes.push(node);
						}
						if (!node.styles) {
							node.styles = [];
						}
						node.styles.push(boxStyle.style);
					});
				}
			}
		});

		this.dom.makeHierarchy(this.layout.root);

		this.ran = true;
	}

	getRootNode(): inf.Node {
		assert(this.ran);
		return this.dom.getNodeForBox(this.layout.root);
	}

	getDom(): d.Dom {
		assert(this.ran);
		return this.dom;
	}

	getBoxesNotUsed(): sinf.Box[] {
		assert(this.ran);

		var depthFirst = new gen.DepthFirst(this.layout.root);
		return depthFirst.filter((box) => {
			return (
				!this.dom.getNodeForBox(box) &&
				this.dom.getStylesForBox(box).length === 0
			);
		}).toArray();
	}
}

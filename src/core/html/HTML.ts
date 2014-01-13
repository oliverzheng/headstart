import assert = require('assert');

import c = require('./Component');
import CSSAttribute = require('./attributes/CSSAttribute');
import TextContent = require('./attributes/TextContent');
import NodeAttribute = require('./attributes/NodeAttribute');

export class DOMNode {
	tagName: string;
	children: DOMNode[] = [];
	content: string;
	styles: { [styleName: string]: string; } = {};

	constructor(tagName: string) {
		this.tagName = tagName;
	}

	reprCss(): string {
		var styles: string[] = [];
		for (var name in this.styles) {
			styles.push(name + ': ' + this.styles[name]);
		}
		return styles.join('; ');
	}

	static fromComponent(component: c.Component): DOMNode[] {
		var childrenNodes: DOMNode[] = [];

		component.getChildren().forEach((child) => {
			childrenNodes.push.apply(childrenNodes, DOMNode.fromComponent(child));
		});

		var textContent = TextContent.getFrom(component);
		var text: string = (textContent && textContent.value) || null;

		// Only one of these apply
		assert(!(text && (childrenNodes.length > 0)));

		var nodeAttr = NodeAttribute.getFrom(component);
		if (nodeAttr && !component.isRoot()) {
			var css = CSSAttribute.getFrom(component);
			var tagName = (css && css.styles['display'] === 'block') ? 'div' : 'span';
			var node = new DOMNode(tagName);
			if (css) {
				node.styles = css.styles;
			}
			node.children = childrenNodes;
			node.content = text;
			return [node];
		} else {
			return childrenNodes;
		}
	}
}

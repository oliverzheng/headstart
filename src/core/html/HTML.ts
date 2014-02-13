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
			var value = this.styles[name];
			if (name === 'display' &&
				(value === 'block' || value === 'inline')) {
				continue;
			}
			styles.push(name + ': ' + value);
		}
		return styles.join('; ');
	}

	toString(depth: number = 0): string {
		var spaces = Array(depth + 1).join('  ');

		var str = spaces + '<' + this.tagName;
		var css = this.reprCss();
		if (css) {
			str += ' style="' + css + '"';
		}
		str += '>\n';

		if (this.content) {
			str += spaces + '  ' + this.content + '\n';
		} else {
			str += this.children.map((child) => child.toString(depth + 1)).join('');
		}

		str += spaces + '</' + this.tagName + '>\n';

		return str;
	}

	static fromComponent(component: c.Component): DOMNode[] {
		var childrenNodes: DOMNode[] = [];

		component.getChildren().forEach((child) => {
			childrenNodes.push.apply(childrenNodes, DOMNode.fromComponent(child));
		});

		var textContent: TextContent;
		component.iterateChildrenBreadthFirst((descendent) => {
			if (descendent !== component && descendent.nodeAttr()) {
				return c.STOP_RECURSION;
			}
			var descendentText = TextContent.getFrom(descendent);
			if (descendentText) {
				assert(!textContent);
				textContent = descendentText;
			}
		});
		var text: string = (textContent && textContent.getText().value) || null;

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

import assert = require('assert');

import c = require('./Component');
import Attributes = require('./Attributes');
import CSSAttribute = require('./attributes/CSSAttribute');
import TextContent = require('./attributes/TextContent');
import TagName = require('./attributes/TagName');
import NodeAttribute = require('./attributes/NodeAttribute');

export class DOMNode {
	tagName: string;
	children: DOMNode[] = [];
	content: string;
	styles: { [styleName: string]: string; } = {};

	constructor(tagName: string) {
		this.tagName = tagName;
	}

	repr(): Attributes.Repr {
		var contentRepr: Attributes.Repr = {
			title: 'Content: ' + (this.content ? this.content : ''),
		};
		var stylesRepr: Attributes.Repr = {
			title: 'Styles',
			ordered: false,
			children: this.stylesList().map((style) => {
				return <Attributes.Repr>{
					title: style.name + ': ' + style.value,
				};
			}),
		};
		var childrenRepr: Attributes.Repr = {
			title: 'Children',
			ordered: true,
			children: this.children.map((child) => child.repr()),
		};
		return {
			title: 'Tag: ' + this.tagName,
			ordered: false,
			children: [
				contentRepr,
				stylesRepr, 
				childrenRepr,
			],
		}
	}

	private stylesList(): {name: string; value: string;}[] {
		var styles: {name: string; value: string}[] = [];
		for (var name in this.styles) {
			var value = this.styles[name];
			if (name === 'display' &&
				(value === 'block' || value === 'inline')) {
				continue;
			}
			styles.push({name: name, value: value});
		}
		return styles;
	}

	reprCss(): string {
		return this.stylesList().map(
			(style) => (style.name + ': ' + style.value)
		).join('; ');
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
			var css = CSSAttribute.getFrom(component, false/*isRendering*/);
			var tagNameAttr = TagName.getFrom(component);
			var tagName: string;
			if (tagNameAttr) {
				tagName = tagNameAttr.tagName;
			} else {
				tagName = (css && css.styles['display'] === 'block') ? 'div' : 'span';
			}
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

	static fromComponentToRepr(component: c.Component): Attributes.Repr {
		var domNodes = DOMNode.fromComponent(component);
		return {
			title: 'DOM',
			children: domNodes.map((node) => node.repr()),
		};
	}
}

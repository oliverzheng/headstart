import assert = require('assert');

import Rules = require('../Rules');
import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import BoxAttribute = require('./BoxAttribute');
import NodeAttribute = require('./NodeAttribute');

class TextContent extends Markup {
	getType() {
		return Attributes.Type.TEXT_CONTENT;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		var css: { [name: string]: string; } = {
			'font-size': this.getText().fontSize.toString() + 'px',
		};
		if (this.getText().fontFamily) {
			css['font-family'] = this.getText().fontFamily;
		}
		return [{
			component: this.component,
			css: css,
		}];
	}

	static getFrom(component: c.Component): TextContent {
		return <TextContent>(component.getAttr(Attributes.Type.TEXT_CONTENT));
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (value: ' + this.getText().value + ')';
		return repr;
	}

	getText(): sinf.StaticText {
		return this.component.boxAttr().getBox().staticContent.text;
	}

	static needsNodeRule(component: c.Component): Rules.RuleResult[] {
		var textAttr = TextContent.getFrom(component);
		if (!textAttr || component.nodeAttr())
			return;

		var nodeParent = component;
		while (nodeParent = nodeParent.getParent()) {
			if (nodeParent.nodeAttr())
				break;
		}
		var needsNode = false;
		nodeParent.iterateChildrenBreadthFirst((descendent) => {
			if (descendent !== component && TextContent.getFrom(descendent)) {
				needsNode = true;
				return c.STOP_ITERATION;
			}
		});
		if (needsNode) {
			return [{
				component: component,
				attributes: [new NodeAttribute()],
			}];
		}
	}
}

export = TextContent;

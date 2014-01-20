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
		var css = {
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

	getText() {
		return this.component.boxAttr().getBox().staticContent.text;
	}

	static staticTextRule(component: c.Component): Rules.RuleResult[] {
		var boxAttr = component.boxAttr();
		if (!boxAttr)
			return;
		var box = boxAttr.getBox();

		if (box.content !== sinf.Content.STATIC)
			return;

		if (!box.staticContent || !box.staticContent.text)
			return;

		var text = box.staticContent.text;
		if (!text.fontSize)
			return;

		assert(component.getChildren().length === 0);

		if (text.value) {
			return [{
				component: component,
				attributes: [
					new TextContent(),
					new NodeAttribute(),
				],
			}];
		}
	}
}

export = TextContent;

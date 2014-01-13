import assert = require('assert');

import Rules = require('../Rules');
import Attributes = require('../Attributes');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import BoxAttribute = require('./BoxAttribute');

class TextContent extends Attributes.BaseAttribute {
	value: string;

	constructor(value: string) {
		super();

		this.value = value;
	}

	getType() {
		return Attributes.Type.TEXT_CONTENT;
	}

	static getFrom(component: c.Component): TextContent {
		return <TextContent>(component.getAttr(Attributes.Type.TEXT_CONTENT));
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <TextContent>attribute;

		return this.value === attr.value;
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (value: ' + this.value + ')';
		return repr;
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
				attributes: [new TextContent(text.value)],
			}];
		}
	}
}

export = TextContent;

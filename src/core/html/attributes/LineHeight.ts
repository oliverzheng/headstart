import assert = require('assert');

import Rules = require('../Rules');
import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');
import Alignment = require('../attributes/Alignment');
import BoxAttribute = require('./BoxAttribute');
import LengthAttribute = require('./LengthAttribute');

class LineHeight extends Markup {
	lineHeight: number;

	constructor(lineHeight: number) {
		super();

		this.lineHeight = lineHeight;
	}

	getType() {
		return Attributes.Type.LINE_HEIGHT;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		return [{
			component: this.component,
			css: {
				'line-height': this.lineHeight.toString() + 'px',
			},
		}];
	}

	static getFrom(component: c.Component): LineHeight {
		return <LineHeight>(component.getAttr(Attributes.Type.LINE_HEIGHT));
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <LineHeight>attribute;
		return attr.lineHeight === this.lineHeight;
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (line height: ' + this.lineHeight + ')';
		return repr;
	}
}

export = LineHeight;

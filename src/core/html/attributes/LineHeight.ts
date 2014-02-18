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
	getType() {
		return Attributes.Type.LINE_HEIGHT;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		return [{
			component: this.component,
			css: {
				'line-height': this.getLineHeight().toString() + 'px',
			},
		}];
	}

	static getFrom(component: c.Component): LineHeight {
		return <LineHeight>(component.getAttr(Attributes.Type.LINE_HEIGHT));
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	getLineHeight(): number {
		var boxLines = sutil.textExactLines(this.getText());

		var alignment = Alignment.getForChild(this.component, sinf.vert);
		var isVerticalCenter = alignment && alignment.getSimpleAlignment() === sinf.center;

		var container = Alignment.getAlignmentContainer(this.component, sinf.vert);
		var containerHeight: LengthAttribute = container ? LengthAttribute.getFrom(container, sinf.vert) : null;

		var isNode = !!this.component.nodeAttr();

		if (boxLines === 1 && isVerticalCenter && containerHeight && containerHeight.px.isSet() && !isNode) {
			return containerHeight.px.value;
		} else {
			return this.getText().lineHeight;
		}
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (box line height: ' + this.getText().lineHeight + ', used line height: ' + this.getLineHeight() + ')';
		return repr;
	}

	getText() {
		return this.component.boxAttr().getBox().staticContent.text;
	}
}

export = LineHeight;

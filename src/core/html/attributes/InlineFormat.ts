import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import TextContent = require('../attributes/TextContent');
import NodeAttribute = require('../attributes/NodeAttribute');
import getDirection = require('../patterns/getDirection');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class InlineFormat extends Markup {
	getType() {
		return Attributes.Type.INLINE_FORMAT;
	}

	getCSS() {
		return [{
			component: this.component,
			css: {
				display: 'inline',
			}
		}];
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.INLINE_FORMAT);
	}

	static shrinkWidthToTextRule(component: c.Component): Rules.RuleResult[] {
		var textAttr = TextContent.getFrom(component);
		if (!textAttr) {
			return;
		}
		var box = component.boxAttr().getBox();
		var shrinkWidth = box.w.unit === sinf.LengthUnit.SHRINK;
		if (!shrinkWidth) {
			return;
		}

		return [{
			component: component,
			attributes: [new InlineFormat],
		}];
	}
}

export = InlineFormat;

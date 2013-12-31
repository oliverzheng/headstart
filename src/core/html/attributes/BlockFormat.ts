import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import StackedChildren = require('../attributes/StackedChildren');
import NodeAttribute = require('../attributes/NodeAttribute');
import getDirection = require('../patterns/getDirection');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class BlockFormat extends Markup {
	getType() {
		return Attributes.Type.BLOCK_FORMAT;
	}

	getCSS() {
		return [{
			component: this.component,
			css: {
				display: 'block',
			}
		}];
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.BLOCK_FORMAT);
	}

	static verticalRule(component: c.Component): Rules.RuleResult[] {
		if (!NodeAttribute.getFrom(component))
			return;

		if (getDirection(component) === sinf.vert &&
			!StackedChildren.getFrom(component).isEmpty()) {
			return [{
				component: component,
				attributes: [
					new BlockFormat(),
				],
			}];
		}
	}

	static explicitFixedWidthBlockRule(component: c.Component): Rules.RuleResult[] {
		if (!NodeAttribute.getFrom(component))
			return;

		var attr = LengthAttribute.getFrom(component, sinf.horiz);
		if (!attr || !attr.px.isSet() || !attr.px.isExplicit)
			return;

		return [{
			component: component,
			attributes: [new BlockFormat()],
		}]
	}
}

export = BlockFormat;

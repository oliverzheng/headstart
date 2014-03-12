import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import StackedChildren = require('../attributes/StackedChildren');
import NodeAttribute = require('../attributes/NodeAttribute');
import getDirection = require('../patterns/getDirection');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');
import CSSAttribute = require('./CSSAttribute');

class BlockFormat extends Markup {
	getType() {
		return Attributes.Type.BLOCK_FORMAT;
	}

	getCSS() {
		var css = CSSAttribute.getFrom(this.component);
		if (!css || !css.styles['display']) {
			return [{
				component: this.component,
				css: {
					display: 'block',
				}
			}];
		}
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.BLOCK_FORMAT);
	}

	static verticalRule(component: c.Component): Rules.RuleResult[] {
		if (!NodeAttribute.getFrom(component))
			return;

		var stackedChildren = StackedChildren.getFrom(component);
		if (getDirection(component) === sinf.vert &&
			stackedChildren && !stackedChildren.isEmpty()) {
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

	static implicitExpandWidthBlockRule(component: c.Component): Rules.RuleResult[] {
		if (!NodeAttribute.getFrom(component))
			return;

		var attr = LengthAttribute.getFrom(component, sinf.horiz);
		if (!attr || !attr.px.isSet())
			return;

		var direction = getDirection(component);
		if (direction !== sinf.vert)
			return;

		var childrenAttr = StackedChildren.getFrom(component);
		if (!childrenAttr)
			return;

		return childrenAttr.get().map((child) => {
			if (!NodeAttribute.getFrom(child))
				return;

			var childWidth = LengthAttribute.getFrom(component, sinf.horiz);
			if (!childWidth)
				return;

			if (childWidth.looksEqual(attr)) {
				return {
					component: child,
					attributes: [new BlockFormat()],
				};
			}
		}).filter((x) => !!x);
	}
}

export = BlockFormat;

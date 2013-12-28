import assert = require('assert');
import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import StackedChildren = require('../attributes/StackedChildren');
import Alignment = require('../attributes/Alignment');
import getDirection = require('../patterns/getDirection');
import getCrossAlignment = require('../patterns/getCrossAlignment');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class FloatFormat extends Markup {
	getType() {
		return Attributes.Type.FLOAT_FORMAT;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		var css: { component: c.Component; css: { [name: string]: string; }; }[] = [];

		css.push.apply(css, this.getLeft().map((left) => {
			return {
				component: left,
				css: {
					float: 'left',
				}
			};
		}));

		css.push.apply(css, this.getRight().map((right) => {
			return {
				component: right,
				css: {
					float: 'right',
				}
			};
		}));

		return css;
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.FLOAT_FORMAT);
	}

	static isTopHorizontal(component: c.Component): boolean {
		return (
			getDirection(component) === sinf.horiz &&
			getCrossAlignment(component) === sinf.near
		);
	}

	static alignRule(component: c.Component): Rules.RuleResult[] {
		if (!FloatFormat.isTopHorizontal(component))
			return;

		var alignment = Alignment.getFrom(component, sinf.horiz);
		if (!alignment)
			return;

		// Only aligned children on the left and right can be floated
		if (alignment.afterNear || alignment.afterCenter || alignment.center)
			return;

		return [{
			component: component,
			attributes: [new FloatFormat()],
		}]
	}

	getLeft(): c.Component[] {
		var alignment = Alignment.getFrom(this.component, sinf.horiz);
		assert(!!alignment);

		return alignment.near || [];
	}

	getRight(): c.Component[] {
		var alignment = Alignment.getFrom(this.component, sinf.horiz);
		assert(!!alignment);

		return alignment.far || [];
	}
}

export = FloatFormat;

import assert = require('assert');
import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import Alignment = require('../attributes/Alignment');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class HorizontalCenter extends Markup {
	getType() {
		return Attributes.Type.HORIZONTAL_CENTER;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		return [{
			component: this.getCenter(),
			css: {
				'margin-left': 'auto',
				'margin-right': 'auto',
			},
		}];
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.HORIZONTAL_CENTER);
	}

	static marginAutoRule(component: c.Component): Rules.RuleResult[] {
		var alignment = Alignment.getFrom(component, sinf.horiz);
		if (!alignment)
			return;

		// Only aligned children in the center
		if (!alignment.center || alignment.afterNear || alignment.afterCenter || alignment.near || alignment.far)
			return;

		return [{
			component: component,
			attributes: [new HorizontalCenter()],
		}, {
			component: alignment.center,
			attributes: [new NodeAttribute()],
		}]
	}

	getCenter(): c.Component {
		var alignment = Alignment.getFrom(this.component, sinf.horiz);
		assert(!!alignment);

		return alignment.center;
	}
}

export = HorizontalCenter;
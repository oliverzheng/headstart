import Attributes = require('../Attributes');
import Markup = require('../Markup');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class Background extends Markup {
	getType() {
		return Attributes.Type.BACKGROUND;
	}

	getCSS() {
		return [{
			component: this.component,
			css: {
				background: this.getFillColor(),
			}
		}];
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.BACKGROUND);
	}

	static backgroundFillRule(component: c.Component): Rules.RuleResult[] {
		var boxAttr = component.boxAttr();
		if (!boxAttr)
			return;
		var box = boxAttr.getBox();

		if (box.content !== sinf.Content.STATIC)
			return;

		if (!box.staticContent || !box.staticContent.fill)
			return;

		var fill = box.staticContent.fill;
		if (!fill.color)
			return;

		return [{
			component: component,
			attributes: [
				new Background(),
				new NodeAttribute(),
			],
		}];
	}

	getFillColor(): string {
		return this.component.boxAttr().getBox().staticContent.fill.color;
	}
}

export = Background;

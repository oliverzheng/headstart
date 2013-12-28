import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../Component');
import sinf = require('../spec/interfaces');
import Rules = require('../Rules');
import Markup = require('../markup/Markup');
import NodeAttribute = require('./NodeAttribute');

class CSSAttribute extends Attributes.BaseAttribute {
	styles: { [styleName: string]: string; } = {};

	constructor(styles: { [styleName: string]: string; }) {
		super();

		this.styles = styles;
	}

	getType() {
		return Attributes.Type.CSS;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <CSSAttribute>attribute;

		var styleNames = Object.keys(this.styles);
		var otherStyleNames = Object.keys(attr.styles);
		if (styleNames.length !== otherStyleNames.length) {
			return false;
		}
		for (var ii = 0; ii < styleNames.length; ++ii) {
			var styleName = styleNames[ii];
			if (this.styles[styleName] !== attr.styles[styleName]) {
				return false;
			}
		}

		return true;
	}

	merge(attribute: Attributes.BaseAttribute): CSSAttribute {
		if (!this.isSameAttrType(attribute)) { return; }
		var attr = <CSSAttribute>attribute;

		var styles: { [styleName: string]: string; } = {};
		for (var name in this.styles) {
			styles[name] = this.styles[name];
		}

		for (var name in attr.styles) {
			if (styles[name] != null && styles[name] !== attr.styles[name])
				return;
			styles[name] = attr.styles[name];
		}

		return new CSSAttribute(styles);
	}

	repr(): Attributes.Repr {
		var children: Attributes.Repr[] = [];
		for (var name in this.styles) {
			children.push({
				title: name + ': ' + this.styles[name]
			});
		}
		return {
			title: super.repr().title,
			children: children,
		};
	}

	static applyCssRule(component: c.Component): Rules.RuleResult[] {
		var markups: Markup[] = Markup.getMarkupAttributes(component);

		var results: Rules.RuleResult[] = [];
		markups.forEach((markup) => {
			markup.getCSS().forEach((css) => {
				var componentFound = false;
				component.iterateChildrenBreadthFirst((child) => {
					if (child === css.component) {
						results.push({
							component: child,
							attributes: [
								new NodeAttribute(),
								new CSSAttribute(css.css),
							],
						});
						componentFound = true;
						return c.STOP_ITERATION;
					}
				});
				assert(componentFound);
			});
		});
		return results;
	}
}

export = CSSAttribute;

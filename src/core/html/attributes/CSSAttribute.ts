import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import Rules = require('../Rules');
import hasBoxContent = require('../patterns/hasBoxContent');
import Markup = require('../Markup');
import NodeAttribute = require('./NodeAttribute');
import BlockFormat = require('./BlockFormat');

// Prop names mapped to default values
var INHERITED_DEFAULTS: { [styleName: string]: string; } = {
	'color': null,
	'font-family': null,
	'font-size': null,
	'font-style': 'normal',
	'font-weight': 'normal',
	'line-height': null,
	'text-align': 'left',
};

var INHERITED_PROPERTIES = Object.keys(INHERITED_DEFAULTS);

class CSSAttribute extends Attributes.BaseAttribute {
	isRendering: boolean;
	styles: { [styleName: string]: string; } = {};

	constructor(styles: { [styleName: string]: string; }, isRendering: boolean = true) {
		super();

		this.isRendering = isRendering;
		this.styles = styles;
	}

	static getFrom(component: c.Component, isRendering = true): CSSAttribute {
		if (isRendering)
			return <CSSAttribute>component.getAttr(Attributes.Type.RENDERING_VALUES);
		else
			return <CSSAttribute>component.getAttr(Attributes.Type.CSS);
	}

	static getStyle(component: c.Component, styleName: string, isRendering = true): string {
		var cssAttr = CSSAttribute.getFrom(component, isRendering);
		if (!cssAttr)
			return null;
		return cssAttr.styles[styleName];
	}

	getType() {
		if (this.isRendering)
			return Attributes.Type.RENDERING_VALUES;
		else
			return Attributes.Type.CSS;
	}

	includes(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <CSSAttribute>attribute;
		for (var name in attr.styles) {
			if (this.styles[name] !== attr.styles[name]) {
				return false;
			}
		}
		return true;
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

		return new CSSAttribute(styles, this.isRendering);
	}

	repr(): Attributes.Repr {
		var children: Attributes.Repr[] = [];
		for (var name in this.styles) {
			children.push({
				title: name + ': ' + this.styles[name]
			});
		}
		return {
			title: super.repr().title + ' (isRendering = ' + this.isRendering + ')',
			children: children,
		};
	}

	getInheritedStyles(): { [styleName: string]: string; } {
		var newStyles: { [styleName: string]: string; } = {};
		for (var propName in this.styles) {
			if (INHERITED_PROPERTIES.indexOf(propName) !== -1) {
				newStyles[propName] = this.styles[propName];
			}
		}
		return newStyles;
	}

	getNonRendering(): CSSAttribute {
		assert(this.isRendering);
		var styles: { [styleName: string]: string; } = {};
		for (var prop in this.styles) {
			var value = this.styles[prop];
			var isInherited = INHERITED_PROPERTIES.indexOf(prop) !== -1;
			if (!isInherited) {
				styles[prop] = value;
			} else {
				var inheritedValue = CSSAttribute.getInheritedValue(this.component, prop);
				if (!inheritedValue || inheritedValue !== value) {
					styles[prop] = value;
				}
			}
		}

		if (Object.keys(styles).length > 0)
			return new CSSAttribute(styles, false);
	}

	static getInheritedValue(component: c.Component, prop: string): string {
		assert(INHERITED_PROPERTIES.indexOf(prop) !== -1);

		var parent = component;
		while (parent = parent.getParent()) {
			var cssAttr = CSSAttribute.getFrom(parent, false/*isRendering*/);
			if (cssAttr && cssAttr.styles[prop])
				return cssAttr.styles[prop];
		}
		return null;
	}

	// Get a list of inherited properties that cascade to all children and have
	// identical values.
	static getCascadingInheritedStyles(component: c.Component): { [styleName: string]: string; } {
		var inheritedProps = INHERITED_PROPERTIES.slice(0);
		var inheritedStyles: { [styleName: string]: string; } = {};

		component.iterateChildrenBreadthFirst((descendent) => {
			var cssAttr = CSSAttribute.getFrom(descendent);
			if (!cssAttr)
				return;

			var descendentStyles = cssAttr.getInheritedStyles();
			var i = 0;
			while (i < inheritedProps.length) {
				var prop = inheritedProps[i];
				var value = descendentStyles[prop];
				if (value == null) {
					++i;
					continue;
				}

				if (inheritedStyles[value] != null &&
					inheritedStyles[value] !== value) {
					delete inheritedStyles[value];
					inheritedProps.splice(i, 1);
					continue;
				} else {
					inheritedStyles[prop] = value;
					++i;
				}
			}
		});
		return inheritedStyles;
	}
}

export = CSSAttribute;

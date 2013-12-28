import Attributes = require('../Attributes');
import c = require('../Component');

class Markup extends Attributes.BaseAttribute {
	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		return [];
	}

	getCSSRepr(): string {
		var css = this.getCSS();
		var thisComponentCss = css.filter((css) => css.component === this.component)[0];
		if (!thisComponentCss) {
			return '';
		}
		var actualCss = thisComponentCss.css;
		return Object.keys(actualCss).map((name) => (name + ': ' + actualCss[name])).join(', ');
	}

	static from(component: c.Component, type: Attributes.Type): boolean {
		return !!component.getAttr(type);
	}

	repr() {
		return {
			title: this.getName() + ' (' + this.getCSSRepr() + ')',
		};
	}
}

export = Markup;

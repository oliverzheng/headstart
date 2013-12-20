import Attributes = require('../Attributes');
import c = require('../Component');

class Markup extends Attributes.BaseAttribute {
	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	getCSS(): { [name: string]: string; } {
		return {};
	}

	getCSSRepr(): string {
		var css = this.getCSS();
		return Object.keys(css).map((name) => (name + ': ' + css[name])).join(', ');
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

import Attributes = require('../Attributes');
import c = require('../Component');

class Markup extends Attributes.BaseAttribute {
	isMarkup = true;

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		return [];
	}

	static from(component: c.Component, type: Attributes.Type): boolean {
		return !!component.getAttr(type);
	}

	static getMarkupAttributes(component: c.Component): Markup[] {
		return <Markup[]>component.attributes.filter((a) => a instanceof Markup);
	}
}

export = Markup;

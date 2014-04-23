import Attributes = require('../Attributes');
import c = require('../Component');

class CollapseWhitespace extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.COLLAPSE_WHITESPACE;
	}

	static getFrom(component: c.Component): CollapseWhitespace {
		return <CollapseWhitespace>component.getAttr(Attributes.Type.COLLAPSE_WHITESPACE);
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}
}

export = CollapseWhitespace;

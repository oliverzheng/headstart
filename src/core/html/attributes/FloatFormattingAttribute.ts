import Attributes = require('../Attributes');
import c = require('../Component');

class FloatFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.FLOAT_FORMATTING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static getFrom(component: c.Component): FloatFormattingAttribute {
		return <FloatFormattingAttribute>(component.getAttr(Attributes.Type.FLOAT_FORMATTING));
	}
}

export = FloatFormattingAttribute;

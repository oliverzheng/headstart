import Attributes = require('../Attributes');

class InlineFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.INLINE_FORMATTING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}
}

export = InlineFormattingAttribute;

import Attributes = require('../Attributes');

class InlineFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.INLINE_FORMATTING;
	}
}

export = InlineFormattingAttribute;

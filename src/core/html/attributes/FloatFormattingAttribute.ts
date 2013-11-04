import Attributes = require('../Attributes');

class FloatFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.FLOAT_FORMATTING;
	}
}

export = FloatFormattingAttribute;

import Attributes = require('../Attributes');
import c = require('Component');

class SealedAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.SEALED;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}
}

export = SealedAttribute;

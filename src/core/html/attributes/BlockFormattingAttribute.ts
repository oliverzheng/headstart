import Attributes = require('../Attributes');
import c = require('Component');

class BlockFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.BLOCK_FORMATTING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static getFrom(component: c.Component): BlockFormattingAttribute {
		return <BlockFormattingAttribute>(component.getAttr(Attributes.Type.BLOCK_FORMATTING));
	}
}

export = BlockFormattingAttribute;

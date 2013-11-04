import Attributes = require('../Attributes');
import sinf = require('../spec/interfaces');

class BlockFormattingAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.BLOCK_FORMATTING;
	}
}

export = BlockFormattingAttribute;

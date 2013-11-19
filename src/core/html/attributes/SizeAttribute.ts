import Attributes = require('../Attributes');
import Length = require('./Length');
import sinf = require('../../spec/interfaces');

class SizeAttribute extends Attributes.BaseAttribute {
	width: Length;
	height: Length;

	constructor(width: Length, height: Length) {
		super();

		this.width = width;
		this.height = height;
	}

	getType() {
		return Attributes.Type.SIZE;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <SizeAttribute>attribute;

		return false;
	}
}

export = SizeAttribute;

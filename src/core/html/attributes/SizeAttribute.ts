import Attributes = require('../Attributes');
import Length = require('Length');

export class SizeAttribute extends Attributes.BaseAttribute {
	private width: Length.Length;
	private height: Length.Length;

	constructor(width: Length.Length, height: Length.Length) {
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

		return true;
	}
}

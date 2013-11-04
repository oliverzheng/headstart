import Attributes = require('../Attributes');
import Length = require('Length');

export class SpacingAttribute extends Attributes.BaseAttribute {
	private top: number;
	private bottom: number;
	private left: Length.Length;
	private right: Length.Length;

	constructor(top: number, right: Length.Length, bottom: number, left: Length.Length) {
		super();

		this.top = top;
		this.bottom = bottom;
		this.left = left;
		this.right = right;
	}

	getType() {
		return Attributes.Type.SPACING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <SpacingAttribute>attribute;

		return true;
			//this.direction === attr.direction;
	}
}

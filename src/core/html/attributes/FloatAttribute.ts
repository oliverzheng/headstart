import Attributes = require('../Attributes');

export enum FloatDirection {
	LEFT,
	RIGHT,
}

export class FloatAttribute extends Attributes.BaseAttribute {
	private direction: FloatDirection;

	constructor(direction: FloatDirection) {
		super();
		this.direction = direction;
	}

	getType() {
		return Attributes.Type.FLOAT;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <FloatAttribute>attribute;

		return this.direction === attr.direction;
	}
}

import Attributes = require('../Attributes');
import Length = require('./Length');

export enum Position {
	RELATIVE,
	ABSOLUTE,
}

export class PositionAttribute extends Attributes.BaseAttribute {
	private position: Position;

	constructor(position: Position) {
		super();

		this.position = position;
	}

	getType() {
		return Attributes.Type.POSITION;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <PositionAttribute>attribute;

		return this.position === attr.position;
	}
}

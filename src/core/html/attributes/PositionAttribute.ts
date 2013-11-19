import Attributes = require('../Attributes');

export class PositionAttribute extends Attributes.BaseAttribute {
	private relative: boolean;

	constructor(relative: boolean) {
		super();

		this.relative = relative;
	}

	getType() {
		return Attributes.Type.POSITION;
	}

	isRelative() {
		return this.isRelative;
	}

	isAbsolute() {
		return !this.isRelative;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <PositionAttribute>attribute;

		return this.isRelative === attr.isRelative;
	}

	repr() {
		var repr = super.repr();
		repr.title += ' (' + (this.relative ? 'relative' : 'absolute') + ')';
		return repr;
	}
}

export var relative = new PositionAttribute(true);
export var absolute = new PositionAttribute(false);

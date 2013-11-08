import Attributes = require('../Attributes');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

export class SpacingAttribute extends Attributes.BaseAttribute {
	top: sinf.Length = null;
	bottom: sinf.Length = null;
	left: sinf.Length = null;
	right: sinf.Length = null;

	constructor(
		top: sinf.Length,
		bottom: sinf.Length,
		left: sinf.Length,
		right: sinf.Length
	) {
		super();

		this.top = top;
		this.bottom = bottom;
		this.left = left;
		this.right = right;
	}

	static top(top: sinf.Length): SpacingAttribute {
		return new SpacingAttribute(top, null, null, null);
	}

	static bottom(bottom: sinf.Length): SpacingAttribute {
		return new SpacingAttribute(null, bottom, null, null);
	}

	static left(left: sinf.Length): SpacingAttribute {
		return new SpacingAttribute(null, null, left, null);
	}

	static right(right: sinf.Length): SpacingAttribute {
		return new SpacingAttribute(null, null, null, right);
	}

	getType() {
		return Attributes.Type.SPACING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <SpacingAttribute>attribute;

		return (
			sutil.fixedLengthsEqual(this.top, attr.top) &&
			sutil.fixedLengthsEqual(this.bottom, attr.bottom) &&
			sutil.fixedLengthsEqual(this.left, attr.left) &&
			sutil.fixedLengthsEqual(this.right, attr.right)
		);
	}

	merge(attribute: Attributes.BaseAttribute): Attributes.BaseAttribute {
		if (!this.isSameAttrType(attribute)) { return null; }
		var attr = <SpacingAttribute>attribute;

		return new SpacingAttribute(
			sutil.addFixedLengths(this.top, attr.top),
			sutil.addFixedLengths(this.bottom, attr.bottom),
			sutil.addFixedLengths(this.left, attr.left),
			sutil.addFixedLengths(this.right, attr.right)
		);
	}

	repr() {
		var spaces: string[] = [];
		if (this.top) {
			spaces.push('top: ' + sutil.serializeLength(this.top));
		}
		if (this.bottom) {
			spaces.push('bottom: ' + sutil.serializeLength(this.bottom));
		}
		if (this.left) {
			spaces.push('left: ' + sutil.serializeLength(this.left));
		}
		if (this.right) {
			spaces.push('right: ' + sutil.serializeLength(this.right));
		}
		return {
			title: this.getName() + '(' + spaces.join(' ') + ')'
		}
	}
}

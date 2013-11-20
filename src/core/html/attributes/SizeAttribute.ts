import c = require('../Component');
import Attributes = require('../Attributes');
import Length = require('../Length');
import sinf = require('../../spec/interfaces');
import assert = require('assert');

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

		if (this.width && !attr.width || !this.width && attr.width ||
			this.height && !attr.height || !this.height && attr.height) {
			return false;
		}

		if (this.width && !this.width.equals(attr.width) ||
			this.height && !this.height.equals(attr.height)) {
			return false;
		}

		return true;
	}

	merge(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return; }
		var attr = <SizeAttribute>attribute;

		if (this.width && attr.width || this.height && attr.height ||
			this.width && this.height) {
			return;
		}

		return new SizeAttribute(
			this.width || attr.width, this.height || attr.height
		);
	}

	repr() {
		var repr = super.repr();
		if (!this.width && !this.height) {
			return repr;
		}
		var lengths: string[] = [];
		if (this.width) {
			lengths.push('width: ' + this.width.repr());
		}
		if (this.height) {
			lengths.push('height: ' + this.height.repr());
		}
		repr.title += ' (' + lengths.join(', ') + ')';
		return repr;
	}

	static getFrom(component: c.Component): SizeAttribute {
		return <SizeAttribute>(component.getAttr(Attributes.Type.SIZE));
	}
}

export = SizeAttribute;

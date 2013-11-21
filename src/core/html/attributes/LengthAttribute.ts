import c = require('../Component');
import Attributes = require('../Attributes');
import sinf = require('../../spec/interfaces');
import assert = require('assert');
import Measurement = require('./Measurement');

class LengthAttribute extends Attributes.BaseAttribute {
	direction: sinf.Direction;

	px: Measurement = new Measurement;
	pct: Measurement = new Measurement;
	lines: Measurement = new Measurement; // For heights only

	constructor(direction: sinf.Direction) {
		super();

		this.direction = direction;
	}

	static fromUser(slen: sinf.Length, direction: sinf.Direction):
		LengthAttribute {
		var length: LengthAttribute = new LengthAttribute(direction);
		if (slen.unit === sinf.LengthUnit.PIXELS) {
			length.px = Measurement.explicit(slen.value);
		} else if (slen.unit === sinf.LengthUnit.PERCENT) {
			length.pct = Measurement.explicit(slen.value);
		} else {
			assert(false);
		}
		return length;
	}

	getType(): Attributes.Type {
		if (this.direction === sinf.horiz) {
			return Attributes.Type.WIDTH;
		} else {
			return Attributes.Type.HEIGHT;
		}
	}

	// a == b doesn't mean b == a. a may contain all of b.
	// TODO rename it to includes?
	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <LengthAttribute>attribute;

		return (
			(this.px.equals(attr.px) || this.px.isSet() && !attr.px.isSet()) &&
			(this.pct.equals(attr.pct) || this.pct.isSet() && !attr.pct.isSet()) &&
			(this.lines.equals(attr.lines) || this.lines.isSet() && !attr.lines.isSet()) &&
			this.direction === attr.direction
		);
	}

	merge(attribute: Attributes.BaseAttribute): LengthAttribute {
		if (!this.isSameAttrType(attribute)) { return; }
		var attr = <LengthAttribute>attribute;

		if (attr.direction !== this.direction) {
			return;
		}

		var newLength = new LengthAttribute(this.direction);
		newLength.px = this.px;
		newLength.pct = this.pct;
		newLength.lines = this.lines;

		if (!newLength.px.equals(attr.px)) {
			newLength.px = newLength.px.merge(attr.px);
		}
		if (!newLength.pct.equals(attr.pct)) {
			newLength.pct = newLength.px.merge(attr.pct);
		}
		if (!newLength.lines.equals(attr.lines)) {
			newLength.lines = newLength.px.merge(attr.lines);
		}

		if (newLength.px.equals(this.px) &&
			newLength.pct.equals(this.pct) &&
			newLength.lines.equals(this.lines)) {
			// Nothing's changed
			return null;
		}

		return newLength;
	}

	makeImplicit(): LengthAttribute {
		var length = new LengthAttribute(this.direction);
		if (this.px.isSet()) {
			length.px = this.px.makeImplicit();
		}
		if (this.pct.isSet()) {
			length.pct = this.pct.makeImplicit();
		}
		if (this.lines.isSet()) {
			length.lines = this.lines.makeImplicit();
		}
		return length;
	}

	repr() {
		var r = super.repr();
		var repr: string[] = [];
		if (this.px.isSet()) {
			repr.push(this.px.repr('px'));
		}
		if (this.pct.isSet()) {
			repr.push(this.pct.repr('%'));
		}
		if (this.lines.isSet()) {
			repr.push(this.pct.repr(' lines'));
		}
		r.title = (this.direction === sinf.horiz) ? 'Width' : 'Height';
		r.title += ' (' + repr.join(', ') + ')';
		return r;
	}

	static getFrom(component: c.Component, direction: sinf.Direction): LengthAttribute {
		var attr: Attributes.BaseAttribute;
		if (direction === sinf.horiz) {
			attr = component.getAttr(Attributes.Type.WIDTH);
		} else {
			attr = component.getAttr(Attributes.Type.HEIGHT);
		}
		return <LengthAttribute>attr;
	}

	canCompare(l2: LengthAttribute): boolean {
		assert(this.direction === l2.direction);

		if (this.px.isSet() && l2.px.isSet()) {
			return true;
		}

		if (!this.px.isSet() && !l2.px.isSet() && this.pct.isSet() && l2.pct.isSet()) {
			return true;
		}

		return false;
	}

	static compare(l1: LengthAttribute, l2: LengthAttribute): number {
		if (l1.px.isSet() && l2.px.isSet()) {
			return l1.px.value - l2.px.value;
		}

		if (!l1.px.isSet() && !l2.px.isSet() && l1.pct.isSet() && l2.pct.isSet()) {
			return l1.pct.value - l2.pct.value;
		}

		throw new Error('Cannot compare');
	}

	static add(l1: LengthAttribute, l2: LengthAttribute): LengthAttribute {
		assert(l1.direction === l2.direction);
		var sum = new LengthAttribute(l1.direction);

		if (l1.px.isSet() && l2.px.isSet()) {
			sum.px = l1.px.add(l2.px);
		}
		if (l1.pct.isSet() && l2.pct.isSet()) {
			sum.px = l1.px.add(l2.px);
		}
		if (l1.lines.isSet() && l2.lines.isSet()) {
			sum.lines = l1.px.add(l2.lines);
		}

		if (sum.isSet()) {
			return sum;
		}
	}

	isSet() {
		return this.px.isSet() || this.pct.isSet() || this.lines.isSet();
	}

	percentOf(parent: LengthAttribute): LengthAttribute {
		assert(!this.px.isSet() && this.pct.isSet());

		var l = new LengthAttribute(this.direction);
		l.px = Measurement.implicit(this.pct.value * parent.px.value);
		l.pct = this.pct;
		l.lines = this.lines;

		return l;
	}
}

export = LengthAttribute;

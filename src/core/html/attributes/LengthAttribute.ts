import c = require('../Component');
import Attributes = require('../Attributes');
import sinf = require('../../spec/interfaces');
import assert = require('assert');
import Measurement = require('./Measurement');

class LengthAttribute extends Attributes.BaseAttribute {
	direction: sinf.Direction;

	px: Measurement;
	pct: Measurement;
	lines: Measurement; // For heights only

	constructor(
			direction: sinf.Direction,
			px: Measurement = null,
			pct: Measurement = null,
			lines: Measurement = null
		) {
		super();

		this.direction = direction;
		this.px = px || new Measurement;
		this.pct = pct || new Measurement;
		this.lines = lines || new Measurement;
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

	looksEqual(length: LengthAttribute): boolean {
		return this.px.looksEqual(length.px);
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
			newLength.pct = newLength.pct.merge(attr.pct);
		}
		if (!newLength.lines.equals(attr.lines)) {
			newLength.lines = newLength.lines.merge(attr.lines);
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

	static max(lengths: LengthAttribute[]): LengthAttribute {
		lengths.sort(LengthAttribute.compare);
		return lengths[lengths.length - 1].makeImplicit();
	}

	compare(other: LengthAttribute) {
		return LengthAttribute.compare(this, other);
	}

	static add(l1: LengthAttribute, l2: LengthAttribute): LengthAttribute {
		assert(l1.direction === l2.direction);
		var sum = new LengthAttribute(l1.direction);

		if (l1.px.isSet() && l2.px.isSet()) {
			sum.px = l1.px.add(l2.px);
		}
		if (l1.pct.isSet() && l2.pct.isSet()) {
			sum.pct = l1.pct.add(l2.px);
		}
		if (l1.lines.isSet() && l2.lines.isSet()) {
			sum.lines = l1.px.add(l2.lines);
		}

		if (sum.isSet()) {
			return sum;
		}
	}

	static sum(lengths: LengthAttribute[]): LengthAttribute {
		return lengths.reduce(LengthAttribute.add).makeImplicit();
	}

	add(other: LengthAttribute) {
		return LengthAttribute.add(this, other);
	}

	static subtract(l1: LengthAttribute, l2: LengthAttribute): LengthAttribute {
		assert(l1.direction === l2.direction);
		var diff = new LengthAttribute(l1.direction);

		if (l1.px.isSet() && l2.px.isSet()) {
			diff.px = l1.px.subtract(l2.px);
		}
		if (l1.pct.isSet() && l2.pct.isSet()) {
			diff.pct = l1.pct.subtract(l2.px);
		}
		if (l1.lines.isSet() && l2.lines.isSet()) {
			diff.lines = l1.lines.subtract(l2.lines);
		}

		if (diff.isSet()) {
			return diff;
		}
	}

	subtract(other: LengthAttribute) {
		return LengthAttribute.subtract(this, other);
	}

	isSet() {
		return this.px.isSet() || this.pct.isSet() || this.lines.isSet();
	}

	percentOf(parent: LengthAttribute): LengthAttribute {
		assert(!this.px.isSet() && this.pct.isSet());

		if (!parent.px.isSet()) {
			return this;
		}

		var l = new LengthAttribute(this.direction);
		l.px = Measurement.implicit(this.pct.value * parent.px.value);
		l.pct = this.pct;
		l.lines = this.lines;

		return l;
	}

	split(parts: number): LengthAttribute {
		var part = new LengthAttribute(this.direction);
		if (this.px.isSet()) {
			part.px = this.px.split(parts);
		}
		if (this.pct.isSet()) {
			part.pct = this.pct.split(parts);
		}
		if (this.lines.isSet()) {
			part.lines = this.lines.split(parts);
		}
		if (part.isSet()) {
			return part;
		}
	}

	static getHorizZero() {
		return new LengthAttribute(
			sinf.horiz,
			Measurement.implicit(0),
			Measurement.implicit(0),
			Measurement.implicit(0)
		);
	}

	static getHorizZeroPx() {
		return new LengthAttribute(
			sinf.horiz,
			Measurement.implicit(0)
		);
	}

	static getVertZero() {
		return new LengthAttribute(
			sinf.vert,
			Measurement.implicit(0),
			Measurement.implicit(0),
			Measurement.implicit(0)
		);
	}

	static getVertZeroPx() {
		return new LengthAttribute(
			sinf.vert,
			Measurement.implicit(0)
		);
	}
}

export = LengthAttribute;

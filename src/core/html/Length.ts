import sinf = require('../spec/interfaces');
import assert = require('assert');

class Length {
	px: number;
	isPxExplicit: boolean;
	pct: number;
	isPctExplicit: boolean;

	singleLine: number; // For heights only
	isLineExplicit: boolean;

	static makeLength(slen: sinf.Length, isExplicit: boolean): Length {
		var length: Length = new Length;
		if (slen.unit === sinf.LengthUnit.PIXELS) {
			length.px = slen.value;
			length.isPxExplicit = isExplicit;
		} else if (slen.unit === sinf.LengthUnit.PERCENT) {
			length.pct = slen.value;
			length.isPctExplicit = isExplicit;
		} else {
			assert(false);
		}
		return length;
	}

	static add(l1: Length, l2: Length): Length {
		var newLength = new Length;
		var hasLength = false;
		if (l1.px != null && l2.px != null) {
			newLength.px = l1.px + l2.px;
			newLength.isPxExplicit = false;
			hasLength = true;
		}
		if (l1.pct != null && l2.pct != null) {
			newLength.pct = l1.pct + l2.pct;
			newLength.isPctExplicit = false;
			hasLength = true;
		}
		if (hasLength) {
			return newLength;
		}
	}

	static makeImplicit(length: Length): Length {
		var l = new Length;
		l.px = length.px;
		if (l.px) {
			l.isPxExplicit = false;
		}
		l.pct = length.pct;
		if (l.pct) {
			l.isPctExplicit = false;
		}
		return l;
	}

	static canCompare(l1: Length, l2: Length): boolean {
		if (l1.px != null && l2.px != null) {
			return true;
		}

		if (l1.px == null && l2.px == null && l1.pct != null && l2.pct != null) {
			return true;
		}

		return false;
	}

	static compare(l1: Length, l2: Length): number {
		if (l1.px != null && l2.px != null) {
			return l1.px - l2.px;
		}

		if (l1.px == null && l2.px == null && l1.pct != null && l2.pct != null) {
			return l1.pct - l2.pct;
		}

		throw new Error('Cannot compare');
	}

	equals(length: Length): boolean {
		return (
			this.px === length.px &&
			this.isPxExplicit === length.isPxExplicit && 
			this.pct === length.pct && 
			this.isPctExplicit === length.isPctExplicit
		);
	}

	repr(): string {
		var repr: string[] = [];
		if (this.px != null) {
			repr.push(
				this.px.toString() + 'px ' +
				(this.isPxExplicit ? 'explicit' : 'implicit')
			);
		}
		if (this.pct != null) {
			repr.push(
				this.pct.toString() + '% ' +
				(this.isPctExplicit ? 'explicit' : 'implicit')
			);
		}
		return repr.join(' & ');
	}
};

export = Length;

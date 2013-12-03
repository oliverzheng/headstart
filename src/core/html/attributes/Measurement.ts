import assert = require('assert');

class Measurement {
	value: number;
	isExplicit: boolean;

	static explicit(value: number) {
		var m = new Measurement;
		m.value = value;
		m.isExplicit = true;
		return m;
	}

	static implicit(value: number) {
		var m = new Measurement;
		m.value = value;
		m.isExplicit = false;
		return m;
	}

	isSet() {
		return this.value != null;
	}

	equals(m: Measurement): boolean {
		if (this.isSet() || m.isSet()) {
			return this.value === m.value && this.isExplicit === m.isExplicit;
		} else {
			return true;
		}
	}

	merge(m: Measurement): Measurement {
		if (!this.isSet() ||
			!this.isExplicit && m.isExplicit && this.value === m.value) {
			return m;
		}
		return this;
	}

	repr(unit: string): string {
		if (!this.isSet()) {
			return null;
		}
		return (
			this.value.toString() + unit + ' ' +
			(this.isExplicit ? 'explicit' : 'implicit')
		);
	}

	makeImplicit(): Measurement {
		assert(this.isSet());
		if (!this.isExplicit) {
			return this;
		}
		return Measurement.implicit(this.value);
	}

	add(m: Measurement): Measurement {
		assert(this.isSet() && m.isSet());
		return Measurement.implicit(this.value + m.value);
	}

	subtract(m: Measurement): Measurement {
		assert(this.isSet() && m.isSet());
		return Measurement.implicit(this.value - m.value);
	}

	split(parts: number): Measurement {
		assert(this.isSet());
		var m = new Measurement;
		m.value = this.value / parts;
		m.isExplicit = this.isExplicit;
		return m;
	}
}

export = Measurement;

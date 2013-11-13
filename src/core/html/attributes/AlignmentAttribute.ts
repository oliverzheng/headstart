import Attributes = require('../Attributes');
import c = require('Component');
import sinf = require('../../spec/interfaces');

class AlignmentAttribute extends Attributes.BaseAttribute {
	private horiz: sinf.Alignment;
	private vert: sinf.Alignment;

	constructor(horiz: sinf.Alignment, vert: sinf.Alignment) {
		super();

		this.horiz = horiz || sinf.defaultAlignment;
		this.vert = vert || sinf.defaultAlignment;
	}

	getType() {
		return Attributes.Type.ALIGNMENT;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <AlignmentAttribute>attribute;

		return this.horiz === attr.horiz && this.vert === attr.vert;
	}

	repr() {
		var horiz: string;
		var vert: string;
		switch (this.horiz) {
			case sinf.Alignment.NEAR:
				horiz = 'left';
				break;
			case sinf.Alignment.CENTER:
				horiz = 'center';
				break;
			case sinf.Alignment.FAR:
				horiz = 'right';
				break;
		}
		switch (this.vert) {
			case sinf.Alignment.NEAR:
				vert = 'top';
				break;
			case sinf.Alignment.CENTER:
				vert = 'center';
				break;
			case sinf.Alignment.FAR:
				vert = 'bottom';
				break;
		}
		return {
			title: this.getName() + ' (h: ' + horiz + ', v: ' + vert + ')',
		};
	}
}

export = AlignmentAttribute;

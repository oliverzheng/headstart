import Attributes = require('../Attributes');
import c = require('../Component');
import sinf = require('../spec/interfaces');

class CSSAttribute extends Attributes.BaseAttribute {
	styles: { [styleName: string]: string; } = {};

	constructor(styles: { [styleName: string]: string; }) {
		super();

		this.styles = styles;
	}

	getType() {
		return Attributes.Type.CSS;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <CSSAttribute>attribute;

		var styleNames = Object.keys(this.styles);
		var otherStyleNames = Object.keys(attr.styles);
		if (styleNames.length !== otherStyleNames.length) {
			return false;
		}
		for (var ii = 0; ii < styleNames.length; ++ii) {
			var styleName = styleNames[ii];
			if (this.styles[styleName] !== attr.styles[styleName]) {
				return false;
			}
		}

		return true;
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (' + JSON.stringify(this.styles) + ')';
		return repr;
	}
}

export = CSSAttribute;

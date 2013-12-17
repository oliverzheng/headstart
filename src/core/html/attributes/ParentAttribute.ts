import c = require('../Component');
import Attributes = require('../Attributes');

class ParentAttribute extends Attributes.BaseAttribute {
	private parent: c.Component;

	constructor(parent: c.Component) {
		super();
		this.parent = parent;
	}

	getType() {
		return Attributes.Type.PARENT;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <ParentAttribute>attribute;

		return this.parent === attr.parent;
	}

	merge(attribute: Attributes.BaseAttribute): ParentAttribute {
		return <ParentAttribute>attribute;
	}

	getParent(): c.Component {
		return this.parent;
	}

	repr(): Attributes.Repr {
		return null;
	}
}

export = ParentAttribute;

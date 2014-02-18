import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');

// Does not generate a node
class Spacing extends Attributes.BaseAttribute {
	canSetComponent(component: c.Component) {
		return !component.nodeAttr();
	}

	getType() {
		return Attributes.Type.SPACING;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static getFrom(component: c.Component): Spacing {
		return <Spacing>(component.getAttr(Attributes.Type.SPACING));
	}
}

export = Spacing;

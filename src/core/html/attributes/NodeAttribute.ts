import Attributes = require('../Attributes');

// Having a node indicates that in the final HTML/CSS rendering tree, a node
// will represent this component.
class NodeAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.NODE;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}
}

export = NodeAttribute;

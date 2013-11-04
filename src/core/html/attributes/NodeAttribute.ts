import Attributes = require('../Attributes');

// Having a node indicates that in the final HTML/CSS rendering tree, a node
// will represent this component.
class NodeAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.NODE;
	}
}

export = NodeAttribute;

import Attributes = require('Attributes');
import BoxAttribute = require('attributes/BoxAttribute');
import NodeAttribute = require('attributes/NodeAttribute');
import ChildrenAttribute = require('attributes/ChildrenAttribute');

class Component {
	private attrs: Attributes.BaseAttribute[] = [];

	getAttr(type: Attributes.Type): Attributes.BaseAttribute {
		for (var ii = 0; ii < this.attrs.length; ++ii) {
			var attr = this.attrs[ii];
			if (attr.getType() === type) {
				return attr;
			}
		}
		return null;
	}

	// Specific attributes

	boxAttr(): BoxAttribute {
		return <BoxAttribute>this.getAttr(Attributes.Type.BOX);
	}

	nodeAttr(): NodeAttribute {
		return <NodeAttribute>this.getAttr(Attributes.Type.NODE);
	}

	childrenAttr(): ChildrenAttribute {
		return <ChildrenAttribute>this.getAttr(Attributes.Type.CHILDREN);
	}
}

export = Component;

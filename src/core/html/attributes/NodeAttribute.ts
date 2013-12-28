import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import getDynamicBox = require('../patterns/getDynamicBox');

// Having a node indicates that in the final HTML/CSS rendering tree, a node
// will represent this component.
class NodeAttribute extends Attributes.BaseAttribute {
	getType() {
		return Attributes.Type.NODE;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static dynamicBoxRule(component: c.Component): Rules.RuleResult[] {
		if (!getDynamicBox(component)) {
			return;
		}

		return [{
			component: component,
			attributes: [
				new NodeAttribute(),
			],
		}];
	}
}

export = NodeAttribute;

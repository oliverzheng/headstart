import Attributes = require('../Attributes');
import Rules = require('../Rules');
import c = require('../Component');
import StackedChildren = require('../attributes/StackedChildren');
import LengthAttribute = require('../attributes/LengthAttribute');
import Spacing = require('../attributes/Spacing');
import getDirection = require('../patterns/getDirection');
import groupChildren = require('../patterns/groupChildren');
import hasBoxContent = require('../patterns/hasBoxContent');
import sinf = require('../../spec/interfaces');

// Having a node indicates that in the final HTML/CSS rendering tree, a node
// will represent this component.
class NodeAttribute extends Attributes.BaseAttribute {
	canSetComponent(component: c.Component) {
		return !Spacing.getFrom(component);
	}

	getType() {
		return Attributes.Type.NODE;
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static getFrom(component: c.Component): NodeAttribute {
		return <NodeAttribute>(component.getAttr(Attributes.Type.NODE));
	}

	static explicitLengthContentRule(component: c.Component): Rules.RuleResult[] {
		if (!hasBoxContent(component))
			return;

		var width = LengthAttribute.getFrom(component, sinf.horiz);
		var height = LengthAttribute.getFrom(component, sinf.vert);
		if (width && width.px.isSet() && width.px.isExplicit ||
			height && height.px.isSet() && height.px.isExplicit) {
			return [{
				component: component,
				attributes: [new NodeAttribute()],
			}];
		}
	}
}

export = NodeAttribute;

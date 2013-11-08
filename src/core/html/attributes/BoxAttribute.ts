import Attributes = require('../Attributes');
import c = require('../Component');
import sinf = require('../spec/interfaces');

// There is a 1-to-1 correspondance between the component and a box in the
// visual spec.
class BoxAttribute extends Attributes.BaseAttribute {
	private box: sinf.Box;

	constructor(box: sinf.Box) {
		super();

		this.box = box;
	}

	getType() {
		return Attributes.Type.BOX;
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <BoxAttribute>attribute;

		return this.box === attr.box;
	}

	getBox(): sinf.Box {
		return this.box;
	}

	static getContainingBox(component: c.Component): sinf.Box {
		var boxAttr: BoxAttribute;
		if (component.boxAttr()) {
			boxAttr = component.boxAttr();
		}
		if (component.childrenAttr()) {
			component.childrenAttr().breadthFirst((child) => {
				if (!boxAttr && child.boxAttr()) {
					boxAttr = child.boxAttr();
				}
			});
		}
		return boxAttr && boxAttr.getBox();
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.title += ' (box id = ' + this.box.id + ')';
		return repr;
	}
}

export = BoxAttribute;

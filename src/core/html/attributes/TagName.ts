import Attributes = require('../Attributes');
import c = require('../Component');

class TagName extends Attributes.BaseAttribute {
	tagName: string;

	constructor(tagName: string) {
		super();
		this.tagName = tagName;
	}

	getType() {
		return Attributes.Type.TAG_NAME;
	}

	static getFrom(component: c.Component): TagName {
		return <TagName>component.getAttr(Attributes.Type.TAG_NAME);
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <TagName>attribute;
		return this.tagName === attr.tagName;
	}

	repr() {
		var repr = super.repr();
		repr.title += ' (' + this.tagName + ')';
		return repr;
	}
}

export = TagName;

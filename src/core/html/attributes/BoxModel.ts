import Attributes = require('../Attributes');
import c = require('../Component');
import Markup = require('../Markup');

class BoxModel extends Markup {
	content: { x?: number; y?: number; };
	padding: { t?: number; r?: number; b?: number; l?: number; };
	margin: { t?: number; r?: number; b?: number; l?: number; };
	lineHeight: number;
	lines: number;

	constructor(
		content: { x?: number; y?: number; } = null,
		padding: { t?: number; r?: number; b?: number; l?: number; } = null,
		margin: { t?: number; r?: number; b?: number; l?: number; } = null,
		lineHeight: number = null,
		lines: number = null
	) {
		super();

		this.content = content || {};
		this.padding = padding || {};
		this.margin = margin || {};
		this.lineHeight = lineHeight;
		this.lines = lines;
	}

	getCSS(): { component: c.Component; css: { [name: string]: string; }; }[] {
		var css: { [name: string]: string;} = {};
		if (this.margin.t) {
			css['margin-top'] = this.margin.t.toString() + 'px';
		}
		if (this.margin.r) {
			css['margin-right'] = this.margin.r.toString() + 'px';
		}
		if (this.margin.b) {
			css['margin-bottom'] = this.margin.b.toString() + 'px';
		}
		if (this.margin.l) {
			css['margin-left'] = this.margin.l.toString() + 'px';
		}
		if (Object.keys(css).length > 0) {
			return [{
				component: this.component,
				css: css,
			}];
		}
	}

	getType() {
		return Attributes.Type.BOX_MODEL;
	}

	static getFrom(component: c.Component): BoxModel {
		return <BoxModel>component.getAttr(Attributes.Type.BOX_MODEL);
	}

	equals(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <BoxModel>attribute;

		return (
			this.content.x === attr.content.x &&
			this.content.y === attr.content.x &&
			this.padding.t === attr.padding.t &&
			this.padding.r === attr.padding.r &&
			this.padding.b === attr.padding.b &&
			this.padding.l === attr.padding.l &&
			this.margin.t === attr.margin.t &&
			this.margin.r === attr.margin.r &&
			this.margin.b === attr.margin.b &&
			this.margin.l === attr.margin.l &&
			this.lineHeight === attr.lineHeight &&
			this.lines === attr.lines
		);
	}

	includes(attribute: Attributes.BaseAttribute) {
		if (!this.isSameAttrType(attribute)) { return false; }
		var attr = <BoxModel>attribute;

		if (attr.content.x != null && (this.content.x == null || attr.content.x !== this.content.x) ||
			attr.content.y != null && (this.content.y == null || attr.content.y !== this.content.y) ||
			attr.padding.t != null && (this.padding.t == null || attr.padding.t !== this.padding.t) ||
			attr.padding.r != null && (this.padding.r == null || attr.padding.r !== this.padding.r) ||
			attr.padding.b != null && (this.padding.b == null || attr.padding.b !== this.padding.b) ||
			attr.padding.l != null && (this.padding.l == null || attr.padding.l !== this.padding.l) ||
			attr.margin.t != null && (this.margin.t == null || attr.margin.t !== this.margin.t) ||
			attr.margin.r != null && (this.margin.r == null || attr.margin.r !== this.margin.r) ||
			attr.margin.b != null && (this.margin.b == null || attr.margin.b !== this.margin.b) ||
			attr.margin.l != null && (this.margin.l == null || attr.margin.l !== this.margin.l) ||
			attr.lineHeight != null && (this.lineHeight == null || attr.lineHeight !== this.lineHeight) ||
			attr.lines != null && (this.lines == null || attr.lines !== this.lines)) {
			return false;
		}

		return true;
	}

	merge(attribute: Attributes.BaseAttribute): BoxModel {
		if (!this.isSameAttrType(attribute)) { return; }
		var attr = <BoxModel>attribute;

		if (this.content.x != null && attr.content.x != null ||
			this.content.y != null && attr.content.y != null ||
			this.padding.t != null && attr.padding.t != null ||
			this.padding.r != null && attr.padding.r != null ||
			this.padding.b != null && attr.padding.b != null ||
			this.padding.l != null && attr.padding.l != null ||
			this.margin.t != null && attr.margin.t != null ||
			this.margin.r != null && attr.margin.r != null ||
			this.margin.b != null && attr.margin.b != null ||
			this.margin.l != null && attr.margin.l != null ||
			this.lineHeight != null && attr.lineHeight != null ||
			this.lines != null && attr.lines != null) {
			return;
		}

		var content = {
			x: this.content.x != null ? this.content.x : attr.content.x,
			y: this.content.y != null ? this.content.y : attr.content.y,
		};

		var padding = {
			t: this.padding.t != null ? this.padding.t : attr.padding.t,
			r: this.padding.r != null ? this.padding.r : attr.padding.r,
			b: this.padding.b != null ? this.padding.b : attr.padding.b,
			l: this.padding.l != null ? this.padding.l : attr.padding.l,
		};

		var margin = {
			t: this.margin.t != null ? this.margin.t : attr.margin.t,
			r: this.margin.r != null ? this.margin.r : attr.margin.r,
			b: this.margin.b != null ? this.margin.b : attr.margin.b,
			l: this.margin.l != null ? this.margin.l : attr.margin.l,
		};

		var lineHeight = this.lineHeight != null ? this.lineHeight : attr.lineHeight;
		var lines = this.lines != null ? this.lines : attr.lines;

		return new BoxModel(content, padding, margin, lineHeight, lines);
	}

	repr(): Attributes.Repr {
		var repr = super.repr();
		repr.children = [];

		if (this.content.x != null)
			repr.children.push({title: 'width: ' + this.content.x});
		if (this.content.y != null)
			repr.children.push({title: 'height: ' + this.content.y});
		if (this.padding.t != null)
			repr.children.push({title: 'paddingTop: ' + this.padding.t});
		if (this.padding.r != null)
			repr.children.push({title: 'paddingRight: ' + this.padding.r});
		if (this.padding.b != null)
			repr.children.push({title: 'paddingBottom: ' + this.padding.b});
		if (this.padding.l != null)
			repr.children.push({title: 'paddingLeft: ' + this.padding.l});
		if (this.margin.t != null)
			repr.children.push({title: 'marginTop: ' + this.margin.t});
		if (this.margin.r != null)
			repr.children.push({title: 'marginRight: ' + this.margin.r});
		if (this.margin.b != null)
			repr.children.push({title: 'marginBottom: ' + this.margin.b});
		if (this.margin.l != null)
			repr.children.push({title: 'marginLeft: ' + this.margin.l});

		return repr;
	}
}

export = BoxModel;

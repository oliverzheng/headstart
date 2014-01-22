import Attributes = require('../Attributes');
import Rules = require('../Rules');
import Markup = require('../Markup');
import StackedChildren = require('./StackedChildren');
import NodeAttribute = require('./NodeAttribute');
import LengthAttribute = require('./LengthAttribute');
import c = require('../Component');
import hasBoxContent = require('../patterns/hasBoxContent');
import getDirection = require('../patterns/getDirection');
import sinf = require('../../spec/interfaces');
import sutil = require('../../spec/util');

function isSpacing(component: c.Component): boolean {
	return component && !hasBoxContent(component) && !NodeAttribute.getFrom(component);
}

function getPrevSpacing(component: c.Component): c.Component {
	var prev = StackedChildren.getPrevSibling(component);
	if (isSpacing(prev))
		return prev;
	return null;
}

function getNextSpacing(component: c.Component): c.Component {
	var next = StackedChildren.getNextSibling(component);
	if (isSpacing(next))
		return next;
	return null;
}

class Margin extends Markup {
	static getFrom(component: c.Component): Margin {
		return <Margin>(component.getAttr(Attributes.Type.MARGIN));
	}

	getType() {
		return Attributes.Type.MARGIN;
	}

	getCSS() {
		var direction = getDirection(this.component.getParent());
		var prev = getPrevSpacing(this.component);
		var next = getNextSpacing(this.component);

		var css: { [name: string]: string; } = {};
		if (direction === sinf.horiz) {
			if (prev)
				css['margin-left'] = LengthAttribute.getFrom(prev, sinf.horiz).px.value + 'px';
			if (next) {
				// There is no margin folding for horizontal margins. We only
				// want to apply a margin-right if there won't be a component
				// using the same space as margin-left.
				var nextNext = StackedChildren.getNextSibling(next);
				if (!nextNext) {
					css['margin-right'] = LengthAttribute.getFrom(next, sinf.horiz).px.value + 'px';
				}
			}
		} else {
			if (prev)
				css['margin-top'] = LengthAttribute.getFrom(prev, sinf.vert).px.value + 'px';
			if (next)
				css['margin-bottom'] = LengthAttribute.getFrom(next, sinf.vert).px.value + 'px';
		}
		return [{
			component: this.component,
			css: css,
		}];
	}

	equals(attribute: Attributes.BaseAttribute) {
		return this.isSameAttrType(attribute);
	}

	static marginRule(component: c.Component): Rules.RuleResult[] {
		if (!NodeAttribute.getFrom(component))
			return;

		var prev = getPrevSpacing(component);
		var next = getNextSpacing(component);
		if (prev || next) {
			return [{
				component: component,
				attributes: [new Margin()],
			}];
		}
	}
}

export = Margin;

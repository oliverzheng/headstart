import Rules = require('../../Rules');
import c = require('../../Component');
import NodeAttribute = require('../../attributes/NodeAttribute');
import StackedChildren = require('../../attributes/StackedChildren');
import Spacing = require('../../attributes/Spacing');
import LengthAttribute = require('../../attributes/LengthAttribute');
import CSSAttribute = require('../../attributes/CSSAttribute');
import getDirection = require('../../patterns/getDirection');
import sinf = require('../../../spec/interfaces');

function marginSpacing(component: c.Component): Rules.RuleResult[] {
	if (!component.getParent())
		return;

	var prev = StackedChildren.getPrevSibling(component);
	if (prev && !Spacing.getFrom(prev))
		prev = null;

	var next = StackedChildren.getNextSibling(component);
	if (next && !Spacing.getFrom(next))
		next = null;

	var direction = getDirection(component.getParent());
	var styles: { [styleName: string]: string; } = {};
	if (prev)
		styles[direction === sinf.horiz ? 'margin-left' : 'margin-top'] = LengthAttribute.getFrom(prev, direction).px.value + 'px';

	if (next) {
		// There is no margin folding for horizontal margins. We only
		// want to apply a margin-right if there won't be a component
		// using the same space as margin-left.
		if (direction !== sinf.horiz || !StackedChildren.getNextSibling(next)) {
			styles[direction === sinf.horiz ? 'margin-right' : 'margin-bottom'] = LengthAttribute.getFrom(next, direction).px.value + 'px';
		}
	}
	return [{
		component: component,
		attributes: [new CSSAttribute(styles)],
	}];
}

var rules: Rules.RuleWithName[] = [
	{name: 'marginSpacing', rule: marginSpacing},
];

export = rules;

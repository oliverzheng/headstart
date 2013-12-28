import assert = require('assert');
import c = require('../Component');
import sinf = require('../../spec/interfaces');
import Alignment = require('../attributes/Alignment');
import getDirection = require('./getDirection');

function getCrossAlignment(component: c.Component): sinf.Alignment {
	var parentDirection = getDirection(component);
	assert(!!parentDirection);

	// The caller must know which children attribute they are calling from
	var childrenComponents = component.getChildren();
	if (childrenComponents.length === 0) {
		return sinf.Alignment.NONE;
	}

	var alignments = childrenComponents.map((childComponent) => {
		var childDirection = getDirection(childComponent);
		assert(!!childDirection);
		if (childDirection === parentDirection) {
			return getCrossAlignment(childComponent);
		} else {
			var alignment = Alignment.getFrom(childComponent, childDirection);
			if (!alignment) {
				// Default to near
				return sinf.near;
			} else {
				return alignment.getSimpleAlignment();
			}
		}
	});
	if (!alignments.every((alignment) => (alignment === alignments[0]))) {
		return sinf.Alignment.NONE;
	}
	return alignments[0];
}

export = getCrossAlignment;

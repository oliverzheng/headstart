import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../Component');
import Rules = require('../Rules');
import NodeAttribute = require('../attributes/NodeAttribute');
import Alignment = require('../attributes/Alignment');
import CSSAttribute = require('../attributes/CSSAttribute');
import LengthAttribute = require('../attributes/LengthAttribute');
import TextContent = require('../attributes/TextContent');
import sinf = require('../../spec/interfaces');
import util = require('../../spec/util');
import reqs = require('../requirements');

export function horizontalCenterText(component: c.Component): Rules.RuleResult[] {
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.c,
					reqs.isContentText,
					reqs.shrinkW,
					reqs.shrinkH,
				]),
				// Optional spaces
				reqs.not(reqs.hasContent)
			),
			reqs.fixedW,
		])
	);
	if (!satisfies)
		return;

	var alignment = Alignment.getFrom(component, sinf.horiz);
	assert(alignment);

	return [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': 'center',
			}),
		],
	}];
}

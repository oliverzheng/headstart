import assert = require('assert');

import c = require('../../Component');
import reqs = require('../../requirements');
import LineHeight = require('../../attributes/LineHeight');

export function containsSingleLineVerticallyCenteredTextWithKnownHeight(component: c.Component): c.Component {
	var captured: c.Component[] = [];
	var satisfies = reqs.satisfies(component,
		reqs.all([
			reqs.vert,
			reqs.not(reqs.runtimeH),
			reqs.knownH,
			reqs.not(
				reqs.anyDescendents(
					reqs.hasNodes
				)
			),
			reqs.anyDescendentsOptional(
				reqs.capture(
					reqs.all([
						reqs.isContentText,
						reqs.m,
						reqs.textLines(1),
					]),
					captured
				),
				reqs.not(reqs.hasContent)
			),
		])
	);
	if (!satisfies)
		return null;

	assert(captured.length > 0);

	if (reqs.satisfies(captured[0], reqs.isOnlyText))
		return captured[0];

	var text: c.Component[] = [];
	satisfies = reqs.satisfies(captured[0],
		reqs.anyDescendents(
			reqs.capture(reqs.isOnlyText, text)
		)
	);
	assert(satisfies && text.length > 0);
	return text[0];
}

import assert = require('assert');

import c = require('../../Component');
import sinf = require('../../../spec/interfaces');
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

export function findAlignedContent(
	component: c.Component,
	direction: sinf.Direction,
	alignment: sinf.Alignment,
	contentReq: reqs.Requirement = reqs.none,
	parentReq: reqs.Requirement = reqs.none
): c.Component {
	var alignmentReq = reqs.eitherOr(
		reqs.fromDirectionAlignment(direction, alignment),
		reqs.all([
			reqs.parent(reqs.getFromDirection(sinf.otherDirection(direction))),
			reqs.exact(direction, sinf.pct(1)), // Exactly as tall/wide as its parent
		])
	);
	var allContentReqs = reqs.all([
		reqs.hasContent,
		contentReq,
		alignmentReq,
	]);
	var captures: c.Component[] = [];
	var candidateReq = reqs.all([
		parentReq,
		reqs.anyDescendentsOptional(
			reqs.capture(allContentReqs, captures),
			reqs.not(reqs.hasContent)
		),
		reqs.anyDescendentsWithAncestors(
			allContentReqs,
			alignmentReq
		),
	]);
	var satisfies = reqs.satisfies(component,
		reqs.all([
			candidateReq,
			reqs.eitherOr(
				// Either there is no parent
				reqs.not(reqs.parent(reqs.none)),
				// Or the parent cannot match this. Otherwise, only the parent
				// should apply
				reqs.not(reqs.parent(candidateReq))
			)
		])
	);

	if (!satisfies)
		return null;

	assert(captures.length >= 1);
	captures.sort((a, b) => {
		return a.getOrder() - b.getOrder();
	});
	// Get the most descending descendent.
	var last = captures.reduce((a, b) => {
		if (a && b.isDescendentOf(a)) {
			return b;
		}
		return null;
	});
	if (!last)
		return null;

	// TODO this should be reqs.anyAncestorsUntil()
	var differentLength = false;
	for (var target = last; target !== component && target; target = target.getParent()) {
		// The entire ancestry should at least change some width.
		if (reqs.satisfies(target, reqs.not(reqs.exact(direction, sinf.pct(1))))) {
			differentLength = true;
			break;
		}
	}

	if (differentLength)
		return last;
}

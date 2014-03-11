import c = require('../../Component');
import reqs = require('../../requirements');

export function containsSingleLineVerticallyCenteredText(component: c.Component): boolean {
	return reqs.satisfies(component,
		reqs.all([
			reqs.vert,
			reqs.not(reqs.runtimeH),
			reqs.knownH,
			reqs.anyChildrenOptional(
				reqs.all([
					reqs.isContentText,
					reqs.m,
					reqs.textLines(1),
				]),
				reqs.not(reqs.hasContent)
			),
		])
	);
}

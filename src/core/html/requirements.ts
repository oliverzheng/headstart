import assert = require('assert');

import comp = require('./Component');
import inf = require('../spec/interfaces');
import util = require('../spec/util');
import LengthAttribute = require('./attributes/LengthAttribute');
import Alignment = require('./attributes/Alignment');
import hasBoxContent = require('./patterns/hasBoxContent');
import isText = require('./patterns/isText');

export enum Target {
	SELF,
	PARENT,
	ALL_CHILDREN,
	ANY_CHILDREN,
}

export enum AggregateType {
	ALL,
	ANY,
	NONE,
}

export interface Requirement {
	name?: string;

	w?: inf.LengthUnit;
	h?: inf.LengthUnit;
	hasContent?: boolean;
	isText?: boolean;
	isImage?: boolean;
	// Alignment in parent
	alignment?: {
		x?: inf.Alignment;
		y?: inf.Alignment;
	};
	lazyEval?: () => Requirement;

	target?: Target;

	aggregate?: Requirement[];
	aggregateType?: AggregateType;
}

export function all(requirements: Requirement[]): Requirement {
	return {
		aggregate: requirements,
		aggregateType: AggregateType.ALL,
	};
}

export function any(requirements: Requirement[]): Requirement {
	return {
		aggregate: requirements,
		aggregateType: AggregateType.ANY,
	};
}

export function eitherOr(requirement1: Requirement, requirement2: Requirement): Requirement {
	return any([requirement1, requirement2]);
}

export function noneOf(requirements: Requirement[]): Requirement {
	return {
		aggregate: requirements,
		aggregateType: AggregateType.NONE,
	};
}

export function not(requirement: Requirement): Requirement {
	return noneOf([requirement]);
}


export function allChildren(requirement: Requirement): Requirement {
	requirement.target = Target.ALL_CHILDREN;
	return requirement;
}

export function anyChildren(requirement: Requirement): Requirement {
	requirement.target = Target.ANY_CHILDREN;
	return requirement;
}

export function anyChildrenOptional(requirement: Requirement, optional: Requirement): Requirement {
	return all([
		anyChildren(requirement),
		allChildren(eitherOr(requirement, optional)),
	]);
}

export function parent(requirement: Requirement): Requirement {
	requirement.target = Target.PARENT;
	return requirement;
}

export function lazy(func: () => Requirement): Requirement {
	return {
		lazyEval: func,
	};
}


export var t: Requirement = {
	alignment: {
		y: inf.near,
	},
};

export var m: Requirement = {
	alignment: {
		y: inf.center,
	},
};

export var b: Requirement = {
	alignment: {
		y: inf.far,
	},
};

export var l: Requirement = {
	alignment: {
		x: inf.near,
	},
};

export var c: Requirement = {
	alignment: {
		x: inf.center,
	},
};

export var r: Requirement = {
	alignment: {
		x: inf.far,
	},
};

export var tl: Requirement = {
	alignment: {
		x: inf.near,
		y: inf.near,
	},
};

export var tc: Requirement = {
	alignment: {
		x: inf.center,
		y: inf.near,
	},
};

export var tr: Requirement = {
	alignment: {
		x: inf.far,
		y: inf.near,
	},
};

export var ml: Requirement = {
	alignment: {
		x: inf.near,
		y: inf.center,
	},
};

export var mc: Requirement = {
	alignment: {
		x: inf.center,
		y: inf.center,
	},
};

export var mr: Requirement = {
	alignment: {
		x: inf.far,
		y: inf.center,
	},
};

export var bl: Requirement = {
	alignment: {
		x: inf.near,
		y: inf.far,
	},
};

export var bc: Requirement = {
	alignment: {
		x: inf.center,
		y: inf.far,
	},
};

export var br: Requirement = {
	alignment: {
		x: inf.far,
		y: inf.far,
	},
};

export var knownW: Requirement = {
	w: inf.pxUnit,
};

export var knownH: Requirement = {
	h: inf.pxUnit,
};

export var shrinkW: Requirement = {
	w: inf.shrinkUnit,
}

export var shrinkH: Requirement = {
	h: inf.shrinkUnit,
}

export var fixedW: Requirement = eitherOr(
	knownW,
	all([
		{ w: inf.pctUnit },
		parent(lazy(() => fixedW))
	])
);

export var fixedH: Requirement = eitherOr(
	knownH,
	all([
		{ h: inf.pctUnit },
		parent(lazy(() => fixedH))
	])
);

export var hasContent: Requirement = {
	hasContent: true,
};

export var isContentText: Requirement = {
	isText: true,
};

function satisfiesForTarget(component: comp.Component, requirement: Requirement): boolean {
	var ok = true;
	util.forEachDirection((direction: inf.Direction) => {
		var lengthReq = util.getLength<inf.LengthUnit>(requirement, direction);
		if (lengthReq == null)
			return;

		var length = LengthAttribute.getFrom(component, direction);
		if (!length)
			return;

		switch (lengthReq) {
			case inf.pxUnit:
				ok = ok && length.px.isSet();
				break;
			case inf.pctUnit:
				ok = ok && length.pct.isSet();
				break;
			case inf.expandUnit:
			case inf.shrinkUnit:
				assert(false); // TODO
				break;
			case inf.unknownUnit:
			default:
				// It's okay if we actually have a length
				break;
		}
	});
	if (!ok)
		return false;

	if (requirement.hasContent != null &&
		requirement.hasContent !== hasBoxContent(component))
		return false;

	if (requirement.isText != null && requirement.isText !== isText(component))
		return false;

	if (requirement.alignment) {
		var parent = component.getParent();
		if (!parent)
			return false;

		util.forEachDirection((direction: inf.Direction) => {
			var alignment = util.getPosition<inf.Alignment>(requirement.alignment, direction);
			if (alignment == null)
				return;

			var alignAttr = Alignment.getFrom(parent, direction);
			if (!alignAttr) {
				ok = false;
				return;
			}
			switch (alignment) {
				case inf.near:
					if (alignAttr.near !== component) {
						ok = false;
						return;
					}
					break;
				case inf.center:
					if (alignAttr.center !== component) {
						ok = false;
						return;
					}
					break;
				case inf.far:
					if (alignAttr.far !== component) {
						ok = false;
						return;
					}
					break;
				default:
					assert(false); // Not supported yet? or ever?
					return;
			}
		});
	}
	if (!ok)
		return false;

	if (requirement.lazyEval && !satisfies(component, requirement.lazyEval()))
		return false;

	return true;
}

export function satisfies(component: comp.Component, requirement: Requirement, ignoreTarget: boolean = false): boolean {
	var runAggregate: (component: comp.Component, ignoreTarget: boolean) => boolean = null;
	if (requirement.aggregate) {
		assert(requirement.aggregateType != null);
		switch (requirement.aggregateType) {
			case AggregateType.ALL:
				runAggregate = (component, ignoreTarget) => {
					return requirement.aggregate.every(
						(subRequirement) => satisfies(component, subRequirement, ignoreTarget)
					);
				};
				break;
			case AggregateType.ANY:
				runAggregate = (component, ignoreTarget) => {
					return requirement.aggregate.some(
						(subRequirement) => satisfies(component, subRequirement, ignoreTarget)
					);
				};
				break;
			case AggregateType.NONE:
				runAggregate = (component, ignoreTarget) => {
					return !requirement.aggregate.some(
						(subRequirement) => satisfies(component, subRequirement, ignoreTarget)
					);
				};
				break;
		}
	}

	var target: Target;
	if (!ignoreTarget)
		target = requirement.target;
	switch (target) {
		default:
			// fallthrough
		case Target.SELF:
			if (!satisfiesForTarget(component, requirement) ||
				(runAggregate && !runAggregate(component, false/*ignoreTarget*/)))
				return false;
			break;
		case Target.PARENT:
			var parent = component.getParent();
			if (!parent)
				return false;
			if (!satisfiesForTarget(parent, requirement) ||
				(runAggregate && !runAggregate(parent, true/*ignoreTarget*/)))
				return false;
			break;
		case Target.ANY_CHILDREN:
			if (!component.getChildren().some(
					(child) => (
						satisfiesForTarget(child, requirement) &&
						(!runAggregate || runAggregate(child, true/*ignoreTarget*/))
					)
				))
				return false;
			break;
		case Target.ALL_CHILDREN:
			if (!component.getChildren().every(
					(child) => (
						satisfiesForTarget(child, requirement) &&
						(!runAggregate || runAggregate(child, true/*ignoreTarget*/))
					)
				))
				return false;
			break;
	}

	return true;
}

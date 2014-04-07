/// <reference path="../../../d.ts/typings.d.ts" />

import assert = require('assert');
import _ = require('underscore');

import comp = require('./Component');
import inf = require('../spec/interfaces');
import util = require('../spec/util');
import LengthAttribute = require('./attributes/LengthAttribute');
import CSSAttribute = require('./attributes/CSSAttribute');
import Alignment = require('./attributes/Alignment');
import hasBoxContent = require('./patterns/hasBoxContent');
import getDirection = require('./patterns/getDirection');
import isText = require('./patterns/isText');
import getTextLines = require('./patterns/getTextLines');

export enum Target {
	SELF,
	PARENT,
	ALL_CHILDREN,
	ANY_CHILDREN,
	ALL_DESCENDENTS,
	ANY_DESCENDENTS,
}

export enum AggregateType {
	ALL,
	ANY,
	NONE,
}

export interface Requirement {
	name?: string;

	direction?: inf.Direction;
	w?: inf.LengthUnit;
	h?: inf.LengthUnit;
	exactW?: inf.Length;
	exactH?: inf.Length;
	wRuntime?: boolean;
	hRuntime?: boolean;
	hasContent?: boolean;
	isText?: boolean;
	isOnlyText?: boolean;
	hasNodes?: boolean;
	textLines?: number;
	isImage?: boolean;
	hasCSS?: { [name: string]: string;};
	// Alignment in parent
	alignment?: {
		x?: inf.Alignment;
		y?: inf.Alignment;
	};
	lazyEval?: () => Requirement;
	custom?: (component: comp.Component) => any;

	target?: Target;

	aggregate?: Requirement[];
	aggregateType?: AggregateType;

	capturedComponents?: comp.Component[];
}

export var none: Requirement = {};

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

function ensureCleanTarget(requirement: Requirement): Requirement {
	if (!requirement.target)
		return requirement

	return all([requirement]);
}

export function allChildren(requirement: Requirement): Requirement {
	var req: Requirement = {};
	_.extend(req, ensureCleanTarget(requirement));
	req.target = Target.ALL_CHILDREN;
	return req;
}

export function anyChildren(requirement: Requirement): Requirement {
	var req: Requirement = {};
	_.extend(req, ensureCleanTarget(requirement));
	req.target = Target.ANY_CHILDREN;
	return req;
}

// At least one child has to be A, and any children that's not A must be B.
export function anyChildrenOptional(requirement: Requirement, optional: Requirement): Requirement {
	return all([
		anyChildren(requirement),
		allChildren(eitherOr(requirement, optional)),
	]);
}

export function anyDescendents(requirement: Requirement): Requirement {
	var req: Requirement = {};
	_.extend(req, ensureCleanTarget(requirement));
	req.target = Target.ANY_DESCENDENTS;
	return req;
}

export function allDescendents(requirement: Requirement): Requirement {
	var req: Requirement = {};
	_.extend(req, ensureCleanTarget(requirement));
	req.target = Target.ALL_DESCENDENTS;
	return req;
}

// At least one descendent has to satisfy A, and all of its ancestors (excluding
// the current one) must satisfy B.
export function anyDescendentsWithAncestors(requirement: Requirement, ancestor: Requirement): Requirement {
	var A = all([ancestor]);

	// The component could either
	var req = eitherOr(
		// Satisfy the requirement itself
		requirement,
		// or satisfy A,
		A
	);
	// where A is both satisfying 'ancestor' and 'req'.
	A.aggregate.push(anyDescendents(req));

	// Don't apply to the component iself
	return anyChildren(req);
}

// At least one descendent has to satisfy A, and all other descendents must
// (have a descendent that satisfies A) or (satisfy B itself).
export function anyDescendentsOptional(requirement: Requirement, optional: Requirement): Requirement {
	// This is some tricky code.
	var must = {
		aggregate: [requirement],
		aggregateType: AggregateType.ANY,
	};
	var allReq = allDescendents(
		eitherOr(
			optional,
			must
		)
	);
	must.aggregate.push(allReq);
	return all([
		anyDescendents(requirement),
		allReq,
	]);
}

export function parent(requirement: Requirement): Requirement {
	var req: Requirement = {};
	_.extend(req, ensureCleanTarget(requirement));
	req.target = Target.PARENT;
	return req;
}

export var hasParent: Requirement = {
	target: Target.PARENT,
};

export function hasCSS(styles: {[name: string]: string}): Requirement {
	return {
		hasCSS: styles,
	};
}

export function custom(func: (component: comp.Component) => any): Requirement {
	return {
		custom: func,
	};
}

export var isNode: Requirement = custom((component: comp.Component) => !!component.nodeAttr());

export function firstAncestor(match: Requirement, requirement: Requirement): Requirement {
	return {
		custom: (component: comp.Component) => {
			var parent = component;
			while (parent = parent.getParent()) {
				if (satisfies(parent, match)) {
					return satisfies(parent, requirement);
				}
			}
			return false;
		}
	};
}

export function lazy(func: () => Requirement): Requirement {
	return {
		lazyEval: func,
	};
}

export var horiz: Requirement = {
	direction: inf.horiz,
};

export var vert: Requirement = {
	direction: inf.vert,
};

export function getFromDirection(direction: inf.Direction): Requirement {
	return direction === inf.horiz ? horiz : vert;
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

export function fromDirectionAlignment(direction: inf.Direction, alignment: inf.Alignment): Requirement {
	if (direction === inf.horiz) {
		switch (alignment) {
			case inf.near:
				return l;
			case inf.center:
				return c;
			case inf.far:
				return r;
		}
	} else {
		switch (alignment) {
			case inf.near:
				return t;
			case inf.center:
				return m;
			case inf.far:
				return b;
		}
	}
	assert(false);
}

export var knownW: Requirement = {
	w: inf.pxUnit,
};

export var knownH: Requirement = {
	h: inf.pxUnit,
};

export var runtimeW: Requirement = {
	wRuntime: true,
};

export var runtimeH: Requirement = {
	hRuntime: true,
};

export var shrinkW: Requirement = {
	w: inf.shrinkUnit,
}

export var shrinkH: Requirement = {
	h: inf.shrinkUnit,
}

export function exactW(w: inf.Length): Requirement {
	return {
		exactW: w,
	};
}

export function exactH(h: inf.Length): Requirement {
	return {
		exactH: h,
	};
}

export function exact(direction: inf.Direction, length: inf.Length): Requirement {
	return direction === inf.horiz ? exactW(length) : exactH(length);
}


export var hasContent: Requirement = {
	hasContent: true,
};

export var isContentText: Requirement = {
	isText: true,
};

export var isOnlyText: Requirement = {
	isOnlyText: true,
};

export var hasNodes: Requirement = {
	hasNodes: true,
};

export function textLines(lines: number): Requirement {
	return {
		isText: true,
		textLines: lines,
	};
};

export function capture(requirement: Requirement, components: comp.Component[]): Requirement {
	var req: Requirement = {};
	_.extend(req, requirement);
	req.capturedComponents = components;
	return req;
}

function satisfiesForTarget(component: comp.Component, requirement: Requirement): boolean {
	var ok = true;

	if (requirement.direction != null && getDirection(component) !== requirement.direction)
		ok = false;

	var box = component.getBox();
	util.forEachDirection((direction: inf.Direction) => {
		var runtime = (direction === inf.horiz) ? requirement.wRuntime : requirement.hRuntime;
		if (runtime && (!box || !util.getLength<inf.Length>(box, direction).runtime))
			ok = false;

		var length = LengthAttribute.getFrom(component, direction);

		var lengthReq = util.getLength<inf.LengthUnit>(requirement, direction);
		if (lengthReq != null) {
			switch (lengthReq) {
				case inf.pxUnit:
					ok = ok && length && length.px.isSet();
					break;
				case inf.pctUnit:
					ok = ok && length && length.pct.isSet();
					break;
				case inf.expandUnit:
					if (!box || util.getLength<inf.Length>(box, direction).unit !== inf.expandUnit)
						ok = false;
					break;
				case inf.shrinkUnit:
					if (!box || util.getLength<inf.Length>(box, direction).unit !== inf.shrinkUnit)
						ok = false;
					break;
				default:
					// It's okay if we actually have a length
					break;
			}
		}

		var exactLengthReq = (direction === inf.horiz) ? requirement.exactW : requirement.exactH;
		if (exactLengthReq != null) {
			switch (exactLengthReq.unit) {
				case inf.pxUnit:
					if (!length || !length.px.isSet() || exactLengthReq.value !== length.px.value)
						ok = false;
					break;
				case inf.pctUnit:
					if (!length || !length.pct.isSet() || exactLengthReq.value !== length.pct.value)
						ok = false;
					break;
				default:
					assert(false);
					break;
			}
		}
	});
	if (!ok)
		return false;

	if (requirement.hasContent != null &&
		requirement.hasContent !== hasBoxContent(component))
		return false;

	if (requirement.isText != null && requirement.isText !== isText(component))
		return false;

	if (requirement.isOnlyText != null && requirement.isOnlyText !== isText(component, true))
		return false;

	if (requirement.hasNodes != null &&
		requirement.hasNodes !== hasBoxContent(component, true))
		return false;

	if (requirement.textLines != null &&
		requirement.textLines !== getTextLines(component)) {
		return false;
	}

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

	if (requirement.hasCSS) {
		var cssAttr = CSSAttribute.getFrom(component);
		if (!cssAttr)
			return false;

		for (var name in requirement.hasCSS) {
			var value = requirement.hasCSS[name];
			if (cssAttr.styles[name] !== value) {
				return false;
			}
		}
	}

	if (requirement.custom && !requirement.custom(component))
		return false;

	if (requirement.lazyEval && !satisfies(component, requirement.lazyEval()))
		return false;

	return true;
}

export function satisfies(component: comp.Component, requirement: Requirement): boolean {
	var runAggregate: (component: comp.Component) => boolean = null;
	if (requirement.aggregate) {
		assert(requirement.aggregateType != null);
		switch (requirement.aggregateType) {
			case AggregateType.ALL:
				runAggregate = (component) => {
					return requirement.aggregate.every(
						(subRequirement) => satisfies(component, subRequirement)
					);
				};
				break;
			case AggregateType.ANY:
				runAggregate = (component) => {
					return requirement.aggregate.some(
						(subRequirement) => satisfies(component, subRequirement)
					);
				};
				break;
			case AggregateType.NONE:
				runAggregate = (component) => {
					return !requirement.aggregate.some(
						(subRequirement) => satisfies(component, subRequirement)
					);
				};
				break;
		}
	}

	var targetComponents: comp.Component[] = [];
	switch (requirement.target) {
		default:
			// fallthrough
		case Target.SELF:
			if (!satisfiesForTarget(component, requirement) ||
				(runAggregate && !runAggregate(component)))
				return false;
			targetComponents.push(component);
			break;
		case Target.PARENT:
			var parent = component.getParent();
			if (!parent)
				return false;
			if (!satisfiesForTarget(parent, requirement) ||
				(runAggregate && !runAggregate(parent)))
				return false;
			targetComponents.push(parent);
			break;
		case Target.ANY_CHILDREN:
			var targetComponents = component.getChildren().filter(
				(child) => (
					satisfiesForTarget(child, requirement) &&
					(!runAggregate || runAggregate(child))
				)
			);
			if (targetComponents.length === 0)
				return false;
			break;
		case Target.ALL_CHILDREN:
			if (!component.getChildren().every(
					(child) => (
						satisfiesForTarget(child, requirement) &&
						(!runAggregate || runAggregate(child))
					)
				))
				return false;
			targetComponents = component.getChildren();
			break;
		case Target.ALL_DESCENDENTS:
			var ok = true;
			component.iterateChildrenBreadthFirst((descendent) => {
				if (descendent === component)
					return;

				if (!satisfiesForTarget(descendent, requirement) ||
					!(!runAggregate || runAggregate(descendent))) {
					ok = false;
					return comp.STOP_ITERATION;
				}

				targetComponents.push(descendent);
			});
			if (!ok)
				return false;
			break;
		case Target.ANY_DESCENDENTS:
			var ok = false;
			component.iterateChildrenBreadthFirst((descendent) => {
				if (descendent === component)
					return;

				if (satisfiesForTarget(descendent, requirement) &&
					(!runAggregate || runAggregate(descendent))) {
					ok = true;
					targetComponents.push(descendent);
					// Capture all matching descendents!. Don't return
					// STOP_ITERATION; here.
				}
			});
			if (!ok)
				return false;
			break;
	}

	if (requirement.capturedComponents) {
		targetComponents.forEach((targetComponent) => {
			if (requirement.capturedComponents.indexOf(targetComponent) === -1) {
				requirement.capturedComponents.push(targetComponent);
			}
		});
	}

	return true;
}

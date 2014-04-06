import assert = require('assert');

import c = require('./Component');
import reqs = require('./requirements');
import LengthAttribute = require('./attributes/LengthAttribute');
import Spacing = require('./attributes/Spacing');
import Alignment = require('./attributes/Alignment');
import CSSAttribute = require('./attributes/CSSAttribute');
import sinf = require('../spec/interfaces');
import sutil = require('../spec/util');

export interface Pattern<MatchType> {
	(component: c.Component, matches?: PatternMatches, ...whatever: any[]): MatchType;
}

interface PatternMatch<MatchType> {
	component: c.Component;
	pattern: Pattern<MatchType>;
	match: MatchType;
}

export class PatternMatches {
	private matches: PatternMatch<any>[] = [];
	private currentlyMatching: { component: c.Component; pattern: Pattern<any>; }[] = [];

	private getMatchPair<MatchType>(component: c.Component, pattern: Pattern<MatchType>): PatternMatch<MatchType> {
		for (var i in this.matches) {
			if (this.matches[i].pattern === pattern && this.matches[i].component === component)
				return this.matches[i];
		}
		return null;
	}

	private addMatch<MatchType>(component: c.Component, pattern: Pattern<MatchType>, match: MatchType): void {
		assert(this.getMatchPair(component, pattern) == null);
		this.matches.push({
			component: component,
			pattern: pattern,
			match: match,
		});
	}

	getMatch<MatchType>(component: c.Component, pattern: Pattern<MatchType>): MatchType {
		var matchPair = this.getMatchPair(component, pattern);
		if (matchPair)
			return matchPair.match;

		// If we are already doing this, then we'll infinite loop
		assert(!this.currentlyMatching.some((current) => {
			return current.component === component && current.pattern === pattern;
		}));

		this.currentlyMatching.push({
			component: component,
			pattern: <Pattern<any>>pattern,
		});

		var match = pattern(component, this);
		this.addMatch(component, pattern, match);

		this.currentlyMatching.pop();

		return match;
	}
}

class PatternCache<T> {
	private cache: { pattern: Pattern<T>; args: any[]; }[] = [];

	add(pattern: Pattern<T>, ...args: any[]): Pattern<T> {
		assert(this.get(args) == null);
		this.cache.push({
			pattern: pattern,
			args: args,
		});
		return pattern;
	}

	addList(pattern: Pattern<T>, args: any[]): Pattern<T> {
		var argsCopy: any[] = args.slice(0);
		argsCopy.unshift(pattern);
		return this.add.apply(this, argsCopy);
	}

	get(...args: any[]): Pattern<T> {
		for (var i = 0; i < this.cache.length; ++i) {
			var cache = this.cache[i];
			if (cache.args.length === args.length && cache.args.every((arg, i) => arg === args[i])) {
				return cache.pattern;
			}
		}
		return null;
	}

	getList(args: any[]): Pattern<T> {
		return this.get.apply(this, args);
	}
}

/*
interface ComponentPatternMatch {
	component: c.Component;
	patternMatches: PatternMatches;
}

export class LayoutPatternMatches {
	private patternMatches: ComponentPatternMatch[] = [];

	private getMatch(component: c.Component): ComponentPatternMatch {
		for (var i in this.patternMatches) {
			if (this.patternMatches[i].component === component)
				return this.patternMatches[i];
		}
		return null;
	}

	addMatch<MatchType>(c.Component: pattern: Pattern<MatchType>, match: MatchType): void {
		assert(this.getMatchPair(pattern) == null);
		this.matches.push({
			pattern: pattern,
			match: match,
		});
	}

	getMatch<MatchType>(pattern: Pattern<MatchType>): MatchType {
		var matchPair = this.getMatchPair(pattern);
		assert(matchPair);
		return matchPair.match;
	}
}
*/


export var getDirection: Pattern<sinf.Direction> = function(component: c.Component): sinf.Direction {
	var box = component.getBox();
	if (box) {
		return box.direction;
	}

	var parent = component.getParent();
	if (parent) {
		return getDirection(parent);
	}
	assert(false);
}

export var isNode: Pattern<boolean> = function(component: c.Component): boolean {
	return !!component.nodeAttr();
}

export var getBox: Pattern<sinf.Box> = function(component: c.Component): sinf.Box {
	return component.getBox();
}

export var isText: Pattern<boolean> = function(component: c.Component): boolean {
	var box = component.getBox();
	return !!(box && box.staticContent && box.staticContent.text);
}

export var isTextLinesKnown: Pattern<boolean> = function(component: c.Component, matches: PatternMatches): boolean {
	if (!matches.getMatch(component, isText))
		return false;
	var lines = sutil.textExactLines(component.getBox().staticContent.text);
	return lines != null;
}

export var isText1Line: Pattern<boolean> = function(component: c.Component, matches: PatternMatches): boolean {
	if (!matches.getMatch(component, isText))
		return false;
	var lines = sutil.textExactLines(component.getBox().staticContent.text);
	return lines === 1;
}

export var isParentsSize: Pattern<boolean> = function(component: c.Component): boolean {
	var width = LengthAttribute.getFrom(component, sinf.horiz);
	var height = LengthAttribute.getFrom(component, sinf.vert);
	return (
		width && width.pct.isSet() && width.pct.value === 1 &&
		height && height.pct.isSet() && height.pct.value == 1
	);
}

export var isSpacing: Pattern<boolean> = function(component: c.Component): boolean {
	return !!Spacing.getFrom(component);
}

export interface ComponentsTuple {
	front: c.Component[];
	back: c.Component[];
}

// Gets list the components at the front and back of the list of children, such that
// they are consecutively empty spaces
export var getSpacingAroundChildren: Pattern<ComponentsTuple> = function(component: c.Component): ComponentsTuple {
	var children = component.getChildren();
	var front: c.Component[] = [];
	for (var i = 0; i < children.length; ++i) {
		var component = children[i];
		if (Spacing.getFrom(component))
			front.push(component);
		else
			break;
	}
	var back: c.Component[] = [];
	for (var i = children.length - 1; i >= 0; --i) {
		var component = children[i];
		if (Spacing.getFrom(component))
			back.unshift(component);
		else
			break;
	}
	if (front.length > 0 || back.length > 0)
		return {front: front, back: back};
}

export var getKnownWidth: Pattern<number> = function(component: c.Component): number {
	var l = LengthAttribute.getFrom(component, sinf.horiz);
	if (l && l.px.isSet())
		return l.px.value;
}

export var getKnownHeight: Pattern<number> = function(component: c.Component): number {
	var l = LengthAttribute.getFrom(component, sinf.vert);
	if (l && l.px.isSet())
		return l.px.value;
}

export var isShrinkWidth: Pattern<boolean> = function(component: c.Component): boolean {
	var box = component.getBox();
	if (!box)
		return false;
	return box.w.unit === sinf.shrinkUnit;
}

export var isShrinkHeight: Pattern<boolean> = function(component: c.Component): boolean {
	var box = component.getBox();
	if (!box)
		return false;
	return box.h.unit === sinf.shrinkUnit;
}

// Get descendents such that
// 1. They have content in them
// 2. The far (right, or bottom) edge < the near (left, top) edge of the next one, along the target component's direction
// 3. Their parent does not satisfy 1 and 2 if used in their place
export var getContentChildrenInDirection: Pattern<c.Component[]> = function(
	component: c.Component, matches: PatternMatches, direction: sinf.Direction = null, includeSelf: boolean = false
): c.Component[] {
	if (includeSelf && (component.nodeAttr() || matches.getMatch(component, isText))) {
		return [component];
	}

	if (!direction) {
		direction = matches.getMatch(component, getDirection);
	}

	var componentDirection = matches.getMatch(component, getDirection);
	if (componentDirection === direction) {
		var contents: c.Component[] = [];
		component.getChildren().
			filter((child) => !Spacing.getFrom(child)).
			forEach((child: c.Component) => {
				contents.push.apply(contents, getContentChildrenInDirection(child, matches, direction, true));
			});
		if (contents.length > 0) {
			return contents
		}
	} else {
		var spacing = matches.getMatch(component, getSpacingAroundChildren);
		var spacingCount = spacing ? (spacing.front.length + spacing.back.length) : 0;
		if ((spacingCount + 1) === component.getChildren().length) {
			var content = component.getChildren()[spacing ? spacing.front.length : 0];
			return getContentChildrenInDirection(content, matches, direction, true);
		} else {
			return [component];
		}
	}
}

export var getOnlyContentChild: Pattern<c.Component> = function(component: c.Component, matches: PatternMatches): c.Component {
	var children = matches.getMatch(component, getContentChildrenInDirection);
	if (!children || children.length === 0)
		return null;

	return children[0];
}

var isCache = new PatternCache<c.Component>();
export function is<T>(componentPattern: Pattern<c.Component>, matchPattern: Pattern<T>): Pattern<T> {
	var cache = isCache.get(matchPattern);
	if (cache)
		return cache;

	return isCache.add((component: c.Component, matches: PatternMatches) => {
		var target = matches.getMatch(component, componentPattern);
		assert(target);
		return matches.getMatch(target, matchPattern);
	}, matchPattern);
}

var alignedWithinParentCache = new PatternCache<boolean>();
export function isAlignedWithinParent(direction: sinf.Direction, alignment: sinf.Alignment): Pattern<boolean> {
	var cache = alignedWithinParentCache.get(direction, alignment);
	if (cache)
		return cache;

	return alignedWithinParentCache.add((component: c.Component, matches: PatternMatches) => {
		var parent = component.getParent();
		if (!parent)
			return false;

		var alignAttr = Alignment.getFrom(parent, direction);
		if (alignAttr) {
			return (
				alignment === sinf.near && alignAttr.near === component ||
				alignment === sinf.center && alignAttr.center === component ||
				alignment === sinf.far && alignAttr.far === component
			);
		} else {
			var parentDirection = matches.getMatch(parent, getDirection);
			if (parentDirection === direction) {
				return false;
			}

			var length = LengthAttribute.getFrom(component, direction);
			return length && length.pct.isSet() && length.pct.value === 1;
		}
	}, direction, alignment);
}

var alignedCache = new PatternCache<boolean>();
export function isAligned(componentPattern: Pattern<c.Component>, direction: sinf.Direction, alignment: sinf.Alignment): Pattern<boolean> {
	var cache = alignedCache.get(componentPattern, direction, alignment);
	if (cache)
		return cache;

	return alignedCache.add((component: c.Component, matches: PatternMatches) => {
		var target = matches.getMatch(component, componentPattern);
		assert(target && target.isDescendentOf(component));
		var sameLength = true;
		do {
			if (!matches.getMatch(target, isAlignedWithinParent(direction, alignment)))
				return false;

			if (sameLength) {
				var lengthAttr = LengthAttribute.getFrom(target, direction);
				// lengthAttr is only null if the target is of unknown height
				if (!lengthAttr || !lengthAttr.pct.isSet() || lengthAttr.pct.value !== 1) {
					sameLength = false;
				}
			}
		} while ((target = target.getParent()) && target !== component);

		// The target has to be a different width than the parent. Otherwise,
		// it's not even aligned.
		return !sameLength;
	}, componentPattern, direction, alignment);
}

var anyCache = new PatternCache<any>();
export function any(patterns: Pattern<any>[]): Pattern<boolean> {
	var cache = anyCache.getList(patterns);
	if (cache)
		return cache;

	return anyCache.addList((component: c.Component, matches: PatternMatches) => {
		return patterns.some((pattern: Pattern<any>) => matches.getMatch(component, pattern));
	}, patterns);
}

var allCache = new PatternCache<any>();
export function all(patterns: Pattern<any>[]): Pattern<boolean> {
	var cache = allCache.getList(patterns);
	if (cache)
		return cache;

	return allCache.addList((component: c.Component, matches: PatternMatches) => {
		return patterns.every((pattern: Pattern<any>) => matches.getMatch(component, pattern));
	}, patterns);
}

var notCache = new PatternCache<any>();
export function not(pattern: Pattern<any>): Pattern<boolean> {
	var cache = notCache.get(pattern);
	if (cache)
		return cache;

	return notCache.add((component: c.Component, matches: PatternMatches) => {
		return !matches.getMatch(component, pattern);
	}, pattern);
}

export function isTableCellInTable(component: c.Component, matches: PatternMatches): boolean {
	return (
		CSSAttribute.getStyle(component, 'display') === 'table-cell' &&
		CSSAttribute.getStyle(component.getParent(), 'display') === 'table' &&
		component.getParent().getChildren().length === 1 &&
		matches.getMatch(component, isParentsSize)
	);
}

export function getNodeDescendents(component: c.Component, matches: PatternMatches): c.Component[] {
	var direction = matches.getMatch(component, getDirection);
	var contentChildren = matches.getMatch(component, getContentChildrenInDirection);
	// TODO support %'s. This assumes every spacing is a px spacing
	return contentChildren;
}

function canChildSpacingBeMarginOrPadding(child: c.Component): boolean {
	assert(Spacing.getFrom(child));
	var width = LengthAttribute.getFrom(child, sinf.horiz);
	var height = LengthAttribute.getFrom(child, sinf.vert);

	return (
		width && (width.px.isSet() || width.pct.isSet()) &&
		// % values of margin and padding are specified in terms of width of the
		// container
		height && height.px.isSet()
	);
}


// Alignment

export var isHorizontalCenterOrRight = any([
	isAligned(getOnlyContentChild, sinf.horiz, sinf.center),
	isAligned(getOnlyContentChild, sinf.horiz, sinf.far),
]);

export var isVerticalMiddleOrBottom = any([
	isAligned(getOnlyContentChild, sinf.vert, sinf.center),
	isAligned(getOnlyContentChild, sinf.vert, sinf.far),
]);

export var needsAbsolutePositioning = any([
	all(<Pattern<any>[]>[
		// Parent has unknown height
		not(getKnownHeight),
		// Content has known height
		is(getOnlyContentChild, getKnownHeight),
		isVerticalMiddleOrBottom,
	]),
	all([
		isAligned(getOnlyContentChild, sinf.vert, sinf.far),
		// Content has unknown height
		not(is(getOnlyContentChild, getKnownHeight)),
	]),
]);

export var needsTableCell = any([
	all([
		// Content is vertically middle aligned.
		isAligned(getOnlyContentChild, sinf.vert, sinf.center),
		// Content has unknown height
		not(is(getOnlyContentChild, getKnownHeight)),
	]),
	all([
		// Normally, we can use absolute negative margins, but not if
		// the content has unknown width...
		any([
			// Either parent has unknown height
			not(getKnownHeight),
			// or content has unknown height (so parent cannot use padding-top)
			not(is(getOnlyContentChild, getKnownHeight)),
		]),
		// Content needs to be horizontally centered
		isAligned(getOnlyContentChild, sinf.horiz, sinf.center),
		// and has unknown width
		not(is(getOnlyContentChild, getKnownWidth)),
		// and is not text. We can always text-align center text.
		not(is(getOnlyContentChild, isText)),
	]),
]);

export var isHorizontalAligned = all(<Pattern<any>[]>[
	getOnlyContentChild,
	isHorizontalCenterOrRight,
]);

export var isVerticalAligned = all(<Pattern<any>[]>[
	getOnlyContentChild,
	isVerticalMiddleOrBottom,
]);

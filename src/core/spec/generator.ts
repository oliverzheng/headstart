/// <reference path="../../../d.ts/typings.d.ts" />

import inf = require('./interfaces')
import iter = require('./iterator')

/**
 * Turn an array into an iterator.
 */
export class FromArray<T> extends iter.IterBase<T> {
	private items: T[];
	private i: number;

	constructor(items: T[]) {
		super();

		this.items = items;
		this.i = 0;
	}

	next(): T {
		if (this.i < this.items.length)
			return this.items[this.i++];
	}

	copy(): FromArray<T> {
		return new FromArray(this.items);
	}
}

export function fromArray<T>(items: T[]): FromArray<T> {
	return new FromArray(items);
}

function getDeepest(box: inf.Box): inf.Box {
	while ((box.children || <inf.Box[]>[]).length > 0)
		box = box.children[0];
	return box;
}

/**
 * Iterate boxes by depth-first.
 *
 * @param root The root of the boxes to restrict depth first search to.
 * @param start The first box under root to start. All boxes before that are
 * discarded.
 */
export class DepthFirst extends iter.IterBase<inf.Box> {
	private root: inf.Box;
	private start: inf.Box;
	private prev: inf.Box;

	constructor(root: inf.Box, start: inf.Box = null) {
		super();

		this.root = root;
		this.start = start || getDeepest(root);
		this.prev = null;
	}

	next(): inf.Box {
		/* First time here */
		if (!this.prev)
			return this.prev = this.start;

		if (this.prev === this.root)
			/* We are done iterating */
			return null;

		var parent = this.prev.parent;
		var siblings = parent.children;
		var nextIndex = siblings.indexOf(this.prev) + 1;
		if (nextIndex < siblings.length)
			return this.prev = getDeepest(siblings[nextIndex]);
		else
			return this.prev = parent;
	}

	copy(): DepthFirst {
		var copy = new DepthFirst(this.root, this.prev);
		if (this.prev)
			copy.next(); /* We already iterated prev. */
		return copy;
	}
}

export function depthFirst(root: inf.Box, start: inf.Box = null): DepthFirst {
	return new DepthFirst(root, start);
}

/**
 * Iter for depthFirst in reverse order. I.e. bottom up.
 */
export class ReverseDepthFirst extends iter.IterBase<inf.Box> {
	private root: inf.Box;
	private start: inf.Box;
	private prev: inf.Box;
	private last: inf.Box;

	constructor(root: inf.Box, start: inf.Box = null) {
		super();

		this.root = root;
		this.start = start || root;
		this.last = getDeepest(root);
		this.prev = null;
	}

	next(): inf.Box {
		/* First time here */
		if (!this.prev)
			return this.prev = this.start;

		if (this.prev === this.last)
			/* We are done iterating */
			return null;

		var children = this.prev.children || <inf.Box[]>[];
		if (children.length > 0)
			return this.prev = children[children.length - 1];

		var parent = this.prev.parent;
		var prevNode = this.prev;
		while (parent) {
			var siblings = parent.children;
			var nextIndex = siblings.indexOf(prevNode) - 1;
			if (nextIndex >= 0)
				return this.prev = siblings[nextIndex];
			else {
				prevNode = parent;
				parent = parent.parent;
			}
		}
	}

	copy(): ReverseDepthFirst {
		var copy = new ReverseDepthFirst(this.root, this.prev);
		if (this.prev)
			copy.next(); /* We already iterated prev. */
		return copy;
	}
}

export function reverseDepthFirst(root: inf.Box,
								  start: inf.Box = null): ReverseDepthFirst {
	return new ReverseDepthFirst(root, start);
}

export class Counter extends iter.IterBase<number> {
	private nextNumber: number;

	constructor(start: number = 0) {
		super();
		this.nextNumber = start;
	}

	next(): number {
		return this.nextNumber++;
	}

	copy(): Counter {
		return new Counter(this.nextNumber);
	}
}

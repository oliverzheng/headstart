/// <reference path="../../../d.ts/typings.d.ts" />

import inf = require('./interfaces')

/** An iterator to get objects. If returns null, iteration has stopped. */
export interface Iter<T> {
	next(): T;
	copy(): Iter<T>;
	toArray(): T[];
	first(condition?: (obj: T) => boolean): T;
	forEach(callback: (obj: T, i: number) => any): void;
	filter(condition: (obj: T) => boolean): Iter<T>;
	any(condition?: (obj: T) => boolean): boolean;
	not(obj: T): Iter<T>;
	map<U>(mapping: (obj: T) => U): Iter<U>;
	take(count: number): Iter<T>;
	takeWhile(condition: (obj: T) => boolean): Iter<T>;
	drop(count: number): Iter<T>;
	dropWhile(condition: (obj: T) => boolean): Iter<T>;
	chain(other: Iter<T>): Iter<T>;
	unique(): Iter<T>;
}

export interface BoxIter extends Iter<inf.Box> {
}

export class IterBase<T> implements Iter<T> {
	next(): T {
		debugger;
		throw 'Next not implemented';
		return null;
	}

	copy(): Iter<T> {
		debugger;
		throw 'Copy not implemented';
		return null;
	}

	/**
	 * Generate a list out of an iterator.
	 */
	toArray(): T[] {
		var array: T[] = [];
		var obj: T;
		while (obj = this.next())
			array.push(obj);
		return array;
	}

	/**
	 * Returns the first obj that matches a condition.
	 */
	first(condition?: (obj: T) => boolean): T {
		var obj: T;
		while ((obj = this.next()) && condition && !condition(obj));
		return obj;
	}

	/**
	 * Iterates through all objects.
	 */
	forEach(callback: (obj: T, i: number) => any): void {
		var obj: T;
		var i = 0;
		while (obj = this.next())
			callback(obj, i++);
	}

	/**
	 * Returns a new iterator that filters things.
	 */
	filter(condition: (obj: T) => boolean): Iter<T> {
		return new FilterIter(this.copy(), condition);
	}

	/**
	 * Returns whether or not any obj in the iterator match the condition.
	 */
	any(condition?: (obj: T) => boolean): boolean {
		return this.first(condition) != null;
	}

	/**
	 * Returns a new iterator that's all objes but one.
	 */
	not(obj: T): Iter<T> {
		return this.filter((o) => {
			return o !== obj;
		});
	}

	/**
	 * Map iterator of one type to another type.
	 */
	map<U>(mapping: (obj: T) => U): Iter<U> {
		return new MapIter(this.copy(), mapping);
	}

	/**
	 * Take the first count of objes.
	 */
	take(count: number): Iter<T> {
		return new TakeIter(this.copy(), count);
	}

	/**
	 * Returns an iterator that produces as many objes as it can until condition
	 * fails.
	 */
	takeWhile(condition: (obj: T) => boolean): Iter<T> {
		return new TakeWhileIter(this.copy(), condition);
	}

	/**
	 * Drop the first count of objes.
	 */
	drop(count: number): Iter<T> {
		return new DropIter(this.copy(), count);
	}

	/**
	 * Returns an iterator that only starts producing objes when condition fails.
	 */
	dropWhile(condition: (obj: T) => boolean): Iter<T> {
		return new DropWhileIter(this.copy(), condition);
	}

	/**
	 * Chain two iterators sequentially.
	 */
	chain(other: Iter<T>): Iter<T> {
		return new ChainIter(this.copy(), other.copy());
	}

	/**
	 * Filters out things that have already appeared.
	 */
	unique(): Iter<T> {
		return new UniqueIter(this.copy());
	}
}

class FilterIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private callback: (item: T) => boolean;

	constructor(it: Iter<T>, callback: (item: T) => boolean) {
		super();

		this.it = it;
		this.callback = callback;
	}

	next(): T {
		var obj: T;
		while ((obj = this.it.next()) && !this.callback(obj));
		return obj;
	}

	copy(): FilterIter<T> {
		return new FilterIter<T>(this.it.copy(), this.callback);
	}
}

class MapIter<T, U> extends IterBase<U> {
	private it: Iter<T>;
	private mapping: (item: T) => U;

	constructor(it: Iter<T>, mapping: (item: T) => U) {
		super();

		this.it = it;
		this.mapping = mapping;
	}

	next(): U {
		var obj = this.it.next();
		if (obj)
			return this.mapping(obj);
	}

	copy(): MapIter<T, U> {
		return new MapIter(this.it.copy(), this.mapping);
	}
}

class TakeIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private count: number;

	constructor(it: Iter<T>, count: number) {
		super();

		this.it = it;
		this.count = count;
	}

	next(): T {
		if (this.count > 0) {
			this.count--;
			return this.it.next();
		}
	}

	copy(): TakeIter<T> {
		return new TakeIter<T>(this.it.copy(), this.count);
	}
}

class TakeWhileIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private condition: (item: T) => boolean;
	private stopped: boolean;

	constructor(it: Iter<T>, condition: (item: T) => boolean) {
		super();

		this.it = it;
		this.condition = condition;
		this.stopped = false;
	}

	next(): T {
		if (!this.stopped) {
			var obj = this.it.next();
			if (obj && this.condition(obj))
				return obj;
			else
				this.stopped = true;
		}
	}

	copy(): TakeWhileIter<T> {
		var copy = new TakeWhileIter<T>(this.it.copy(), this.condition);
		copy.stopped = this.stopped;
		return copy;
	}
}

class DropIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private count: number;

	constructor(it: Iter<T>, count: number) {
		super();

		this.it = it;
		this.count = count;
	}

	next(): T {
		while (this.count > 0) {
			this.count--;
			this.next();
		}
		return this.it.next();
	}

	copy(): DropIter<T> {
		return new DropIter<T>(this.it.copy(), this.count);
	}
}

class DropWhileIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private condition: (item: T) => boolean;
	private started: boolean;

	constructor(it: Iter<T>, condition: (item: T) => boolean) {
		super();

		this.it = it;
		this.condition = condition;
		this.started = false;
	}

	next(): T {
		var obj: T;
		while ((obj = this.it.next()) && !this.started && this.condition(obj));
		this.started = true;
		return obj;
	}

	copy(): DropWhileIter<T> {
		var copy = new DropWhileIter<T>(this.it.copy(), this.condition);
		copy.started = this.started;
		return copy;
	}
}

class ChainIter<T> extends IterBase<T> {
	private one: Iter<T>;
	private two: Iter<T>;
	private current: Iter<T>;

	constructor(one: Iter<T>, two: Iter<T>) {
		super();

		this.one = this.current = one;
		this.two = two;
	}

	next(): T {
		return this.current.next() || (this.current = this.two).next();
	}

	copy(): ChainIter<T> {
		var copy = new ChainIter<T>(this.one.copy(), this.two.copy());
		copy.current = (this.current === this.one) ? copy.one : copy.two;
		return copy;
	}
}

class UniqueIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private seen: T[];

	constructor(it: Iter<T>, seen: T[] = []) {
		super();

		this.it = it;
		this.seen = seen;
	}

	next(): T {
		var obj: T;
		while ((obj = this.it.next()) && this.seen.indexOf(obj) !== -1);
		if (obj)
			this.seen.push(obj);
		return obj;
	}

	copy(): UniqueIter<T> {
		return new UniqueIter<T>(this.it.copy(), this.seen.slice(0));
	}
}

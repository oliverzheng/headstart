import inf = require('./interfaces');
import util = require('./util');

/**
 * Get the property length for a given direction.
 */
export function lengthFromDirection(box: inf.Box, dir: inf.Direction): inf.Length {
	if (dir === inf.Direction.HORIZONTAL)
		return box.w || inf.defaultLength;
	else if (dir === inf.Direction.VERTICAL)
		return box.h || inf.defaultLength;
	throw 'Direction must be horizontal or vertical';
}

/**
 * Get a pair of beginning and end absolute positions of a box in a given
 * direction.
 */
export function absoluteFromDirection(box: inf.Box, dir: inf.Direction): inf.Length[] {
	if (!box.absolute)
		return null;

	if (dir === inf.Direction.HORIZONTAL)
		return [box.absolute.l, box.absolute.r];
	else if (dir === inf.Direction.VERTICAL)
		return [box.absolute.t, box.absolute.b];

	throw 'Direction must be horizontal or vertical';
}

/**
 * Get a computed child length relative to a computed parent length. The length
 * must be a fixed length, e.g. pixels or percent.
 */
export function compFixed(parentComp: number, childLength: inf.Length): number {
	if (childLength.unit === inf.LengthUnit.PIXELS)
		return childLength.value;
	else if (childLength.unit === inf.LengthUnit.PERCENT)
		return parentComp * childLength.value;

	throw 'Child length must be pixels or percent';
}

/**
 * If the box participates in layout.
 */
function inLayoutLoop(box: inf.Box): boolean {
	return box.absolute == null;
}

/**
 * A box with a length of shrink is skipped in computed length calculations. It
 * is non-effective when calculating lengths. If a box has a child that shrinks,
 * that child's children are effectively used as children of their grandparent
 * for length calculations. Direct non-shrink children and those descendants are
 * effective children.
 *
 * Given a box, this function returns its effective children. The order
 * depth-first based, so that children of a shrink box are between that box's
 * siblings.
 */
export function effectiveChildren(parent: inf.Box, dir: inf.Direction,
								  unit?: inf.LengthUnit): inf.Box[] {
	if (unit === inf.LengthUnit.SHRINK)
		throw 'Shrink cannot be used to filter effective children';

	var units = unit != null ? [unit] : [
		inf.LengthUnit.PIXELS,
		inf.LengthUnit.PERCENT,
		inf.LengthUnit.PARTS,
		inf.LengthUnit.EXPAND,
	];

	/* Copy the children to be examined */
	var queue: inf.Box[] = (parent.children || <inf.Box[]>[]).slice(0);
	var eff: inf.Box[] = [];

	while (queue.length > 0) {
		var box = queue.shift();
		var unit = lengthFromDirection(box, dir).unit;

		if (units.indexOf(unit) !== -1 && inLayoutLoop(box))
			eff.push(box);
		else if (unit === inf.LengthUnit.SHRINK)
			/* unshift for depth first */
			queue.unshift.apply(queue, box.children || []);

	}

	return eff;
}

/**
 * Get the sum of all parts of effective children.
 */
export function getParts(box: inf.Box, dir: inf.Direction): number {
	var parts = 0;

	effectiveChildren(box, dir, inf.LengthUnit.PARTS).forEach((child) => {
		var length = lengthFromDirection(child, dir);
		parts += length.value;
	});

	return parts;
}


export class Layout {

	/* Global layout size in pixels */
	private w: number;
	private h: number;

	root: inf.Box;

	constructor(root: inf.Box, w: number = null, h: number = null) {
		this.root = root;

		/* Inherit the root dimensions for the layout */

		this.w = w;
		if (w == null) {
			if (root.w.unit !== inf.LengthUnit.PIXELS)
				throw 'Layout width not defined';
			this.w = root.w.value;
		}

		this.h = h;
		if (h == null) {
			if (root.h.unit !== inf.LengthUnit.PIXELS)
				throw 'Layout height not defined';
			this.h = root.h.value;
		}
	}

	private getLayoutLength(dir: inf.Direction): number {
		if (dir === inf.Direction.HORIZONTAL)
			return this.w;
		if (dir === inf.Direction.VERTICAL)
			return this.h;
	}

	/** Computed properties. All in pixels. */

	/**
	 * For a given direction, get the sum of lengths of children that are fixed.
	 */
	private compFixedChildren(box: inf.Box, dir: inf.Direction): number {
		var fixedSum = 0;

		effectiveChildren(box, dir, inf.LengthUnit.PIXELS).forEach((child) => {
			fixedSum += this.compLength(child, dir);
		});

		effectiveChildren(box, dir, inf.LengthUnit.PERCENT).forEach((child) => {
			fixedSum += this.compLength(child, dir);
		});

		return fixedSum;
	}

	/**
	 * Width and height.
	 */
	compW(box: inf.Box): number {
		return this.compLength(box, inf.Direction.HORIZONTAL);
	}

	compH(box: inf.Box): number {
		return this.compLength(box, inf.Direction.VERTICAL);
	}

	/**
	 * Calculate the computed length for a given direction.
	 */
	compLength(box: inf.Box, dir: inf.Direction): number {
		var length = lengthFromDirection(box, dir);

		/* Pixels are always fixed */
		if (length.unit === inf.LengthUnit.PIXELS)
			return length.value;

		/* Find the first non-shrink parent */
		var parent = box.parent;
		while (parent &&
			   util.lengthEquals(lengthFromDirection(parent, dir), inf.shrink))
			parent = parent.parent;

		var parentComp: number;
		if (parent)
			parentComp = this.compLength(parent, dir);
		else
			parentComp = this.getLayoutLength(dir);

		parent = parent || this.root;

		/* Percentages only require the parent computed length */
		if (length.unit === inf.LengthUnit.PERCENT)
			return parentComp * length.value;

		/* If we are computing the cross direction length, don't use children */
		var parentDir = parent.direction || inf.noDirection;
		var useOtherChildren = (
			parentDir === inf.Direction.NONE ||
			parentDir === dir
		);

		var free: number;
		var parts: number;
		if (useOtherChildren) {
			/* Parts require existing fixed siblings to be computed */
			var fixedChildren = this.compFixedChildren(parent, dir);
			free = Math.max(parentComp - fixedChildren, 0);

			parts = getParts(parent, dir);

		} else {
			free = parentComp;
		}

		if (length.unit === inf.LengthUnit.PARTS) {
			if (useOtherChildren)
				return parts ? (free * length.value / parts) : 0;
			else
				return free;
		}

		var abs = absoluteFromDirection(box, dir);
		if (abs && abs[0] && abs[1]) {
			var near = compFixed(parentComp, abs[0]);
			var far = compFixed(parentComp, abs[1]);
			/* Prevent overlap */
			return Math.max(parentComp - far - near, 0);
		}

		if (length.unit === inf.LengthUnit.EXPAND) {
			/* Parts have priority over expand. If there are any parts, no room
			 * is left for expand. */
			if (useOtherChildren) {
				if (parts > 0)
					return 0;

				var expands = effectiveChildren(parent, dir,
												inf.LengthUnit.EXPAND).length;
				return free / expands;

			} else {
				return free;
			}
		}

		if (length.unit === inf.LengthUnit.SHRINK) {
			var sum = 0;
			if (useOtherChildren)
				effectiveChildren(box, dir).forEach((child) => {
					sum += this.compLength(child, dir);
				});
			return sum;
		}
	}

	/**
	 * X and Y are relative to parent.
	 */
	compX(box: inf.Box): number {
		return this.compPosition(box, inf.Direction.HORIZONTAL);
	}

	compY(box: inf.Box): number {
		return this.compPosition(box, inf.Direction.VERTICAL);
	}

	compPosition(box: inf.Box, dir: inf.Direction): number {
		var parent = box.parent;
		if (!parent)
			return 0;

		var parentComp = this.compLength(parent, dir);
		var boxComp = this.compLength(box, dir);

		var abs = absoluteFromDirection(box, dir);
		if (abs) {
			if (abs[0])
				return compFixed(parentComp, abs[0]);
			else if (abs[1])
				return parentComp - compFixed(parentComp, abs[1]) - boxComp;
			else
				throw 'Absolute must specify at least one of near or far';
		}

		var parentDir = parent.direction || inf.noDirection;

		/* All children are layered on top of each other */
		if (parentDir === inf.Direction.NONE)
			return 0;

		var childrenComps: number[] = [];
		var childIndex: number;
		var alignment: inf.Alignment;

		if (parentDir === dir) {
			alignment = parent.alignment;

			/* No need for effective children; shrink is first-class citizen */
			var siblings =
				(parent.children || <inf.Box[]>[]).filter(inLayoutLoop);
			childrenComps = siblings.map((child, i) => {
				if (child === box)
					childIndex = i;
				return this.compLength(child, dir);
			});

		} else {
			/* Perpendicular to our direction */
			alignment = parent.crossAlignment;

			/* Treat this as if we only have ourself in the direction */
			childrenComps = [boxComp];
			childIndex = 0;
		}
		alignment = alignment || inf.defaultAlignment;

		if (alignment === inf.Alignment.NEAR) {
			var sum = 0;
			childrenComps.slice(0, childIndex).forEach((childComp) => {
				sum += childComp;
			});
			return sum;

		} else if (alignment === inf.Alignment.FAR) {
			var sum = 0;
			childrenComps.slice(childIndex).forEach((childComp) => {
				sum += childComp;
			});
			return parentComp - sum;

		} else if (alignment === inf.Alignment.CENTER) {
			var sum = 0;
			var sumBeforeChild = 0;
			childrenComps.forEach((childComp, i) => {
				sum += childComp;
				if (i < childIndex)
					sumBeforeChild += childComp;
			});
			return (parentComp - sum) / 2 + sumBeforeChild;
		}
	}

	/**
	 * These are relative to the root box.
	 */
	compXAbs(box: inf.Box): number {
		return this.compPositionAbs(box, inf.Direction.HORIZONTAL);
	}
	compYAbs(box: inf.Box): number {
		return this.compPositionAbs(box, inf.Direction.VERTICAL);
	}

	compPositionAbs(box: inf.Box, dir: inf.Direction): number {
		var pos: number;
		for (pos = 0; box != null; box = box.parent)
			pos += this.compPosition(box, dir);
		return pos;
	}

	/** Utilities */

	/**
	 * @return A bounding rect that fits around the input box.
	 */
	getRect(box: inf.Box): inf.Rect {
		return {
			x: this.compX(box),
			y: this.compY(box),
			w: this.compW(box),
			h: this.compH(box),
		};
	}

	/**
	 * @return A bounding rect that fits around the input box's absolute pos.
	 */
	getRectAbs(box: inf.Box): inf.Rect {
		return {
			x: this.compXAbs(box),
			y: this.compYAbs(box),
			w: this.compW(box),
			h: this.compH(box),
		};
	}

	/**
	 * @return A bounding rect that fits around the input boxes.
	 */
	getBoundingRect(boxes: inf.Box[]): inf.Rect {
		return util.getBoundingRect(boxes.map((box) => {
			return this.getRect(box);
		}));
	}
}

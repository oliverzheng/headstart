/**
 * Units of measurement for boxes and their children.
 */
export enum LengthUnit {
	/**
	 * Absolute # of pixels.
	 *
	 * Setting this never changes the length.
	 */
	PIXELS,

	/**
	 * Percentage of the parent's length.
	 *
	 * This unit depends on the parent's computed length. It does not change the
	 * parent's length (or other children's lengths if they depend on the
	 * parent).
	 */
	PERCENT,

	/**
	 * How many parts out of a parent's free space this takes.
	 *
	 * Besides pixel and percent based children, the free space left over is
	 * divided into parts - as many as the sum of all part based children.
	 *
	 * E.g. A child requesting 2 parts and a child requesting 3 parts from
	 * a parent that contains another child requesting 50% will each get 20% and
	 * 30%.
	 *
	 * This unit depends on the parent's computed length and does not change it.
	 */
	PARTS,

	/**
	 * Be as big as possible.
	 *
	 * If the parent has space left over after pixel, percent, and parts based
	 * children, the remaining space is left to expansive children. Each one has
	 * "1 part" in the remaining space to divvy up.
	 *
	 * This unit depends on the parent's computed length and does not change it.
	 */
	EXPAND,

	/**
	 * Be as small as possible. It must fit all children.
	 *
	 * The length is dependent on children lengths. When it contains lengths
	 * that depend on parent lengths, the parent of this length is used.
	 *
	 * E.g. In the hierarchy:
	 * - 100px
	 *   - shrink
	 *     - 50%
	 *
	 * The 50% is calculated on 100px.
	 */
	SHRINK,
}

export var pxUnit = LengthUnit.PIXELS;
export var pctUnit = LengthUnit.PERCENT;
export var expandUnit = LengthUnit.EXPAND;
export var shrinkUnit = LengthUnit.SHRINK;

export var lengthUnits = [
	LengthUnit.PIXELS,
	LengthUnit.PERCENT,
	LengthUnit.PARTS,
	LengthUnit.EXPAND,
	LengthUnit.SHRINK,
];

export var lengthUnitsWithValue = [
	LengthUnit.PIXELS,
	LengthUnit.PERCENT,
	LengthUnit.PARTS,
];

export var fixedLengthUnits = [
	LengthUnit.PIXELS,
	LengthUnit.PERCENT,
];


export interface Length {
	unit: LengthUnit;

	/** Value only if unit is one of PIXELS, PERCENT, or PARTS. */
	value?: number;

	// Modifiable at runtime.
	runtime?: boolean;
}

export var shrink: Length = {
	unit: LengthUnit.SHRINK
};

export var expand: Length = {
	unit: LengthUnit.EXPAND
};

export var defaultLength = shrink;

export function px(value: number): Length {
	return {
		unit: LengthUnit.PIXELS,
		value: value,
	};
}

export function pct(value: number): Length {
	return {
		unit: LengthUnit.PERCENT,
		value: value,
	};
}

export function prt(value: number): Length {
	return {
		unit: LengthUnit.PARTS,
		value: value,
	};
}


/** Direction of children to stack. */
export enum Direction {
	/** Children are positioned relative to parent's top left. */
	NONE,

	/** Stack children horizontally. */
	HORIZONTAL,

	/** Stack children vertically. */
	VERTICAL,
}

export var noDirection = Direction.NONE;
export var horiz = Direction.HORIZONTAL;
export var vert = Direction.VERTICAL;

export var directions = [horiz, vert];

export function otherDirection(dir: Direction): Direction {
	if (dir === horiz)
		return vert;
	if (dir === vert)
		return horiz;
	throw new Error('Invalid direction');
}


export enum OVERFLOW {
	/** Overflown children go to the next line. Only for alignment != center. */
	WRAP,

	/** Overflown children are visible. */
	SHOW,

	/** Overflown children are hidden. */
	HIDDEN,
}

export var wrap = OVERFLOW.WRAP;
export var show = OVERFLOW.SHOW;
export var hidden = OVERFLOW.HIDDEN;

export var overflows = [wrap, show, hidden];


/**
 * How children should be aligned for a given direction.
 *
 * This works by inserting one or more invisible children among the children and
 * setting its length to expand. Lengths of the real children, have priority
 * over these invisible children's; that is, these would only be effective if
 * there is free space left.
 */
export enum Alignment {
	NONE,

	/** Insert an invisible child at the end. */
	NEAR,

	/** Insert one invisible child at the beginning and one at the end. */
	CENTER,

	/** Insert one invisible child at the beginning. */
	FAR,
}

export var alignments = [
	Alignment.NEAR,
	Alignment.CENTER,
	Alignment.FAR,
];

export var near = Alignment.NEAR;
export var center = Alignment.CENTER;
export var far = Alignment.FAR;

export var defaultAlignment = Alignment.NONE;


export interface Position {
	x: number;
	y: number;
}

/**
 * Rectangle measured in absolute pixels.
 */
export interface Rect extends Position {
	w: number;
	h: number;
}


export interface StaticText {
	fontSize: number;
	lineHeight: number;
	fontFamily: string;

	// Input
	value?: string;
	inputMinLines?: number;
	inputMaxLines?: number;

	// Output
	outputMaxLines?: number;
}

export interface StaticFill {
	color?: string;
}

export interface StaticImage {
	url?: string;
	sourceDimension?: {
		w: number;
		h: number;
	};
	accessible: boolean; // i.e. must use <img> for screen readers, Google, etc.
}

export interface StaticContent {
	text?: StaticText;
	fill?: StaticFill;
	image?: StaticImage;
}


export interface Box {
	/** Must be unique among its tree. */
	id?: string;

	/** Human readable name */
	name?: string;

	parent?: Box;

	/** Bounding box of this collateral. */
	w?: Length;
	h?: Length;

	/**
	 * Absolute position from the parent. These are taken out of the layout
	 * loop.
	 *
	 * Only pixels and percent can be used, since children do not interact with
	 * each other.
	 */
	absolute?: {
		l?: Length;
		r?: Length;
		t?: Length;
		b?: Length;
	};

	/** Which way children stack. */
	direction?: Direction;

	/**
	 * Alignment in the direction of children.
	 *
	 * Near for horizontal is left; near for vertical is top.
	 */
	alignment?: Alignment;

	/**
	 * Alignment perpendicular to the direction of children.
	 *
	 * Near for horizontal is top; near for vertical is left.
	 */
	crossAlignment?: Alignment;

	/**
	 * Create an HTML DOM node for this box.
	 */
	createNode?: boolean;

	/**
	 * Used only if there is no children.
	 */
	staticContent?: StaticContent;

	children?: Box[];
}

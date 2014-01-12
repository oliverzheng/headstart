import assert = require('assert');
import c = require('./Component');

export enum Type {
	// Corresponds to a box in the visual spec
	BOX,

	// Generates a DOM node in HTML/CSS
	NODE,

	// Visually stacked children
	STACKED_CHILDREN,

	// Parent of the component (dynamically set)
	PARENT,

	// This component floats
	FLOAT,

	// Sizing of the component
	WIDTH,
	HEIGHT,

	// CSS margin
	MARGIN,

	// Align children to left, middle, or right
	HORIZONTAL_ALIGNMENT,

	// Align children to top, middle, bottom
	VERTICAL_ALIGNMENT,

	// Relative or absolute positioning
	POSITION,

	// Space inside this component
	//PADDING,

	// Don't modify this component anymore.
	SEALED,

	CSS,

	BLOCK_FORMAT,

	FLOAT_FORMAT,

	HORIZONTAL_CENTER,
}

export interface Repr {
	title: string;
	id?: string; // Not used in serialization or test fixture comparisons
	children?: Repr[];
	ordered?: boolean;
}

export function reprEqual(repr1: Repr, repr2: Repr): boolean {
	if (repr1.title !== repr2.title)
		return false;

	if (!!repr1.ordered !== !!repr2.ordered)
		return false;

	if (!!repr1.children !== !!repr2.children)
		return false;

	if (!repr1.children)
		return true;

	if (repr1.children.length !== repr2.children.length)
		return false;

	if (repr1.ordered) {
		return repr1.children.every((child, i) => reprEqual(child, repr2.children[i]));
	} else {
		var reprsEqualed = 0;
		var children2 = repr2.children.slice(0);
		for (var i = 0; i < repr1.children.length; ++i) {
			var child1 = repr1.children[i];
			var foundChild2 = false;
			for (var j = 0; j < children2.length; ++j) {
				var child2 = children2[j];
				if (reprEqual(child1, child2)) {
					children2.splice(j, 1);
					foundChild2 = true;
					break;
				}
			}
			if (!foundChild2)
				return false;
		}
		return true;
	}
}

export class BaseAttribute {
	component: c.Component;

	setComponent(component: c.Component) {
		assert(this.component == null);
		this.component = component;
	}

	getType(): Type {
		throw new Error(
			'Type not specified for ' + this.getName()
		);
	}

	getName(): string {
		return (<any>this).constructor.name;
	}

	includes(attribute: BaseAttribute): boolean {
		return this.equals(attribute);
	}

	equals(attribute: BaseAttribute): boolean {
		return false;
	}

	isSameAttrType(attribute: BaseAttribute): boolean {
		return (<any>this).constructor === (<any>attribute).constructor;
	}

	merge(attribute: BaseAttribute): BaseAttribute {
		return null;
	}

	repr(): Repr {
		// I miss python.
		return {
			title: this.getName(),
		};
	}

	managesChildren(): boolean {
		return !!this.getComponentChildren();
	}

	getComponentChildren(): c.Component[] {
		return;
	}
}

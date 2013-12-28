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

	// Space outside this component (not CSS margins, as they collapse)
	SPACING,

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
}

export interface Repr {
	title: string;
	children?: Repr[];
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

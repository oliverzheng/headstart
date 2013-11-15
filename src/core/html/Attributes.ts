export enum Type {
	// Corresponds to a box in the visual spec
	BOX,

	// Generates a DOM node in HTML/CSS
	NODE,

	// Children components of the component
	CHILDREN,

	// This component uses block formatting context for children
	BLOCK_FORMATTING,

	// This component uses inline formatting context for children
	INLINE_FORMATTING,

	// This component contains children that float
	FLOAT_FORMATTING,

	// This component floats
	FLOAT,

	// Sizing of the component
	SIZE,

	// Space outside this component (not CSS margins, as they collapse)
	SPACING,

	ALIGNMENT,

	// Relative or absolute positioning
	POSITION,

	// Space inside this component
	//PADDING,

	// Don't modify this component anymore.
	SEALED,

	CSS,
}

export interface Repr {
	title: string;
	children?: Repr[];
}

export class BaseAttribute {
	getType(): Type {
		throw new Error(
			'Type not specified for ' + this.getName()
		);
	}

	getName(): string {
		return (<any>this).constructor.name;
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
}

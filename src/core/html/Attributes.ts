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

	// Relative or absolute positioning
	POSITION,

	// Space inside this component
	//PADDING,
}

export class BaseAttribute {
	getType(): Type {
		throw new Error(
			'Type not specified for ' + (<any>this).constructor.name
		);
	}

	equals(attribute: BaseAttribute): boolean {
		return false;
	}

	isSameAttrType(attribute: BaseAttribute): boolean {
		return (<any>this).constructor === (<any>attribute).constructor;
	}
}

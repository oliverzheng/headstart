import assert = require('assert');
import c = require('./Component');

import LengthAttribute = require('./attributes/LengthAttribute');
import Rules = require('./Rules');

export enum Type {
	// Corresponds to a box in the visual spec
	BOX,

	// Generates a DOM node in HTML/CSS
	NODE,

	// Does not generate a DOM node
	SPACING,

	// Visually stacked children
	STACKED_CHILDREN,

	// Parent of the component (dynamically set)
	PARENT,

	// This component floats
	FLOAT,

	// Sizing of the component
	WIDTH,
	HEIGHT,

	BOX_MODEL,

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

	INLINE_FORMAT,

	FLOAT_FORMAT,

	HORIZONTAL_CENTER,

	TEXT_CONTENT,

	LINE_HEIGHT,

	BACKGROUND,

	TAG_NAME,

	RENDERING_VALUES,
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

// Relative to parent's top left
export interface ChildPosition {
	x: LengthAttribute;
	y: LengthAttribute;
}

export class BaseAttribute {
	rules: { ruleName: string; ruleComponentID: number; }[] = [];
	component: c.Component;

	setComponent(component: c.Component) {
		assert(this.component == null);
		assert(this.canSetComponent(component));
		this.component = component;
	}

	canSetComponent(component: c.Component) {
		return true;
	}

	addRule(ruleName: string, ruleComponentID: number) {
		this.rules.push({
			ruleName: ruleName,
			ruleComponentID: ruleComponentID,
		});
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

	rulesToString(): string {
		return 'Rules: ' + this.rules.map((rule) => (rule.ruleName + '#' + rule.ruleComponentID)).join(', ');
	}

	repr(): Repr {
		// I miss python.
		return {
			title: this.getName(),
			children: [{
				title: this.rulesToString(),
			}],
		};
	}

	managesChildren(): boolean {
		return false;
	}

	getComponentChildren(): c.Component[] {
		return;
	}

	getChildPosition(child: c.Component, unknownDefaultPx: number): ChildPosition {
		throw new Error(this.getName() + ' does not implement this');
	}

	getDescendentPosition(descendent: c.Component): ChildPosition {
		assert(descendent.isDescendentOf(this.component));
		var descendentPosition: ChildPosition;
		while (descendent !== this.component) {
			var position = descendent.getParent().getChildrenManager().getChildPosition(descendent, null);
			if (!descendentPosition) {
				descendentPosition = position;
			} else {
				if (descendentPosition.x)
					descendentPosition.x = descendentPosition.x.add(position.x);
				if (descendentPosition.y)
					descendentPosition.y = descendentPosition.y.add(position.y);
			}

			if (!descendentPosition.x && !descendentPosition.y)
				break;

			descendent = descendent.getParent();
		}
		return descendentPosition;
	}

	wrapChild(child: c.Component): Rules.RuleResult[] {
		throw new Error(this.getName() + ' did not implement this');
	}
}

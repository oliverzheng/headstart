import Attributes = require('../Attributes');
import Markup = require('./Markup');
import c = require('../Component');
import Rules = require('../Rules');
import StackedChildren = require('../attributes/StackedChildren');
import getDirection = require('../patterns/getDirection');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class BlockFormat extends Markup {
	getType() {
		return Attributes.Type.MARKUP_BLOCK_FORMAT;
	}

	getCSS() {
		return [{
			component: this.component,
			css: {
				display: 'block',
			}
		}];
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.MARKUP_BLOCK_FORMAT);
	}

	static verticalRule(component: c.Component): Rules.RuleResult[] {
		if (getDirection(component) === sinf.vert &&
			!StackedChildren.getFrom(component).isEmpty()) {
			return [{
				component: component,
				attributes: [
					new BlockFormat(),
				],
			}];
		}
	}

	static foldRule(component: c.Component): Rules.RuleResult[] {
		var children = StackedChildren.getFrom(component);
		if (children.isEmpty()) {
			return;
		}

		var direction = getDirection(component);
		if (direction !== sinf.vert) {
			return;
		}

		if (!BlockFormat.from(component)) {
			return;
		}

		var width = LengthAttribute.getFrom(component, sinf.horiz);

		var newChildren: c.Component[] = [];
		children.get().forEach((child) => {
			do {
				if (!BlockFormat.from(child) ||
					child.nodeAttr()) {
					break;
				}

				// Only fold if the child's width is equal to the parent's
				if (!width.looksEqual(LengthAttribute.getFrom(child, sinf.horiz))) {
					break;
				}

				var grandChildren = StackedChildren.getFrom(child);
				if (grandChildren.isEmpty()) {
					break;
				}
				var height = LengthAttribute.getFrom(child, sinf.vert);
				var childrenHeightsSum = LengthAttribute.sum(
					grandChildren.get().map(
						(grandChild) => LengthAttribute.getFrom(grandChild, sinf.vert)
					)
				);

				if (!height.looksEqual(childrenHeightsSum)) {
					break;
				}

				newChildren.push.apply(newChildren, grandChildren.get());
				return;

			} while (false);

			newChildren.push(child);
		});

		return [{
			component: component,
			replaceAttributes: [
				new StackedChildren(newChildren),
			],
		}];
	}
}

export = BlockFormat;

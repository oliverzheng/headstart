import Attributes = require('../Attributes');
import Markup = require('./Markup');
import c = require('../Component');
import Rules = require('../Rules');
import Children = require('../attributes/Children');
import getDirection = require('../patterns/getDirection');
import LengthAttribute = require('../attributes/LengthAttribute');
import sinf = require('../../spec/interfaces');

class BlockFormat extends Markup {
	getType() {
		return Attributes.Type.MARKUP_BLOCK_FORMAT;
	}

	getCSS() {
		return {
			display: 'block',
		};
	}

	static from(component: c.Component): boolean {
		return Markup.from(component, Attributes.Type.MARKUP_BLOCK_FORMAT);
	}

	static verticalRule(component: c.Component): Rules.RuleResult[] {
		if (getDirection(component) === sinf.vert &&
			!Children.getLayoutFrom(component).isEmpty()) {
			return [{
				component: component,
				attributes: [
					new BlockFormat(),
				],
			}];
		}
	}

	static foldRule(component: c.Component): Rules.RuleResult[] {
		var children = Children.getLayoutFrom(component);
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
		children.getComponents().forEach((child) => {
			do {
				if (!BlockFormat.from(child) ||
					child.nodeAttr()) {
					break;
				}

				// Only fold if the child's width is equal to the parent's
				if (!width.looksEqual(LengthAttribute.getFrom(child, sinf.horiz))) {
					break;
				}

				var grandChildren = Children.getLayoutFrom(child);
				if (grandChildren.isEmpty()) {
					break;
				}
				var height = LengthAttribute.getFrom(child, sinf.vert);
				var childrenHeightsSum = LengthAttribute.sum(
					grandChildren.getComponents().map(
						(grandChild) => LengthAttribute.getFrom(grandChild, sinf.vert)
					)
				);

				if (!height.looksEqual(childrenHeightsSum)) {
					break;
				}

				newChildren.push.apply(newChildren, grandChildren.getComponents());
				return;

			} while (false);

			newChildren.push(child);
		});

		return [{
			component: component,
			replaceAttributes: [
				new Children(newChildren),
			],
		}];
	}
}

export = BlockFormat;

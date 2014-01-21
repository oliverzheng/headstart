import assert = require('assert');
import c = require('./Component');
import Context = require('./Context');
import sinf = require('../spec/interfaces');
import sutil = require('../spec/util');
import RuleRunner = require('./RuleRunner');
import StackedChildren = require('./attributes/StackedChildren');
import getDirection = require('./patterns/getDirection');
import LengthAttribute = require('./attributes/LengthAttribute');

var UNKNOWN_SIZE = 50; // px

class Preview {
	private rootBox: sinf.Box;
	private rootComponent: c.Component;

	constructor(box: sinf.Box) {
		this.rootBox = box;
		this.update();
	}

	update() {
		this.rootComponent = c.Component.fromBox(this.rootBox);
		RuleRunner.runOn(this.rootComponent, Context.defaultContext, [], RuleRunner.renderingRuleGroups);
	}

	private getComponentForBox(box: sinf.Box): c.Component {
		if (this.rootComponent.boxAttr().getBox() === box) {
			return this.rootComponent;
		}

		assert(box.parent);
		var parentComponent = this.getComponentForBox(box.parent);
		assert(parentComponent);
		var children = parentComponent.getChildren().filter(
			(child) => child.boxAttr().getBox() === box
		);
		assert(children.length === 1);
		return children[0];
	}

	getBounds(box: sinf.Box): {x: number; y: number; w: number; h: number;} {
		var component = this.getComponentForBox(box);
		var bounds = { x: 0, y: 0, w: 0, h: 0 };
		if (component !== this.rootComponent) {
			var position = this.getPosition(component);
			bounds.x = position.x;
			bounds.y = position.y;
		}

		var width = LengthAttribute.getFrom(component, sinf.horiz);
		var height = LengthAttribute.getFrom(component, sinf.vert);
		var widthPx = (width && width.px.isSet()) ? width.px.value : UNKNOWN_SIZE;
		var heightPx = (height && height.px.isSet()) ? height.px.value : UNKNOWN_SIZE;
		bounds.w = widthPx;
		bounds.h = heightPx;
		return bounds;
	}

	private getPosition(child: c.Component): {x: number; y: number;} {
		if (child === this.rootComponent) {
			return {x: 0, y: 0};
		}

		var parent = child.getParent();
		var stackedChildren = StackedChildren.getFrom(parent);

		var direction = getDirection(parent);
		var position = {x: 0, y: 0};
		for (var i = 0; i < stackedChildren.get().length; ++i) {
			var prevChild = stackedChildren.get()[i];
			if (prevChild === child) {
				break;
			}

			var length = LengthAttribute.getFrom(prevChild, direction);
			var px = (length && length.px.isSet()) ? length.px.value : UNKNOWN_SIZE;
			if (direction === sinf.horiz) {
				position.x += px;
			} else {
				position.y += px;
			}
		}
		return position;
	}
}

export = Preview;

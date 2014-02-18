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
		RuleRunner.runOn(this.rootComponent, Context.defaultContext, [], RuleRunner.renderingBuckets);
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
			var position = component.getParent().getChildrenManager().getChildPosition(component, UNKNOWN_SIZE);
			assert(position.x.px.isSet());
			assert(position.y.px.isSet());
			bounds.x = position.x.px.value;
			bounds.y = position.y.px.value;
		}

		var width = LengthAttribute.getFrom(component, sinf.horiz);
		var height = LengthAttribute.getFrom(component, sinf.vert);
		var widthPx = (width && width.px.isSet()) ? width.px.value : UNKNOWN_SIZE;
		var heightPx = (height && height.px.isSet()) ? height.px.value : UNKNOWN_SIZE;
		bounds.w = widthPx;
		bounds.h = heightPx;
		return bounds;
	}
}

export = Preview;

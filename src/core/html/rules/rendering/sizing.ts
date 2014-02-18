import Rules = require('../../Rules');
import c = require('../../Component');
import sinf = require('../../../spec/interfaces');
import CSSAttribute = require('../../attributes/CSSAttribute');
import BlockFormat = require('../../attributes/BlockFormat');

function sizeRuntimeInitial(component: c.Component): Rules.RuleResult[] {
	var styles: {[name: string]: string;} = {};

	var boxAttr = component.boxAttr();
	if (!boxAttr)
		return;
	var box = boxAttr.getBox();

	if (box.w && box.w.runtime && box.w.unit === sinf.pxUnit) {
		styles['width'] = box.w.value + 'px';
	}
	if (box.h && box.h.runtime && box.h.unit === sinf.pxUnit) {
		styles['height'] = box.h.value + 'px';
	}

	if (Object.keys(styles).length > 0) {
		return [{
			component: component,
			attributes: [
				new CSSAttribute(styles),
				new BlockFormat(),
			],
		}];
	}
}

var rules: Rules.RuleWithName[] = [
	{name: 'sizeRuntimeInitial', rule: sizeRuntimeInitial},
];

export = rules;

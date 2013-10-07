import inf = require('../interfaces');
import sinf = require('../../spec/interfaces');
import l = require('../../spec/layout');
import d = require('../dom');

export function DynamicBox(layout: l.Layout, dom: d.Dom, box: sinf.Box): inf.RuleResult {
	if (box.content !== sinf.Content.DYNAMIC_BOX ||
		box.w.unit !== sinf.LengthUnit.PIXELS ||
		box.h.unit !== sinf.LengthUnit.PIXELS)
		return;

	return {
		isNode: true,
		boxStyles: [{
			box: box,
			style: {
				name: 'width',
				value: layout.compW(box) + 'px',
				becauseOf: [box],
			}
		}, {
			box: box,
			style: {
				name: 'height',
				value: layout.compH(box) + 'px',
				becauseOf: [box],
			}
		}]
	};
}

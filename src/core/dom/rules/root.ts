import inf = require('../interfaces');
import sinf = require('../../spec/interfaces');
import l = require('../../spec/layout');
import d = require('../dom');

export function RootBox(layout: l.Layout, dom: d.Dom, box: sinf.Box): inf.RuleResult {
	if (box === layout.root) {
		return {
			isNode: true,
		};
	}
}

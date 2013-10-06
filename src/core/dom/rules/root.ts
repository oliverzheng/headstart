import inf = require('../interfaces');
import sinf = require('../../spec/interfaces');
import l = require('../../spec/layout');

export function RootBox(layout: l.Layout, box: sinf.Box): inf.RuleResult {
	if (box === layout.root) {
		return {
			isNode: true,
		};
	}
}

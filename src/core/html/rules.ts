import inf = require('./interfaces');
import vinf = require('../visual/interfaces');
import l = require('../visual/layout');

export var RootRule: inf.Rule = {
	applies(layout: l.Layout, box: vinf.Box) {
		return (box === layout.root);
	},

	getNode(layout: l.Layout, box: vinf.Box) {
		return {
			tag: 'div',
		};
	},
};

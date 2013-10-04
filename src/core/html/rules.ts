import inf = require('./interfaces');
import vinf = require('../visual/interfaces');
import l = require('../visual/layout');

export class RootRule extends inf.Rule {
	applies(box: vinf.Box) {
		return (box === this.layout.root);
	}

	getNode(box: vinf.Box) {
		return {
			tag: 'div',
		};
	}
};

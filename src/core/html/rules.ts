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
			becauseOf: box,
		};
	}
};

export class FixedUserManagedBoxRule extends inf.Rule {
	applies(box: vinf.Box) {
		return (
			box.userManagement === vinf.UserManagement.BOX &&
			box.w.unit === vinf.LengthUnit.PIXELS &&
			box.h.unit === vinf.LengthUnit.PIXELS
		);
	}

	getNode(box: vinf.Box) {
		return {
			tag: 'div',
			becauseOf: box,
			styles: [{
				name: 'width',
				value: this.layout.compW(box) + 'px',
				becauseOf: box,
			}, {
				name: 'height',
				value: this.layout.compH(box) + 'px',
				becauseOf: box,
			}],
		};
	}
}

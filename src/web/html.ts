/// <reference path='../../d.ts/typings.d.ts' />
import assert = require('assert');

import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import runner = require('../core/dom/runner');

var HTMLComponent = React.createClass({
	render() {
		var layout = <l.Layout>this.props.layout;
		var r = new runner.Runner(layout);
		r.run();
		var boxesNotUsed = r.getBoxesNotUsed();
		if (boxesNotUsed.length !== 0) {
			return React.DOM.div(null,
				'Cannot generate HTML for boxes: ' +
					boxesNotUsed.map((box) => '#' + box.id).join(', ')
			);
		} else {
			var html = r.getDom().toHtml(r.getRootNode());
			return React.DOM.div(null,
				React.DOM.strong(null, 'HTML: '),
				html
			);
		}
	}
});
export = HTMLComponent;

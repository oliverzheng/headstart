/// <reference path='../../d.ts/typings.d.ts' />
import assert = require('assert');

import inf = require('../core/visual/interfaces');
import l = require('../core/visual/layout');
import runner = require('../core/html/runner');

var HTMLComponent = React.createClass({
	render() {
		var layout = <l.Layout>this.props.layout;
		var r = new runner.Runner(layout);
		var nodes = r.toNodes();
		assert(nodes.length === 1);
		var boxesNotUsed = runner.boxesNotUsed(nodes[0], layout);
		if (boxesNotUsed.length !== 0) {
			return React.DOM.div(null,
				'Cannot generate HTML for boxes: ' +
					boxesNotUsed.map((box) => '#' + box.id).join(', ')
			);
		} else {
			var html = runner.nodesToHtml(nodes);
			return React.DOM.div(null,
				React.DOM.strong(null, 'HTML: '),
				html
			);
		}
	}
});
export = HTMLComponent;

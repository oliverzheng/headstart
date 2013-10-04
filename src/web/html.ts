/// <reference path='../../d.ts/typings.d.ts' />
import assert = require('assert');

import inf = require('../core/visual/interfaces');
import l = require('../core/visual/layout');
import runner = require('../core/html/runner');

var HTMLComponent = React.createClass({
	render() {
		var layout = <l.Layout>this.props.layout;
		try {
			var r = new runner.Runner(layout);
			var nodes = r.toNodes();
			var html = runner.nodesToHtml(nodes);
			return React.DOM.div(null,
				React.DOM.strong(null, 'HTML: '),
				html
			);
		} catch (ex) {
			return React.DOM.div(null,
				'Cannot generate HTML for box id: ' + ex.box.id
			);
		}
	}
});
export = HTMLComponent;

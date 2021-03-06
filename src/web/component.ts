import assert = require('assert');

import inf = require('../core/spec/interfaces');
import Attributes = require('../core/html/Attributes');
import c = require('../core/html/Component');
import HTML = require('../core/html/HTML');
import RuleRunner = require('../core/html/RuleRunner');
import Context = require('../core/html/Context');
import p = require('../core/html/patterns');

export var RootComponent = React.createClass({
	getInitialState() {
		return {
			logs: <any>[],
		};
	},

	runRules() {
		var component = this.props.component;

		var logs: string[] = [];

		RuleRunner.runOn(component, Context.ie6AndAbove, logs);

		this.props.onRulesRun();

		this.setState({logs: logs});
	},

	debug() {
		var root = this.props.component.getRoot();
		var componentID = parseInt(this.refs.debugComponentID.getDOMNode().value, 10);
		assert(!isNaN(componentID));
		root.iterateChildrenBreadthFirst((descendent: c.Component) => {
			var matches = new p.PatternMatches();
			if (descendent.id === componentID)
				debugger;
		});
	},

	render() {
		return (
			React.DOM.div({ className: 'components' },
				React.DOM.button({
					onClick: this.runRules,
				}, 'Run rules'),
				React.DOM.input({
					ref: 'debugComponentID',
					placeholder: 'Component ID',
				}),
				React.DOM.button({
					onClick: this.debug,
				}, 'Debugger'),
				React.DOM.ul(null,
					React.DOM.li(null,
						ComponentComponent({
							component: this.props.component
						})
					)
				),
				React.DOM.strong(null, 'HTML:'),
				React.DOM.pre(null,
					HTML.DOMNode.fromComponent(this.props.component).map((node) => node.toString())
				),
				React.DOM.pre(null,
					this.state.logs.join('\n'))
			)
		);
	},
});

export function serializeRepr(repr: Attributes.Repr) {
	if (!repr) {
		return;
	}
	var children: Attributes.Repr[] = repr.children || [];
	var list = repr.ordered ? React.DOM.ol : React.DOM.ul;
	var title = repr.title;
	if (repr.id != null)
		title += ' (id #' + repr.id + ')';

	return React.DOM.div(null,
		React.DOM.div(null, title),
		list(null,
			children.map(
				(child) => React.DOM.li({key: child.id}, serializeRepr(child))
			)
		)
	);
}

export var ComponentComponent = React.createClass({
	render() {
		var component = <c.Component>this.props.component;
		return this.transferPropsTo(
			React.DOM.div(null,
				serializeRepr(component.repr())
			)
		);
	},
});

import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import Attributes = require('../core/html/Attributes');
import c = require('../core/html/Component');
import HTML = require('../core/html/HTML');
import RuleRunner = require('../core/html/RuleRunner');
import Context = require('../core/html/Context');

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

		this.setState({logs: logs});
	},

	render() {
		return (
			React.DOM.div({ className: 'components' },
				React.DOM.button({
					onClick: this.runRules,
				}, 'Run rules'),
				React.DOM.ul(null,
					React.DOM.li(null,
						ComponentComponent({
							component: this.props.component
						})
					)
				),
				React.DOM.strong(null, 'HTML:'),
				React.DOM.pre(null,
					HTML.DOMNode.fromComponent(this.props.component).map((node) => DOMNodeComponent({depth: 0, node: node}))
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
				(child) => React.DOM.li(null, serializeRepr(child))
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

export var DOMNodeComponent = React.createClass({
	render() {
		var node = <HTML.DOMNode>this.props.node;
		var depth = <number>this.props.depth;
		var spaces = Array(depth + 1).join('  ');

		var openTag = '<' + node.tagName;
		var css = node.reprCss();
		if (css) {
			openTag += ' styles="' + css + '"';
		}
		openTag += '>';
		return React.DOM.div(null,
			React.DOM.span(null, spaces + openTag),
			React.DOM.div(null, node.children.map(
				(child) => DOMNodeComponent({node: child, depth: depth+1})
			)),
			React.DOM.span(null, spaces + '</' + node.tagName + '>')
		);
	},
});

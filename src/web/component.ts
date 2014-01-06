import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import Attributes = require('../core/html/Attributes');
import c = require('../core/html/Component');
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
				ComponentComponent({
					component: this.props.component
				}),
				React.DOM.pre(null,
				this.state.logs.join('\n'))
			)
		);
	},
});

export var ComponentComponent = React.createClass({
	render() {
		var component = <c.Component>this.props.component;
		return this.transferPropsTo(
			React.DOM.div(null,
				this.serializeRepr(component.repr())
			)
		);
	},

	serializeRepr(repr: Attributes.Repr) {
		if (!repr) {
			return;
		}
		var children: Attributes.Repr[] = repr.children || [];
		return React.DOM.ul(null,
			React.DOM.li(null, repr.title),
			children.map(this.serializeRepr)
		);
	}
});

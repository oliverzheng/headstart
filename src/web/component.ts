import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import Attributes = require('../core/html/Attributes');
import c = require('../core/html/Component');
import ChildrenAttribute = require('../core/html/attributes/ChildrenAttribute');
import RuleRunner = require('../core/html/RuleRunner');
import Context = require('../core/html/Context');

export var RootComponent = React.createClass({
	getInitialState() {
		return {
			ruleRunner: new RuleRunner.DefaultRuleRunner(Context.ie6AndAbove),
		};
	},

	runRules() {
		var component = this.props.component;

		this.state.ruleRunner.start(component);

		this.forceUpdate();
	},

	render() {
		return (
			React.DOM.div({ className: 'components' },
				React.DOM.button({
					onClick: this.runRules,
				}, 'Run rules'),
				ComponentComponent({
					component: this.props.component
				})
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
		var children: Attributes.Repr[] = repr.children || [];
		return React.DOM.ul(null,
			React.DOM.li(null, repr.title),
			children.map(this.serializeRepr)
		);
	}
});

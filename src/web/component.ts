import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import Attributes = require('../core/html/Attributes');
import Component = require('../core/html/Component');
import ChildrenAttribute = require('../core/html/attributes/ChildrenAttribute');
import RuleRunner = require('../core/html/RuleRunner');

export var RootComponent = React.createClass({
	getInitialState() {
		return {
			ruleRunner: new RuleRunner.DefaultRuleRunner(),
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
		var component = <Component>this.props.component;
		return this.transferPropsTo(
			React.DOM.div(null,
				React.DOM.div(null, 'Component'),
				React.DOM.ul(null,
					component.attributes.map((attr) => {
						return React.DOM.li(null,
							React.DOM.div(null, attr.getName()),
							this.serializeAttribute(attr)
						);
					})
				)
			)
		);
	},

	serializeAttribute(attribute: Attributes.BaseAttribute) {
		if (attribute.getType() !== Attributes.Type.CHILDREN) {
			var props: { propName: string; propValue: string; }[] = [];
			for (var propName in attribute) {
				if (attribute.hasOwnProperty(propName)) {
					props.push({
						propName: propName,
						propValue: attribute[propName],
					});
				}
			}
			return React.DOM.ul(null,
				props.map((prop) => {
					return React.DOM.li(null, prop.propName + ': ' + prop.propValue);
				})
			);
		} else {
			var childrenAttr = <ChildrenAttribute>attribute;
			return React.DOM.ul(null,
				childrenAttr.getChildren().map((childComponent) => {
					return React.DOM.li(null,
						ComponentComponent({component: childComponent})
					);
				})
			);
		}
	}
});

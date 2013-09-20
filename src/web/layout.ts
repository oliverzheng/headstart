import inf = require('../core/interfaces');
import box = require('./box');

export var LayoutComponent = React.createClass({
	render() {
		return this.transferPropsTo(
			React.DOM.div(
				{className: 'layout'}, 
				box.BoxComponent({
					layout: this.props.layout,
					box: this.props.layout.root,
					selectedBox: this.props.selectedBox,
					onBoxClicked: this.props.onBoxClicked,
				})
			)
		);
	}
});

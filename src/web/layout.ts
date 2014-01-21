import inf = require('../core/spec/interfaces');
import box = require('./box');

export var LayoutComponent = React.createClass({
	render() {
		return this.transferPropsTo(
			React.DOM.div(
				{className: 'layout'}, 
				box.BoxComponent({
					preview: this.props.preview,
					box: this.props.rootBox,
					selectedBox: this.props.selectedBox,
					onBoxClicked: this.props.onBoxClicked,
				})
			)
		);
	}
});

import inf = require('../core/visual/interfaces');
import l = require('../core/visual/layout');

export var BoxComponent = React.createClass({
	onClick(event: any) {
		event.stopPropagation();
		this.props.onBoxClicked(this.props.box);
	},

	render() {
		var layout: l.Layout = this.props.layout;
		var box: inf.Box = this.props.box;
		var rect = layout.getRect(box);
		var children = (box.children || <inf.Box[]>[]).map((child) => {
			return this.transferPropsTo(
				BoxComponent({
					layout: layout,
					box: child,
					key: child.id,
				})
			);
		}, this);
		var className = 'box';
		if (this.props.selectedBox === box) {
			className += ' selected';
		}
		return this.transferPropsTo(
			React.DOM.div({
				style: {
					width: rect.w + 'px',
					height: rect.h + 'px',
					left: rect.x + 'px',
					top: rect.y + 'px',
				},
				className: className,
				onClick: this.onClick,
			}, React.DOM.div({className: 'boxChildren'}, children))
		);
	}
});

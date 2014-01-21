import inf = require('../core/spec/interfaces');
import Preview = require('../core/html/Preview');

export var BoxComponent = React.createClass({
	onClick(event: any) {
		event.stopPropagation();
		this.props.onBoxClicked(this.props.box);
	},

	render() {
		var preview: Preview = this.props.preview;
		var box: inf.Box = this.props.box;
		var rect = preview.getBounds(box);
		var children = (box.children || <inf.Box[]>[]).map((child) => {
			return this.transferPropsTo(
				BoxComponent({
					preview: preview,
					box: child,
					rootBox: this.props.rootBox,
					key: child.id,
				})
			);
		}, this);
		var className = 'box';
		if (this.props.selectedBox === box) {
			className += ' selected';
		}
		if (this.props.rootBox === box) {
			className += ' root';
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

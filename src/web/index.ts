import lc = require('./layout');
import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import detail = require('./detail');
import add = require('./add');

var PageComponent = React.createClass({
	getInitialState() {
		var root: inf.Box = add.createBox(600, 600);
		return {
			layout: new l.Layout(root),
			selectedBox: null,
		};
	},

	onBoxClicked(box: inf.Box) {
		this.setState({
			selectedBox: box
		});
	},

	onBoxChanged(box: inf.Box) {
		this.setState({
			layout: this.state.layout
		});
	},

	render() {
		return (
			React.DOM.div(null,
				lc.LayoutComponent({
					layout: this.state.layout,
					onBoxClicked: this.onBoxClicked,
					selectedBox: this.state.selectedBox,
				}),
				detail.DetailComponent({
					layout: this.state.layout,
					box: this.state.selectedBox,
					onBoxChanged: this.onBoxChanged,
					updateSelectedBox: this.onBoxClicked,
				})
			)
		);
	}
});

export function render(rootElem: HTMLBodyElement) {
	React.renderComponent(
		PageComponent(null),
		rootElem
	);
}

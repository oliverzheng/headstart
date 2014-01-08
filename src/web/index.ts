import lc = require('./layout');
import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import detail = require('./detail');
import add = require('./add');
import comp = require('./component');
import c = require('../core/html/Component');
import Attributes = require('../core/html/Attributes');
import fixtures = require('../test/fixtures');

var browserFixtures = require('browserFixtures');

var PageComponent = React.createClass({
	getInitialState() {
		var root: inf.Box = add.createBox(600, 600);
		return {
			layout: new l.Layout(root),
			selectedBox: null,
			rootComponent: c.Component.fromBox(root),

			fixtureDisabled: true,

			justLoaded: false,
			loadError: null,

			justSaved: false,
			wasSaveOverwrite: false,

			justCompared: false,
			comparison: false,
		};
	},

	onBoxClicked(box: inf.Box) {
		this.setState({
			selectedBox: box
		});
	},

	onBoxChanged(box: inf.Box) {
		this.setState({
			layout: this.state.layout,
			rootComponent: c.Component.fromBox(this.state.layout.root),
		});
	},

	loadFixture() {
		var name = this.refs.fixtureName.getDOMNode().value;
		fixtures.load(
			name,
			browserFixtures.readFixture,
			(root: inf.Box, componentRepr: Attributes.Repr) => {
				this.setState({
					layout: new l.Layout(root),
					rootComponent: c.Component.fromBox(root),
					selectedBox: null,
					justLoaded: true,
				});
				setTimeout(() => {
					this.setState({ justLoaded: false });
				}, 1000);
			},
			this.readError
		);
	},

	readError(error: any) {
		this.setState({
			loadError: '✘ ' + error.statusText,
			justLoaded: true,
		});
		setTimeout(() => {
			this.setState({
				loadError: null,
				justLoaded: false,
			});
		}, 1000);
	},

	saveFixture() {
		var name = this.refs.fixtureName.getDOMNode().value;
		fixtures.save(
			name,
			this.state.layout.root,
			this.state.rootComponent,
			browserFixtures.writeFixture,
			(data) => {
				this.setState({
					justSaved: true,
					wasSaveOverwrite: data.overwritten
				});
				setTimeout(() => {
					this.setState({ justSaved: false });
				}, 1000);
			},
			(error) => window.alert('Error saving: ' + error)
		);
	},

	compareFixture() {
		var name = this.refs.fixtureName.getDOMNode().value;
		fixtures.compare(
			name,
			this.state.rootComponent,
			browserFixtures.readFixture,
			(result) => {
				this.setState({
					justCompared: true,
					comparison: result,
				});
				setTimeout(() => {
					this.setState({ justCompared: false });
				}, 1000);
			},
			this.readError
		);
	},

	onFixtureNameChange() {
		var name = this.refs.fixtureName.getDOMNode().value;
		this.setState({fixtureDisabled: !name});
	},

	render() {
		return (
			React.DOM.div(null,
				lc.LayoutComponent({
					layout: this.state.layout,
					onBoxClicked: this.onBoxClicked,
					selectedBox: this.state.selectedBox,
				}),
				React.DOM.div({className: 'rightSide'},
					React.DOM.input({
						placeholder: 'Fixture Name',
						ref: 'fixtureName',
						onChange: this.onFixtureNameChange,
					}),
					React.DOM.button({
						onClick: this.loadFixture,
						disabled: this.state.fixtureDisabled || this.state.justLoaded,
					}, (this.state.justLoaded ? (this.state.loadError || '✔ Loaded') : 'Load Fixture')),
					React.DOM.button({
						onClick: this.saveFixture,
						disabled: this.state.fixtureDisabled || this.state.justSaved,
					}, (this.state.justSaved ? ('✔ ' + (this.state.wasSaveOverwrite ? 'Overwritten' : 'Saved')) : 'Save Fixture')),
					React.DOM.button({
						onClick: this.compareFixture,
						disabled: this.state.fixtureDisabled,
					}, (this.state.justCompared ? (this.state.comparison ? '✔ Equal' : '✘ Not Equal') : 'Compare Fixture')),
					detail.DetailComponent({
						layout: this.state.layout,
						box: this.state.selectedBox || this.state.layout.root,
						onBoxChanged: this.onBoxChanged,
						updateSelectedBox: this.onBoxClicked,
					}),
					React.DOM.hr(),
					comp.RootComponent({component: this.state.rootComponent})
				)
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

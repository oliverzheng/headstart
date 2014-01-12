import lc = require('./layout');
import inf = require('../core/spec/interfaces');
import l = require('../core/spec/layout');
import detail = require('./detail');
import add = require('./add');
import comp = require('./component');
import c = require('../core/html/Component');
import Attributes = require('../core/html/Attributes');
import RuleRunner = require('../core/html/RuleRunner');
import Context = require('../core/html/Context');
import fixtures = require('../test/fixtures');

var browserFixtures = require('browserFixtures');

var STASH_FIXTURE_NAME = 'stash.tmp';

function reloadWithState(state: any) {
	window.location.href = window.location.pathname + '#' + JSON.stringify(state);
	window.location.reload();
}

function reloadWithFixture(fixtureName: string) {
	var state = getUrlState();
	state.fixtureName = fixtureName;
	reloadWithState(state);
}

function getUrlState(): any {
	var hash = window.location.hash.substr(1);
	if (hash)
		return JSON.parse(hash);
	else
		return {};
}

function getUrlFixtureName(): string {
	return getUrlState().fixtureName;
}

var PageComponent = React.createClass({
	getInitialState() {
		var root: inf.Box = add.createBox(600, 600);

		this.refreshFixtures();

		return {
			layout: new l.Layout(root),
			selectedBox: null,
			rootComponent: c.Component.fromBox(root),

			fixtureNames: <any[]>[],

			fixtureDisabled: true,

			justLoaded: false,
			loadError: null,

			justSaved: false,
			wasSaveOverwrite: false,

			justCompared: false,
			comparison: false,
			oldRepr: null,

			comparingAll: false,
			justComparedAll: false,
			allComparisonResult: false,
		};
	},

	componentDidMount() {
		var fixtureName = getUrlState().fixtureName;
		if (fixtureName) {
			this.refs.fixtureName.getDOMNode().value = fixtureName;
			this.onFixtureNameChange();
			this.loadFixture();
		}
	},

	refreshFixtures() {
		browserFixtures.getFixtureNames((names: any[]) => {
			this.setState({fixtureNames: names.filter((name) => name !== STASH_FIXTURE_NAME)});
		});
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
					oldRepr: null,
				});
				setTimeout(() => {
					this.refs.rootComponent.runRules();
				}, 0);
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

	saveFixture(e: any, id: any, cb: () => any = null) {
		var name = this.refs.fixtureName.getDOMNode().value;
		this.refs.rootComponent.runRules();
		fixtures.save(
			name,
			this.state.layout.root,
			this.state.rootComponent,
			browserFixtures.writeFixture,
			(data) => {
				if (cb) cb();

				this.refreshFixtures();
				this.setState({
					justSaved: true,
					wasSaveOverwrite: data.overwritten,
					oldRepr: null,
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
		this.refs.rootComponent.runRules();
		fixtures.compare(
			name,
			this.state.rootComponent,
			browserFixtures.readFixture,
			(result, oldRepr) => {
				this.setState({
					justCompared: true,
					comparison: result,
					oldRepr: result ? null : oldRepr,
				});
				setTimeout(() => {
					this.setState({ justCompared: false });
				}, 1000);
			},
			this.readError
		);
	},

	loadAndCompareAll() {
		this.setState({
			oldRepr: null,
		});

		(function loadNext(index: number) {
			if (index >= this.state.fixtureNames.length) {
				this.setState({
					comparingAll: false,
					justComparedAll: true,
					allComparisonResult: true,
				});
				setTimeout(() => {
					this.setState({justComparedAll: false});
				}, 1000);
				this.refs.fixtureName.getDOMNode().value = '';
				return;
			} else {
				this.setState({
					comparingAll: true,
					justComparedAll: false,
				});
			}

			var fixtureName = this.state.fixtureNames[index];
			this.refs.fixtureName.getDOMNode().value = fixtureName;

			fixtures.load(
				fixtureName,
				browserFixtures.readFixture,
				(root: inf.Box, oldRepr: Attributes.Repr) => {
					var component = c.Component.fromBox(root);
					RuleRunner.runOn(component, Context.ie6AndAbove, []);

					if (Attributes.reprEqual(component.repr(), oldRepr)) {
						loadNext.bind(this)(index + 1);
					} else {
						this.setState({
							comparingAll: false,
							justComparedAll: true,
							allComparisonResult: false,
						});
						setTimeout(() => {
							this.setState({justComparedAll: false});
						}, 1000);
					}
				},
				() => {}
			);
		}).bind(this)(0);
	},

	onFixtureNameChange() {
		var name = this.refs.fixtureName.getDOMNode().value;
		this.setState({fixtureDisabled: !name});
	},

	render() {
		var names = this.state.fixtureNames.slice(0);
		var newName = '[New fixture]';
		names.unshift(newName);
		var fixtureSelect = React.DOM.select({
				onChange: (event: any) => {
					var name = event.target.value;
					if (name === newName)
						name = '';
					var input = this.refs.fixtureName.getDOMNode();
					input.value = name;
					input.focus();
					this.setState({fixtureDisabled: !name});
				},
			},
			names.map((name: string) => {
				return React.DOM.option(null, name);
			})
		);
		var oldRepr: any;
		if (this.state.oldRepr) {
			oldRepr = React.DOM.div(null,
				React.DOM.a({
					href: '#',
					onClick: () => {
						this.setState({
							oldRepr: null
						});
					}
				}, 'Close'),
				comp.serializeRepr(this.state.oldRepr)
			);
		}
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
					fixtureSelect,
					React.DOM.br(),
					React.DOM.button({
						onClick: this.loadFixture,
						disabled: this.state.fixtureDisabled || this.state.justLoaded,
					}, (this.state.justLoaded ? (this.state.loadError || '✔ Loaded') : 'Load')),
					React.DOM.button({
						onClick: this.saveFixture,
						disabled: this.state.fixtureDisabled || this.state.justSaved,
					}, (this.state.justSaved ? ('✔ ' + (this.state.wasSaveOverwrite ? 'Overwritten' : 'Saved')) : 'Save')),
					React.DOM.button({
						onClick: this.compareFixture,
						disabled: this.state.fixtureDisabled || this.state.justCompared,
					}, (this.state.justCompared ? (this.state.comparison ? '✔ Equal' : '✘ Not Equal') : 'Compare')),
					React.DOM.button({
						onClick: this.loadAndCompareAll,
						disabled: this.state.comparingAll || this.state.justComparedAll,
					}, (this.state.comparingAll
							? 'Comparing all'
							: (this.state.justComparedAll
								? (this.state.allComparisonResult ? '✔ Equal' : '✘ Not Equal')
								: 'Load & Compare All')
						)
					),
					React.DOM.button({
						onClick: (e: any, id: any) => {
							this.refs.fixtureName.getDOMNode().value = STASH_FIXTURE_NAME;
							this.saveFixture(e, id, () => reloadWithFixture(STASH_FIXTURE_NAME));
						},
					}, 'Stash & Reload'),
					oldRepr,
					React.DOM.hr(null),
					detail.DetailComponent({
						layout: this.state.layout,
						box: this.state.selectedBox || this.state.layout.root,
						onBoxChanged: this.onBoxChanged,
						updateSelectedBox: this.onBoxClicked,
					}),
					React.DOM.hr(),
					comp.RootComponent({
						component: this.state.rootComponent,
						ref: 'rootComponent',
					})
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

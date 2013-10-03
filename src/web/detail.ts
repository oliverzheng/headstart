import inf = require('../core/visual/interfaces');
import add = require('./add');
import HTMLComponent = require('./html');

var LengthComponent = React.createClass({
	onValueChanged(event: any) {
		var value = parseFloat(event.target.value);
		if (isNaN(value)) {
			value = 0;
		}
		this.props.len.value = value;
		this.props.onBoxChanged(null);
	},

	changeUnit(event: any, unit: inf.LengthUnit) {
		this.props.len.unit = unit;
		this.props.onBoxChanged(null);
		
		event.preventDefault();
	},

	render() {
		var len = this.props.len;
		var units = inf.lengthUnits.map((lengthUnit) => {
			if (lengthUnit === len.unit) {
				return React.DOM.strong(
					{className: 'lengthUnit', key: lengthUnit},
					inf.LengthUnit[lengthUnit]
				);
			} else if (!this.props.isRoot) {
				return React.DOM.a(
					{className: 'lengthUnit', key: lengthUnit, href: '#', onClick: (event: any) => {
						this.changeUnit(event, lengthUnit);
					}},
					inf.LengthUnit[lengthUnit]
				);
			}
		}).filter((x) => !!x);

		var value: any = null;
		if (inf.lengthUnitsWithValue.indexOf(len.unit) !== -1) {
			value = React.DOM.input({
				type: 'text',
				value: len.value,
				className: 'lengthValue',
				key: 'value',
				onChange: this.onValueChanged
			});
		}

		return React.DOM.span({}, units.concat([value]));
	}
});

export var DetailComponent = React.createClass({
	addChild() {
		var newBox = add.createBox();
		add.addChild(this.props.box, newBox);
		this.props.onBoxChanged(newBox);
	},

	deleteBox() {
		this.props.updateSelectedBox(this.props.box.parent);
		add.deleteBox(this.props.box);
		this.props.onBoxChanged(this.props.box);
	},

	changeDirection(direction: inf.Direction) {
		this.props.box.direction = direction;
		this.props.onBoxChanged(this.props.box);
	},

	changeAlignment(alignment: inf.Alignment) {
		this.props.box.alignment = alignment;
		this.props.onBoxChanged(this.props.box);
	},

	render() {
		var box: inf.Box = this.props.box;
		var html = React.DOM.div(null,
			HTMLComponent({layout: this.props.layout}),
			React.DOM.hr()
		);

		if (!box) {
			return React.DOM.div({className: 'detail'}, html);
		}

		var children = (box.children || <inf.Box[]>[]).map((child) => {
			return React.DOM.p({key: child.id}, React.DOM.a({
				href: '#',
				onClick: (event: any) => {
					this.props.updateSelectedBox(child);
					event.preventDefault();
				},
			}, 'child id: ' + child.id));
		});

		var parent: any = null;
		if (box.parent) {
			parent = React.DOM.p({}, React.DOM.a({
				href: '#',
				onClick: (event: any) => {
					this.props.updateSelectedBox(box.parent);
					event.preventDefault();
				},
			}, 'parent'));
		}

		var directions = inf.directions.map((direction) => {
			if (direction === (box.direction || inf.noDirection)) {
				return React.DOM.strong(
					{className: 'direction', key: direction},
					inf.Direction[direction]
				);
			} else {
				return React.DOM.a(
					{className: 'direction', key: direction, href: '#', onClick: (event: any) => {
						this.changeDirection(direction);
					}},
					inf.Direction[direction]
				);
			}
		});

		var alignments = inf.alignments.map((alignment) => {
			if (alignment === (box.alignment || inf.defaultAlignment)) {
				return React.DOM.strong(
					{className: 'alignment', key: alignment},
					inf.Alignment[alignment]
				);
			} else {
				return React.DOM.a(
					{className: 'alignment', key: alignment, href: '#', onClick: (event: any) => {
						this.changeAlignment(alignment);
					}},
					inf.Alignment[alignment]
				);
			}
		});

		var isRoot = box === this.props.layout.root;
		return React.DOM.div(
			{className: 'detail'},
			html,
			React.DOM.div(null,
				React.DOM.strong(null, 'Box ID: '),
				box.id
			),
			React.DOM.div(null,
				React.DOM.strong(null, 'Width: '),
				this.transferPropsTo(LengthComponent({len: box.w, isRoot: isRoot}))
			),
			React.DOM.div(null,
				React.DOM.strong(null, 'Height: '),
				this.transferPropsTo(LengthComponent({len: box.h, isRoot: isRoot}))
			),
			React.DOM.hr(null),
			parent,
			React.DOM.button({onClick: this.addChild}, 'Add Child'),
			React.DOM.div({},
				React.DOM.strong(null, 'Direction:'),
				React.DOM.span(null, directions)
			),
			React.DOM.div({},
				React.DOM.strong(null, 'Alignment:'),
				React.DOM.span(null, alignments)
			),
			React.DOM.div({}, children),
			React.DOM.hr(null),
			(box !== this.props.layout.root)
				? React.DOM.button({onClick: this.deleteBox}, 'Delete Box')
				: null
		);
	}
});

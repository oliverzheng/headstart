import inf = require('../core/spec/interfaces');
import add = require('./add');

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

	changeContent(content: inf.Content) {
		this.props.box.content = content;
		this.props.onBoxChanged(this.props.box);
	},

	changeAlignment(alignment: inf.Alignment) {
		this.props.box.alignment = alignment;
		this.props.onBoxChanged(this.props.box);
	},

	onStaticContentChanged() {
		var fontSize = this.refs.staticTextFontSize.getDOMNode().value;
		var text: inf.StaticText;
		if (fontSize) {
			text = {
				fontSize: parseInt(fontSize, 10),
				lineHeight: parseInt(this.refs.staticTextLineHeight.getDOMNode().value, 10) || null,
				value: this.refs.staticTextValue.getDOMNode().value,
				inputMinLines: parseInt(this.refs.staticTextInputMinLines.getDOMNode().value, 10) || null,
				inputMaxLines: parseInt(this.refs.staticTextInputMaxLines.getDOMNode().value, 10) || null,
				outputMaxLines: parseInt(this.refs.staticTextOutputMaxLines.getDOMNode().value, 10) || null,
			};
		}
		this.props.box.staticContent = {
			text: text,
		};
		this.props.onBoxChanged(this.props.box);
	},

	render() {
		var box: inf.Box = this.props.box;

		if (!box) {
			return React.DOM.div({className: 'detail'});
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

		var contents = inf.contents.map((content) => {
			if (content === (box.content || inf.defaultContent)) {
				return React.DOM.strong(
					{className: 'content', key: content},
					inf.Content[content]
				);
			} else {
				var classNames = 'content';
				var disabled = children.length > 0 && content === inf.Content.STATIC;
				if (disabled) {
					classNames += ' disabled';
				}
				var disabled = false;
				return React.DOM.a(
					{className: classNames, key: content, href: '#', onClick: (event: any) => {
						if (!disabled) {
							this.changeContent(content);
						}
					}},
					inf.Content[content]
				);
			}
		});

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

		var disableChildren = box.content === inf.Content.STATIC;

		var childrenMarkup = [
			React.DOM.button({onClick: disableChildren ? null : this.addChild, disabled: disableChildren}, 'Add Child'),
			React.DOM.div({},
				React.DOM.strong(null, 'Direction:'),
				React.DOM.span(null, directions)
			),
			React.DOM.div({},
				React.DOM.strong(null, 'Alignment:'),
				React.DOM.span(null, alignments)
			),
			React.DOM.div({}, children),
		];

		var staticText: any;
		if (box.content === inf.Content.STATIC) {
			var staticTextFontSize: number;
			var staticTextLineHeight: number;
			var staticTextValue: string;
			var staticTextInputMinLines: number;
			var staticTextInputMaxLines: number;
			var staticTextOutputMaxLines: number;
			if (box.staticContent && box.staticContent.text) {
				staticTextFontSize = box.staticContent.text.fontSize;
				staticTextLineHeight = box.staticContent.text.lineHeight || staticTextFontSize;
				staticTextValue = box.staticContent.text.value;
				staticTextInputMinLines = box.staticContent.text.inputMinLines;
				staticTextInputMaxLines = box.staticContent.text.inputMaxLines;
				staticTextOutputMaxLines = box.staticContent.text.outputMaxLines;
			}
			var staticText = React.DOM.div(null,
				React.DOM.div(null,
					React.DOM.hr(),
					React.DOM.div(null,
						React.DOM.strong(null, 'Static Text Font Size: '),
						React.DOM.input({
							type: 'text',
							value: staticTextFontSize,
							className: 'staticContent',
							ref: 'staticTextFontSize',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Line Height: '),
						React.DOM.input({
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextLineHeight,
							className: 'staticContent',
							ref: 'staticTextLineHeight',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Value: '),
						React.DOM.input({
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextValue,
							className: 'staticContent',
							ref: 'staticTextValue',
							onChange: this.onStaticContentChanged,
						})
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Input Min Lines: '),
						React.DOM.input({
							disabled: !staticTextFontSize,
							type: 'text',
							value: staticTextInputMinLines,
							className: 'staticContent',
							ref: 'staticTextInputMinLines',
							onChange: this.onStaticContentChanged,
						})
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Input Max Lines: '),
						React.DOM.input({
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextInputMaxLines,
							className: 'staticContent',
							ref: 'staticTextInputMaxLines',
							onChange: this.onStaticContentChanged,
						})
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Output Max Lines: '),
						React.DOM.input({
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextOutputMaxLines,
							className: 'staticContent',
							ref: 'staticTextOutputMaxLines',
							onChange: this.onStaticContentChanged,
						})
					)
				)
			);
		}

		var isRoot = box === this.props.layout.root;
		return React.DOM.div(
			{className: 'detail'},
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
			React.DOM.div({},
				React.DOM.strong(null, 'Content:'),
				React.DOM.span(null, contents)
			),
			React.DOM.hr(null),
			parent,
			childrenMarkup,
			staticText,
			React.DOM.hr(null),
			(box !== this.props.layout.root)
				? React.DOM.button({onClick: this.deleteBox}, 'Delete Box')
				: null
		);
	}
});

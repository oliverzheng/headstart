import assert = require('assert');

import inf = require('../core/spec/interfaces');
import sutil = require('../core/spec/util');
import add = require('./add');

declare var window: { [name: string]: any };

var LengthComponent = React.createClass({
	onValueChanged(event: any) {
		var value = parseFloat(event.target.value);
		if (isNaN(value)) {
			value = 0;
		}
		this.props.len.value = value;
		this.props.onLengthUpdated(null);
	},

	changeUnit(event: any, unit: inf.LengthUnit) {
		this.props.len.unit = unit;
		this.props.onLengthUpdated(null);
		
		event.preventDefault();
	},

	toggleRuntime() {
		this.props.len.unit = inf.LengthUnit.PIXELS;
		this.props.len.runtime = !this.props.len.runtime;
		this.props.onLengthUpdated(null);
	},

	render() {
		var len = this.props.len;
		var units = inf.lengthUnits.map((lengthUnit) => {
			if (len.runtime && lengthUnit !== inf.LengthUnit.PIXELS)
				return;

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

		var runtime = React.DOM.span(null,
			React.DOM.input({
				type: 'checkbox',
				onChange: this.toggleRuntime,
				checked: len.runtime,
			}),
			'Change at runtime'
		);

		return React.DOM.span({},
			React.DOM.span(null, units.concat([value])),
			runtime
		);
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

	moveBoxUp(box: inf.Box) {
		var index = box.parent.children.indexOf(box);
		assert(index !== -1 && index > 0);

		box.parent.children.splice(index, 1);
		box.parent.children.splice(index - 1, 0, box);

		this.props.onBoxChanged(box.parent);
	},

	moveBoxDown(box: inf.Box) {
		var children = box.parent.children;
		var index = children.indexOf(box);
		assert(index !== -1 && index < (children.length - 1));

		children.splice(index, 1);
		children.splice(index + 1, 0, box);

		this.props.onBoxChanged(box.parent);
	},

	moveBoxToNewParent(child: inf.Box, parent: inf.Box) {
		sutil.reparent(child, parent);

		this.props.onBoxChanged(parent);
	},

	changeDirection(direction: inf.Direction) {
		this.props.box.direction = direction;
		this.props.onBoxChanged(this.props.box);
	},

	toggleCreateNode() {
		this.props.box.createNode = !this.props.box.createNode;
		if (!this.props.box.createNode) {
			this.props.box.w.runtime = false;
			this.props.box.h.runtime = false;
		}
		this.props.onBoxChanged(this.props.box);
	},

	changeUseStatic(useStatic: boolean) {
		if (useStatic) {
			if (!this.props.box.staticContent) {
				this.props.box.staticContent = {};
			}
			this.props.box.children = [];
		} else {
			if (this.props.box.staticContent) {
				this.props.box.staticContent = null;
			}
		}
		this.props.onBoxChanged(this.props.box);
	},

	onStaticContentChanged() {
		var fontSize = this.refs.staticTextFontSize.getDOMNode().value;
		var lineHeight = this.refs.staticTextLineHeight.getDOMNode().value || fontSize;

		if (!this.props.box.staticContent) {
			this.props.box.staticContent = {};
		}

		if (fontSize) {
			var text: inf.StaticText = {
				fontSize: parseInt(fontSize, 10),
				lineHeight: parseInt(lineHeight, 10) || null,
				value: this.refs.staticTextValue.getDOMNode().value,
				fontFamily: this.refs.staticTextFontFamily.getDOMNode().value,
				inputMinLines: parseInt(this.refs.staticTextInputMinLines.getDOMNode().value, 10) || null,
				inputMaxLines: parseInt(this.refs.staticTextInputMaxLines.getDOMNode().value, 10) || null,
				outputMaxLines: parseInt(this.refs.staticTextOutputMaxLines.getDOMNode().value, 10) || null,
			};

			this.props.box.staticContent.text = text;
			this.props.box.children = <inf.Box[]>[];
		} else {
			this.props.box.staticContent.text = null;
		}

		var useStaticImage = this.refs.staticImageEnable.getDOMNode().checked;
		if (useStaticImage) {
			var sourceDimension: { w: number; h: number; } = null;
			var width = this.refs.staticImageWidth.getDOMNode().value;
			var height = this.refs.staticImageHeight.getDOMNode().value;
			if (width && height) {
				sourceDimension = {
					w: parseInt(width, 10),
					h: parseInt(height, 10),
				};
			}
			var image: inf.StaticImage = {
				url: this.refs.staticImageUrl.getDOMNode().value || null,
				sourceDimension: sourceDimension,
				accessible: this.refs.staticImageAccessible.getDOMNode().checked,
			};

			this.props.box.staticContent.image = image;
		} else {
			this.props.box.staticContent.image = null;
		}

		var staticFillColor = this.refs.staticFillColor.getDOMNode().value;
		if (staticFillColor) {
			this.props.box.staticContent.fill = { color: staticFillColor };
		} else {
			this.props.box.staticContent.fill = null;
		}

		this.props.onBoxChanged(this.props.box);
	},

	onStaticImageURLEntered() {
		var path: string = this.refs.staticImageUrl.getDOMNode().value;
		var url: any = new window['URL'](path);
		if (!url.isExternal()) {
			return;
		}

		window['Qimage'](path).then((img: any) => {
			this.refs.staticImageWidth.getDOMNode().value = img.width;
			this.refs.staticImageHeight.getDOMNode().value = img.height;
			this.onStaticContentChanged();
		}, (err: any) => {
			console.log('Could not retrieve ' + path + ':', err);
		});
	},

	onLengthUpdated() {
		if ((this.props.box.w.runtime || this.props.box.h.runtime) &&
			!this.props.box.createNode) {
			this.props.box.createNode = true;
		}
		this.props.onBoxChanged(this.props.box);
	},

	render() {
		var box: inf.Box = this.props.box;

		if (!box) {
			return React.DOM.div({className: 'detail'});
		}

		var isRoot = this.props.box === this.props.rootBox;

		var children = (box.children || <inf.Box[]>[]).map((child, i, array) => {
			var isFirst = i === 0;
			var isLast = i === array.length - 1;

			return React.DOM.p({key: child.id},
				React.DOM.a({
					href: '#',
					onClick: (event: any) => {
						this.props.updateSelectedBox(child);
						event.preventDefault();
					},
				}, 'child id: ' + child.id),
				' ',
				(!isFirst) ? React.DOM.a({
						href: '#',
						onClick: (event: any) => {
							this.moveBoxUp(child);
							event.preventDefault();
						},
					}, '▲') : null,
				' ',
				(!isLast) ? React.DOM.a({
						href: '#',
						onClick: (event: any) => {
							this.moveBoxDown(child);
							event.preventDefault();
						},
					}, '▼') : null,
				' ',
				(!isRoot) ? React.DOM.a({
						href: '#',
						onClick: (event: any) => {
							this.moveBoxToNewParent(child, this.props.box.parent);
							event.preventDefault();
						},
					}, 'Push to parent ⤴') : null,
				' ',
				(!isLast) ? React.DOM.a({
						href: '#',
						onClick: (event: any) => {
							this.moveBoxToNewParent(child, box.children[i + 1]);
							event.preventDefault();
						},
					}, 'Push to next sibling ⤵') : null
			);
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

		var createNode =
			React.DOM.input({
				type: 'checkbox',
				checked: !!box.createNode,
				onChange: this.toggleCreateNode,
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

		var hasChildren = box.children && box.children.length > 0;

		var useChildren = box.children && box.children.length > 0;
		var useStatic = (!box.children || box.children.length === 0) && box.staticContent;
		if (!useChildren && !useStatic) {
			useChildren = true;
		}

		var useStaticComponent =
			React.DOM.input({
				type: 'checkbox',
				checked: useStatic,
				disabled: hasChildren,
				onChange: () => {
					this.changeUseStatic(!useStatic);
				},
			});

		var childrenMarkup = [
			React.DOM.button({onClick: useChildren ? this.addChild : null, disabled: !useChildren}, 'Add Child'),
			React.DOM.div({},
				React.DOM.strong(null, 'Direction:'),
				React.DOM.span(null, directions)
			),
			React.DOM.div({}, children),
		];

		var staticText: any;
		var staticImage: any;
		var staticFill: any;
		if (useStatic) {
			var staticTextFontSize: number;
			var staticTextLineHeight: number;
			var staticTextValue: string;
			var staticTextFontFamily: string;
			var staticTextInputMinLines: number;
			var staticTextInputMaxLines: number;
			var staticTextOutputMaxLines: number;
			if (box.staticContent && box.staticContent.text) {
				staticTextFontSize = box.staticContent.text.fontSize;
				staticTextLineHeight = box.staticContent.text.lineHeight || staticTextFontSize;
				staticTextValue = box.staticContent.text.value;
				staticTextFontFamily = box.staticContent.text.fontFamily;
				staticTextInputMinLines = box.staticContent.text.inputMinLines;
				staticTextInputMaxLines = box.staticContent.text.inputMaxLines;
				staticTextOutputMaxLines = box.staticContent.text.outputMaxLines;
			}
			staticText = React.DOM.div(null,
				React.DOM.div(null,
					React.DOM.hr(),
					React.DOM.div(null,
						React.DOM.strong({ className: hasChildren ? 'disabled' : '' }, 'Static Text Font Size: '),
						React.DOM.input({
							disabled: hasChildren,
							className: 'lengthValue staticContent',
							type: 'text',
							value: staticTextFontSize,
							ref: 'staticTextFontSize',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Line Height: '),
						React.DOM.input({
							className: 'lengthValue staticContent',
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextLineHeight,
							ref: 'staticTextLineHeight',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Value: '),
						React.DOM.textarea({
							defaultValue: staticTextValue,
							disabled: !staticTextFontSize,
							className: 'staticContent',
							ref: 'staticTextValue',
							onChange: this.onStaticContentChanged,
						})
					),
					React.DOM.div({ className: staticTextFontSize ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Text Font Family: '),
						React.DOM.input({
							type: 'text',
							disabled: !staticTextFontSize,
							value: staticTextFontFamily,
							className: 'staticContent',
							ref: 'staticTextFontFamily',
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

			var hasStaticImage: boolean = false;
			var staticImageUrl: string;
			var staticImageWidth: number;
			var staticImageHeight: number;
			var staticImageAccessible: boolean;
			if (box.staticContent && box.staticContent.image) {
				hasStaticImage = true;
				staticImageUrl = box.staticContent.image.url;
				var sourceDimension = box.staticContent.image.sourceDimension;
				if (sourceDimension) {
					staticImageWidth = sourceDimension.w;
					staticImageHeight = sourceDimension.h;
				}
				staticImageAccessible = box.staticContent.image.accessible;
			}
			var staticImage = React.DOM.div(null,
				React.DOM.div(null,
					React.DOM.hr(),
					React.DOM.div(null,
						React.DOM.strong(null, 'Static Image: '),
						React.DOM.input({
							type: 'checkbox',
							checked: hasStaticImage,
							className: 'staticContent',
							ref: 'staticImageEnable',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'Enable')
					),
					React.DOM.div({ className: hasStaticImage ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Image URL: '),
						React.DOM.input({
							type: 'text',
							disabled: !hasStaticImage,
							value: staticImageUrl,
							className: 'staticContent',
							ref: 'staticImageUrl',
							onChange: this.onStaticContentChanged,
							onBlur: this.onStaticImageURLEntered,
						})
					),
					React.DOM.div({ className: hasStaticImage ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Image Source Dimension Width: '),
						React.DOM.input({
							className: 'lengthValue staticContent',
							type: 'text',
							disabled: !hasStaticImage,
							value: staticImageWidth,
							ref: 'staticImageWidth',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: hasStaticImage ? '' : 'disabled'},
						React.DOM.strong(null, 'Static Image Source Dimension Height: '),
						React.DOM.input({
							className: 'lengthValue staticContent',
							type: 'text',
							disabled: !hasStaticImage,
							value: staticImageHeight,
							ref: 'staticImageHeight',
							onChange: this.onStaticContentChanged,
						}),
						React.DOM.span(null, 'px')
					),
					React.DOM.div({ className: (!hasStaticImage || hasChildren) ? 'disabled' : ''},
						React.DOM.strong(null, 'Static Image Accessible (use <img>): '),
						React.DOM.input({
							disabled: !hasStaticImage || hasChildren,
							checked: staticImageAccessible,
							type: 'checkbox',
							className: 'staticContent',
							ref: 'staticImageAccessible',
							onChange: this.onStaticContentChanged,
						})
					)
				)
			);

			var staticFillColor: string;
			if (box.staticContent && box.staticContent.fill) {
				staticFillColor = box.staticContent.fill.color;
			}
			staticFill = React.DOM.div(null,
				React.DOM.div(null,
					React.DOM.hr(),
					React.DOM.div(null,
						React.DOM.strong(null, 'Static Fill: '),
						React.DOM.input({
							type: 'text',
							defaultValue: staticFillColor,
							className: 'staticContent',
							ref: 'staticFillColor',
							onBlur: this.onStaticContentChanged,
						})
					)
				)
			);
		}

		return React.DOM.div(
			{className: 'detail'},
			React.DOM.div(null,
				React.DOM.strong(null, 'Box ID: '),
				box.id
			),
			React.DOM.div(null,
				React.DOM.strong(null, 'Width: '),
				LengthComponent({len: box.w, isRoot: isRoot, onLengthUpdated: this.onLengthUpdated})
			),
			React.DOM.div(null,
				React.DOM.strong(null, 'Height: '),
				LengthComponent({len: box.h, isRoot: isRoot, onLengthUpdated: this.onLengthUpdated})
			),
			React.DOM.div({},
				React.DOM.strong(null, 'Create Node:'),
				React.DOM.span(null, createNode)
			),
			React.DOM.div({},
				React.DOM.strong(null, 'Use Static Content:'),
				React.DOM.span(null, useStaticComponent)
			),
			React.DOM.hr(null),
			parent,
			childrenMarkup,
			staticText,
			staticImage,
			staticFill,
			React.DOM.hr(null),
			(!isRoot)
				? React.DOM.button({onClick: this.deleteBox}, 'Delete Box')
				: null
		);
	},

	setupColorPicker() {
		if (!this.refs || !this.refs.staticFillColor)
			return;

		var fillColor = this.refs.staticFillColor.getDOMNode();
		if (fillColor.color) {
			return;
		}
		new window['jscolor'].color(fillColor, {required: false, hash: true});
	},

	componentDidMount() {
		this.setupColorPicker();
	},

	componentDidUpdate() {
		this.setupColorPicker();
	},
});

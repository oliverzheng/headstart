import sinf = require('../spec/interfaces');
import l = require('../spec/layout');
import d = require('./dom');

export interface Style {
	name: string;
	value: string;
	becauseOf: sinf.Box[];
}

export interface Node {
	children?: Node[];
	styles?: Style[];
}

export interface NodeFromBox extends Node {
	becauseOf: sinf.Box[];
}

export interface BoxStyle {
	box: sinf.Box;
	style: Style;
}

export interface RuleResult {
	isNode: boolean;
	boxStyles?: BoxStyle[];
}

export interface Rule {
	(layout: l.Layout, dom: d.Dom, box: sinf.Box): RuleResult;
}

import sinf = require('../spec/interfaces');
import l = require('../spec/layout');

export interface Style {
	name: string;
	value: string;
}

export interface StyleFromBox extends Style {
	becauseOf: sinf.Box;
}

export interface Node {
	children?: Node[];
	styles?: StyleFromBox[];
}

export interface NodeFromBox extends Node {
	becauseOf: sinf.Box;
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
	(layout: l.Layout, box: sinf.Box): RuleResult;
}

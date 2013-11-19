import c = require('./Component');
import Attributes = require('./Attributes');
import Context = require('./Context');

export interface RuleResult {
	component: c.Component;
	attributes?: Attributes.BaseAttribute[];
	replaceAttributes?: Attributes.BaseAttribute[];
}

export interface Rule {
	(component: c.Component, context: Context.Context): RuleResult[];
}

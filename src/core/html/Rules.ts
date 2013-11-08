import c = require('./Component');
import Attributes = require('./Attributes');

export interface RuleResult {
	component: c.Component;
	attributes?: Attributes.BaseAttribute[];
	replaceAttributes?: Attributes.BaseAttribute[];
}

export interface Rule {
	(component: c.Component): RuleResult[];
}

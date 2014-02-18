import c = require('./Component');
import Attributes = require('./Attributes');
import Context = require('./Context');

export interface RuleResult {
	component: c.Component;
	attributes?: Attributes.BaseAttribute[];
	replaceAttributes?: Attributes.BaseAttribute[];
	deleteAttributes?: Attributes.Type[];
}

export interface Rule {
	(component: c.Component, context: Context.Context): RuleResult[];
}

export interface RuleWithName {
	name: string;
	rule: Rule;
}

export interface Bucket {
	name: string;
	rules: RuleWithName[];
}

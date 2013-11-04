import Component = require('Component');
import Attributes = require('Attributes');

export interface RuleResult {
	component: Component;
	attributes: Attributes.BaseAttribute[];
}

export interface Rule {
	(component: Component): RuleResult[];
}

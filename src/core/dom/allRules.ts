import inf = require('./interfaces');
import um = require('./rules/userManagement');
import root = require('./rules/root');
import spacing = require('./rules/spacing');

var rules: inf.Rule[] = [
	um.DynamicBox,
	root.RootBox,
	spacing.Margin,
];

export = rules;

import inf = require('./interfaces');
import um = require('./rules/userManagement');
import root = require('./rules/root');

var rules: inf.Rule[] = [
	um.DynamicBox,
	root.RootBox,
];

export = rules;

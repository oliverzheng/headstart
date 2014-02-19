import assert = require('assert');

import Rules = require('../Rules');
import c = require('../Component');
import Markup = require('../Markup');
import CSSAttribute = require('../attributes/CSSAttribute');

import styling = require('./rendering/styling');
import alignment = require('./rendering/alignment');
import sizing = require('./rendering/sizing');
import spacing = require('./rendering/spacing');

var rules: Rules.RuleWithName[] = [];

rules.push.apply(rules, styling);
rules.push.apply(rules, alignment);
rules.push.apply(rules, sizing);
rules.push.apply(rules, spacing);

var bucket: Rules.Bucket = {
	name: 'rendering',
	rules: rules,
};

export = bucket;

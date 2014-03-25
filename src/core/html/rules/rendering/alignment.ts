import assert = require('assert');

import Attributes = require('../Attributes');
import c = require('../../Component');
import Rules = require('../../Rules');
import NodeAttribute = require('../../attributes/NodeAttribute');
import StackedChildren = require('../../attributes/StackedChildren');
import BlockFormat = require('../../attributes/BlockFormat');
import Alignment = require('../../attributes/Alignment');
import CSSAttribute = require('../../attributes/CSSAttribute');
import LengthAttribute = require('../../attributes/LengthAttribute');
import TextContent = require('../../attributes/TextContent');
import BoxModel = require('../../attributes/BoxModel');
import LineHeight = require('../../attributes/LineHeight');
import getDirection = require('../../patterns/getDirection');
import getCrossAlignment = require('../../patterns/getCrossAlignment');
import sinf = require('../../../spec/interfaces');
import reqs = require('../../requirements');
import patterns = require('./patterns');
import util = require('../../util');
import p = require('../../patterns');

// This file brought to you by
// http://coding.smashingmagazine.com/2013/08/09/absolute-horizontal-vertical-centering-css/

export function textAlign(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var isCenter = matches.getMatch(component, p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.center));
	return [{
		component: component,
		attributes: [
			new CSSAttribute({
				'text-align': isCenter ? 'center' : 'right',
			}),
			new BlockFormat(),
		],
	}];
}

export function textAlignExtendWidth(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);
	var results = textAlign(component, matches);
	results.push({
		component: content,
		attributes: [
			new CSSAttribute({
				'width': '100%',
			}),
		],
	});
	return results;
}

export function marginAuto(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);

	var styles = {
		'margin-left': 'auto',
	};
	if (matches.getMatch(component, p.isAligned(p.getOnlyContentChild, sinf.horiz, sinf.center))) {
		styles['margin-right'] = 'auto';
	}

	return [{
		component: content,
		attributes: [
			new CSSAttribute(styles),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new BlockFormat(),
		],
	}];
}

export function lineHeightToHeight(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);
	assert(content);

	var height = LengthAttribute.getFrom(component, sinf.vert);
	assert(height && height.px.isSet());

	var lineHeight = height.px.value;

	var isBottom = matches.getMatch(component, p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.far));
	if (isBottom) {
		var contentHeight = LengthAttribute.getFrom(content, sinf.vert);
		assert(contentHeight && contentHeight.px.isSet());

		lineHeight = lineHeight * 2 - contentHeight.px.value;
	}

	return [{
		component: content,
		replaceAttributes: [
			new LineHeight(lineHeight),
		],
	}];
}

export function verticalNegativeMargin(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var middle = matches.getMatch(component, p.getOnlyContentChild);

	var height = LengthAttribute.getFrom(middle, sinf.vert);
	assert(height && height.px.isSet());

	return [{
		component: middle,
		attributes: [
			new CSSAttribute({
				'position': 'absolute',
				'top': '50%',
				'margin-top': (-height.px.value / 2).toString() + 'px',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new CSSAttribute({
				'position': 'relative',
			}),
		],
	}];
}

export function horizontalNegativeMargin(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var center = matches.getMatch(component, p.getOnlyContentChild);

	var width = LengthAttribute.getFrom(center, sinf.horiz);
	assert(width && width.px.isSet());

	return [{
		component: center,
		attributes: [
			new CSSAttribute({
				'position': 'absolute',
				'left': '50%',
				'margin-left': (-width.px.value / 2).toString() + 'px',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new CSSAttribute({
				'position': 'relative',
			}),
		],
	}];
}

export function horizontalRightZero(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);

	return [{
		component: content,
		attributes: [
			new CSSAttribute({
				'position': 'absolute',
				'right': '0',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new CSSAttribute({
				'position': 'relative',
			}),
		],
	}];
}

export function verticalBottomZero(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);

	return [{
		component: content,
		attributes: [
			new CSSAttribute({
				'position': 'absolute',
				'bottom': '0',
			}),
			new BlockFormat(),
		],
	}, {
		component: component,
		attributes: [
			new CSSAttribute({
				'position': 'relative',
			}),
		],
	}];
}

export function tableCell(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);

	var results: Rules.RuleResult[] = [];
	var table: c.Component;
	var cell: c.Component;

	if (matches.getMatch(component, p.isTableCellInTable)) {
		// If we already applied this rule, don't do it again.
		cell = component;
		table = component.getParent();
	} else {
		results = component.getParent().getChildrenManager().wrapChild(component);
		table = results[1].component;
		cell = component;
	}

	var isMiddle = matches.getMatch(component, p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.center));

	results.push({
		component: cell,
		attributes: [
			new CSSAttribute({
				'display': 'table-cell',
				'vertical-align': isMiddle ? 'middle' : 'bottom',
			}),
			new NodeAttribute(),
		],
	});
	results.push({
		component: table,
		attributes: [
			new CSSAttribute({
				'display': 'table',
			}),
			new NodeAttribute(),
		],
	});

	return results;
}

export function verticalCenterKnownSizes(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var content = matches.getMatch(component, p.getOnlyContentChild);

	var outerHeight = LengthAttribute.getFrom(component, sinf.vert);
	assert(outerHeight && outerHeight.px.isSet());
	var innerHeight = LengthAttribute.getFrom(content, sinf.vert);
	assert(innerHeight && innerHeight.px.isSet());

	var isBottom = matches.getMatch(component, p.isAligned(p.getOnlyContentChild, sinf.vert, sinf.far));
	var topLength: number;
	var bottomLength: number;
	if (!isBottom) {
		topLength = (outerHeight.px.value - innerHeight.px.value) / 2;
		bottomLength = topLength;
	} else {
		topLength = (outerHeight.px.value - innerHeight.px.value);
		bottomLength = 0;
	}

	return [{
		component: component,
		attributes: [
			new BoxModel(null, {
				t: topLength,
				b: bottomLength,
			}),
		],
	}];
}

export function horizontalCenterKnownSizes(component: c.Component, matches: p.PatternMatches): Rules.RuleResult[] {
	var center = matches.getMatch(component, p.getOnlyContentChild);

	var outerWidth = LengthAttribute.getFrom(component, sinf.horiz);
	assert(outerWidth && outerWidth.px.isSet());
	var innerWidth = LengthAttribute.getFrom(center, sinf.horiz);
	assert(innerWidth && innerWidth.px.isSet());

	var length = (outerWidth.px.value - innerWidth.px.value) / 2;
	return [{
		component: component,
		attributes: [
			new BoxModel(null, {
				l: length,
				r: length,
			}),
		],
	}];
}

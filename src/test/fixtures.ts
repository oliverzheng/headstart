import inf = require('../core/spec/interfaces');
import sutil = require('../core/spec/util');
import c = require('../core/html/Component');

export function load(
		name: string,
		readFunc: (name: string, successCb: (body: any) => any, errorCb: (error: any) => any) => any,
		successCb: (root: inf.Box, component: c.Component) => any,
		errorCb: (error: any) => any
	) {
	readFunc(name, (body) => {
		sutil.refreshParents(body.spec);
		successCb(body.spec, body.componentRepr);
	}, errorCb);
}

export function save(
		name: string,
		root: inf.Box,
		component: c.Component,
		writeFunc: (name: string, body: any, successCb: () => any, errorCb: (error: any) => any) => any,
		successCb: () => any,
		errorCb: (error: any) => any
	) {
	writeFunc(name, {
		spec: sutil.cloneTree(root),
		componentRepr: component.repr(),
	}, successCb, errorCb);
}

import inf = require('../core/spec/interfaces');
import sutil = require('../core/spec/util');
import c = require('../core/html/Component');
import Attributes = require('../core/html/Attributes');

export interface ReadFunc {
	(name: string, successCb: (body: any) => any, errorCb: (error: any) => any): any;
}

export interface WriteFunc {
	(name: string, body: any, successCb: (data: any) => any, errorCb: (error: any) => any): any;
}

export function load(
		name: string,
		readFunc: ReadFunc,
		successCb: (root: inf.Box, componentRepr: Attributes.Repr) => any,
		errorCb: (error: any) => any
	) {
	readFunc(name, (body) => {
		sutil.refreshParents(body.spec);
		successCb(body.spec, body.componentRepr);

		var maxComponentID = 0;
		(function getMaxID(repr: Attributes.Repr) {
			if (repr.id) {
				var id = parseInt(repr.id, 10);
				if (id > maxComponentID)
					maxComponentID = id;
			}

			if (repr.children)
				repr.children.forEach(getMaxID);
		})(body.componentRepr);

		c.Component.increaseIDToAtLeast(maxComponentID + 1);
	}, errorCb);
}

export function save(
		name: string,
		root: inf.Box,
		component: c.Component,
		writeFunc: WriteFunc,
		successCb: (data: any) => any,
		errorCb: (error: any) => any
	) {
	writeFunc(name, {
		spec: sutil.cloneTree(root),
		componentRepr: component.repr(),
	}, successCb, errorCb);
}

export function compare(
		name: string,
		newComponent: c.Component,
		readFunc: ReadFunc,
		successCb: (result: boolean, oldRepr: Attributes.Repr) => any,
		errorCb: (error: any) => any
	) {
	load(name, readFunc, (root, componentRepr) => {
		successCb(Attributes.reprEqual(newComponent.repr(), componentRepr), componentRepr);
	}, errorCb);
}

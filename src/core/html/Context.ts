export enum BROWSER_VENDOR {
	IE,
	WEBKIT,
	MOZILLA,
}

export interface BrowserMatch {
	vendor: BROWSER_VENDOR;
	minVersion?: number; // Inclusive
	maxVersion?: number; // Non-inclusive
}

export class Context {
	private supportedBrowsers: BrowserMatch[];
	private unsupportedBrowsers: BrowserMatch[];
	private javascriptSupported: boolean;

	static supportBrowsers(supportedBrowsers: BrowserMatch[]): Context {
		var c = new Context;
		c.supportedBrowsers = supportedBrowsers;
		return c;
	}

	static unsupportBrowsers(unsupportedBrowsers: BrowserMatch[]): Context {
		var c = new Context;
		c.unsupportedBrowsers = unsupportedBrowsers;
		return c;
	}

	static supportJavascript(javascriptSupported: boolean): Context {
		var c = new Context;
		c.javascriptSupported = javascriptSupported;
		return c;
	}

	getSupportedBrowsers(context: Context): BrowserMatch[] {
		return this.supportedBrowsers;
	}

	getUnsupportedBrowsers(context: Context): BrowserMatch[] {
		return this.unsupportedBrowsers;
	}

	addTo(context: Context): Context {
		var newContext = new Context;
		newContext.supportedBrowsers = this.supportedBrowsers;
		newContext.unsupportedBrowsers = this.unsupportedBrowsers;
		newContext.javascriptSupported = this.javascriptSupported;

		if (context.supportedBrowsers) {
			newContext.supportedBrowsers.push.apply(
				newContext.supportedBrowsers,
				context.supportedBrowsers
			);
		}
		if (context.unsupportedBrowsers) {
			newContext.unsupportedBrowsers.push.apply(
				newContext.unsupportedBrowsers,
				context.unsupportedBrowsers
			);
		}
		if (context.javascriptSupported != null) {
			newContext.javascriptSupported = context.javascriptSupported;
		}

		return newContext;
	}
}

export var ie6AndAbove: Context = Context.unsupportBrowsers([{
	vendor: BROWSER_VENDOR.IE,
	maxVersion: 6,
}]);

export var ie7AndAbove: Context = Context.unsupportBrowsers([{
	vendor: BROWSER_VENDOR.IE,
	maxVersion: 7,
}]);

export var ie8AndAbove: Context = Context.unsupportBrowsers([{
	vendor: BROWSER_VENDOR.IE,
	maxVersion: 8,
}]);

export var ie9AndAbove: Context = Context.unsupportBrowsers([{
	vendor: BROWSER_VENDOR.IE,
	maxVersion: 9,
}]);

export var ie10AndAbove: Context = Context.unsupportBrowsers([{
	vendor: BROWSER_VENDOR.IE,
	maxVersion: 10,
}]);

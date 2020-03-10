declare const window: any;

const GLOBAL_NAMESPACE = Symbol('integral-ui');
window[GLOBAL_NAMESPACE] = {};

export const setGlobalReference = function(key: string, value) {
    window[GLOBAL_NAMESPACE] = window[GLOBAL_NAMESPACE] || {};
	window[GLOBAL_NAMESPACE][key] = value;
}

export const getGlobalReference = function(key): any {
    return window[GLOBAL_NAMESPACE][key];
}

export const getNextDepth = (): number => {
	let zIndex = getGlobalReference('OverlayZIndex');
	if (zIndex !== undefined) {
		zIndex += 1;
		setGlobalReference('OverlayZIndex', zIndex);
		return zIndex;
	} else {
		zIndex = 1000;
		setGlobalReference('OverlayZIndex', zIndex);
		return zIndex;
	}
}
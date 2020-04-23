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

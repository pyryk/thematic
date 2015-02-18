// polyfill required features like Promises and fetch

require('whatwg-fetch');
var PromisePolyfill = require('es6-promise');

if (!window.Promise) {
	window.Promise = PromisePolyfill;
}
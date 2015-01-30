// polyfill required features like Promises and fetch

require('whatwg-fetch');
var Promise = require('es6-promise');

if (!window.Promise) {
	window.Promise = Promise;
}
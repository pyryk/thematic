;(function() {
	var vizframe = require('vizframe');

	// window or global
	var root = this;

	// amd / requirejs
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function() {
			return vizframe;
		});
	}
	// commonjs-compatible (node.js, browserify, ...)
	else if (module && module.exports) {
			
	}
	// browser without modules
	else {
		root.vizframe = vizframe;
	}
})();
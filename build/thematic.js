(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function() {
	window.thematic = require('index');
})();
},{"index":9}],2:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    doc.createStyleSheet().cssText = css;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';
  
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }
    
    head.appendChild(style); 
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    document.createStyleSheet(url);
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;
  
    head.appendChild(link); 
  }
};

},{}],3:[function(require,module,exports){
/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade
*/
(function (window, document, undefined) {
var oldL = window.L,
    L = {};

L.version = '0.7.2';

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
	define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed

L.noConflict = function () {
	window.L = oldL;
	return this;
};

window.L = L;


/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

L.Util = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0,
		    key = '_leaflet_id';
		return function (obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return L.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		var i, fn,
		    prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	var lastTime = 0;

	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame ||
	        getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
	        getPrefixed('CancelAnimationFrame') ||
	        getPrefixed('CancelRequestAnimationFrame') ||
	        function (id) { window.clearTimeout(id); };


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;


/*
 * L.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

L.Class = function () {};

L.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		L.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		L.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = L.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	L.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// method for adding properties to prototype
L.Class.include = function (props) {
	L.extend(this.prototype, props);
};

// merge new default options to the Class
L.Class.mergeOptions = function (options) {
	L.extend(this.prototype.options, options);
};

// add a constructor hook
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events is used to add custom events functionality to Leaflet classes.
 */

var eventsKey = '_leaflet_events';

L.Mixin = {};

L.Mixin.Events = {

	addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && context !== this && L.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this
			};
			type = types[i];

			if (contextId) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx';
				indexLenKey = indexKey + '_len';

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},

	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},

	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && context !== this && L.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];
				delete events[indexLenKey];

			} else {
				listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							removed = listeners.splice(j, 1);
							// set the old action to a no-op, because it is possible
							// that the listener is being iterated over as part of a dispatch
							removed[0].action = L.Util.falseFn;
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},

	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},

	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = L.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();

			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].action.call(listeners[i].context, event);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];

		for (contextId in typeIndex) {
			listeners = typeIndex[contextId].slice();

			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].action.call(listeners[i].context, event);
				}
			}
		}

		return this;
	},

	addOneTimeEventListener: function (types, fn, context) {

		if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

		var handler = L.bind(function () {
			this
			    .removeEventListener(types, fn, context)
			    .removeEventListener(types, handler, context);
		}, this);

		return this
		    .addEventListener(types, fn, context)
		    .addEventListener(types, handler, context);
	}
};

L.Mixin.Events.on = L.Mixin.Events.addEventListener;
L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;


/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

	    // terrible browser detection to work around Safari / iOS / Android browser bugs
	    ua = navigator.userAgent.toLowerCase(),
	    webkit = ua.indexOf('webkit') !== -1,
	    chrome = ua.indexOf('chrome') !== -1,
	    phantomjs = ua.indexOf('phantom') !== -1,
	    android = ua.indexOf('android') !== -1,
	    android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

	    mobile = typeof orientation !== undefined + '',
	    msPointer = window.navigator && window.navigator.msPointerEnabled &&
	              window.navigator.msMaxTouchPoints && !window.PointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
	             ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
	              window.matchMedia('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;


	// PhantomJS has 'ontouchstart' in document.documentElement, but doesn't actually support touch.
	// https://github.com/Leaflet/Leaflet/pull/1434#issuecomment-13843151

	var touch = !window.L_NO_TOUCH && !phantomjs && (function () {

		var startName = 'ontouchstart';

		// IE10+ (We simulate these into touch* events in L.DomEvent and L.DomEvent.Pointer) or WebKit, etc.
		if (pointer || (startName in doc)) {
			return true;
		}

		// Firefox/Gecko
		var div = document.createElement('div'),
		    supported = false;

		if (!div.setAttribute) {
			return false;
		}
		div.setAttribute(startName, 'return;');

		if (typeof div[startName] === 'function') {
			supported = true;
		}

		div.removeAttribute(startName);
		div = null;

		return supported;
	}());


	L.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina
	};

}());


/*
 * L.Point represents a point with x and y coordinates.
 */

L.Point = function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
	this.x = (round ? Math.round(x) : x);
	this.y = (round ? Math.round(y) : y);
};

L.Point.prototype = {

	clone: function () {
		return new L.Point(this.x, this.y);
	},

	// non-destructive, returns a new point
	add: function (point) {
		return this.clone()._add(L.point(point));
	},

	// destructive, used directly for performance in situations where it's safe to modify existing point
	_add: function (point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	subtract: function (point) {
		return this.clone()._subtract(L.point(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	distanceTo: function (point) {
		point = L.point(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	equals: function (point) {
		point = L.point(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	contains: function (point) {
		point = L.point(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	toString: function () {
		return 'Point(' +
		        L.Util.formatNum(this.x) + ', ' +
		        L.Util.formatNum(this.y) + ')';
	}
};

L.point = function (x, y, round) {
	if (x instanceof L.Point) {
		return x;
	}
	if (L.Util.isArray(x)) {
		return new L.Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	return new L.Point(x, y, round);
};


/*
 * L.Bounds represents a rectangular area on the screen in pixel coordinates.
 */

L.Bounds = function (a, b) { //(Point, Point) or Point[]
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
};

L.Bounds.prototype = {
	// extend the bounds to contain the given point
	extend: function (point) { // (Point)
		point = L.point(point);

		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	getCenter: function (round) { // (Boolean) -> Point
		return new L.Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	getBottomLeft: function () { // -> Point
		return new L.Point(this.min.x, this.max.y);
	},

	getTopRight: function () { // -> Point
		return new L.Point(this.max.x, this.min.y);
	},

	getSize: function () {
		return this.max.subtract(this.min);
	},

	contains: function (obj) { // (Bounds) or (Point) -> Boolean
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof L.Point) {
			obj = L.point(obj);
		} else {
			obj = L.bounds(obj);
		}

		if (obj instanceof L.Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = L.bounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};

L.bounds = function (a, b) { // (Bounds) or (Point, Point) or (Point[])
	if (!a || a instanceof L.Bounds) {
		return a;
	}
	return new L.Bounds(a, b);
};


/*
 * L.Transformation is an utility class to perform simple point transformations through a 2d-matrix.
 */

L.Transformation = function (a, b, c, d) {
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
};

L.Transformation.prototype = {
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	untransform: function (point, scale) {
		scale = scale || 1;
		return new L.Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};


/*
 * L.DomUtil contains various utility functions for working with DOM.
 */

L.DomUtil = {
	get: function (id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},

	getStyle: function (el, style) {

		var value = el.style[style];

		if (!value && el.currentStyle) {
			value = el.currentStyle[style];
		}

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	getViewportOffset: function (element) {

		var top = 0,
		    left = 0,
		    el = element,
		    docBody = document.body,
		    docEl = document.documentElement,
		    pos;

		do {
			top  += el.offsetTop  || 0;
			left += el.offsetLeft || 0;

			//add borders
			top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
			left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

			pos = L.DomUtil.getStyle(el, 'position');

			if (el.offsetParent === docBody && pos === 'absolute') { break; }

			if (pos === 'fixed') {
				top  += docBody.scrollTop  || docEl.scrollTop  || 0;
				left += docBody.scrollLeft || docEl.scrollLeft || 0;
				break;
			}

			if (pos === 'relative' && !el.offsetLeft) {
				var width = L.DomUtil.getStyle(el, 'width'),
				    maxWidth = L.DomUtil.getStyle(el, 'max-width'),
				    r = el.getBoundingClientRect();

				if (width !== 'none' || maxWidth !== 'none') {
					left += r.left + el.clientLeft;
				}

				//calculate full y offset since we're breaking out of the loop
				top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

				break;
			}

			el = el.offsetParent;

		} while (el);

		el = element;

		do {
			if (el === docBody) { break; }

			top  -= el.scrollTop  || 0;
			left -= el.scrollLeft || 0;

			el = el.parentNode;
		} while (el);

		return new L.Point(left, top);
	},

	documentIsLtr: function () {
		if (!L.DomUtil._docIsLtrCached) {
			L.DomUtil._docIsLtrCached = true;
			L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
		}
		return L.DomUtil._docIsLtr;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = L.DomUtil._getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = L.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!L.DomUtil.hasClass(el, name)) {
			var className = L.DomUtil._getClass(el);
			L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	_setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	_getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	getScaleString: function (scale, origin) {

		var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

		return preTranslateStr + scaleStr;
	},

	setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	}
};


// prefix style property names

L.DomUtil.TRANSFORM = L.DomUtil.testProp(
        ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

L.DomUtil.TRANSITION = L.DomUtil.testProp(
        ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

L.DomUtil.TRANSITION_END =
        L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ?
        L.DomUtil.TRANSITION + 'End' : 'transitionend';

(function () {
    if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
            },

            enableTextSelection: function () {
                L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
            }
        });
    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                if (userSelectProperty) {
                    var style = document.documentElement.style;
                    this._userSelect = style[userSelectProperty];
                    style[userSelectProperty] = 'none';
                }
            },

            enableTextSelection: function () {
                if (userSelectProperty) {
                    document.documentElement.style[userSelectProperty] = this._userSelect;
                    delete this._userSelect;
                }
            }
        });
    }

	L.extend(L.DomUtil, {
		disableImageDrag: function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		},

		enableImageDrag: function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		}
	});
})();


/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
	lat = parseFloat(lat);
	lng = parseFloat(lng);

	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = lat;
	this.lng = lng;

	if (alt !== undefined) {
		this.alt = parseFloat(alt);
	}
};

L.extend(L.LatLng, {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

L.LatLng.prototype = {
	equals: function (obj) { // (LatLng) -> Boolean
		if (!obj) { return false; }

		obj = L.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= L.LatLng.MAX_MARGIN;
	},

	toString: function (precision) { // (Number) -> String
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	},

	// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
	// TODO move to projection code, LatLng shouldn't know about Earth
	distanceTo: function (other) { // (LatLng) -> Number
		other = L.latLng(other);

		var R = 6378137, // earth radius in meters
		    d2r = L.LatLng.DEG_TO_RAD,
		    dLat = (other.lat - this.lat) * d2r,
		    dLon = (other.lng - this.lng) * d2r,
		    lat1 = this.lat * d2r,
		    lat2 = other.lat * d2r,
		    sin1 = Math.sin(dLat / 2),
		    sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	},

	wrap: function (a, b) { // (Number, Number) -> LatLng
		var lng = this.lng;

		a = a || -180;
		b = b ||  180;

		lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);

		return new L.LatLng(this.lat, lng);
	}
};

L.latLng = function (a, b) { // (LatLng) or ([Number, Number]) or (Number, Number)
	if (a instanceof L.LatLng) {
		return a;
	}
	if (L.Util.isArray(a)) {
		if (typeof a[0] === 'number' || typeof a[0] === 'string') {
			return new L.LatLng(a[0], a[1], a[2]);
		} else {
			return null;
		}
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new L.LatLng(a, b);
};



/*
 * L.LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */

L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
	if (!southWest) { return; }

	var latlngs = northEast ? [southWest, northEast] : southWest;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
};

L.LatLngBounds.prototype = {
	// extend the bounds to contain the given point or bounds
	extend: function (obj) { // (LatLng) or (LatLngBounds)
		if (!obj) { return this; }

		var latLng = L.latLng(obj);
		if (latLng !== null) {
			obj = latLng;
		} else {
			obj = L.latLngBounds(obj);
		}

		if (obj instanceof L.LatLng) {
			if (!this._southWest && !this._northEast) {
				this._southWest = new L.LatLng(obj.lat, obj.lng);
				this._northEast = new L.LatLng(obj.lat, obj.lng);
			} else {
				this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
				this._southWest.lng = Math.min(obj.lng, this._southWest.lng);

				this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
				this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
			}
		} else if (obj instanceof L.LatLngBounds) {
			this.extend(obj._southWest);
			this.extend(obj._northEast);
		}
		return this;
	},

	// extend the bounds by a percentage
	pad: function (bufferRatio) { // (Number) -> LatLngBounds
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new L.LatLngBounds(
		        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	getCenter: function () { // -> LatLng
		return new L.LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	getSouthWest: function () {
		return this._southWest;
	},

	getNorthEast: function () {
		return this._northEast;
	},

	getNorthWest: function () {
		return new L.LatLng(this.getNorth(), this.getWest());
	},

	getSouthEast: function () {
		return new L.LatLng(this.getSouth(), this.getEast());
	},

	getWest: function () {
		return this._southWest.lng;
	},

	getSouth: function () {
		return this._southWest.lat;
	},

	getEast: function () {
		return this._northEast.lng;
	},

	getNorth: function () {
		return this._northEast.lat;
	},

	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
			obj = L.latLng(obj);
		} else {
			obj = L.latLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof L.LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	intersects: function (bounds) { // (LatLngBounds)
		bounds = L.latLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	equals: function (bounds) { // (LatLngBounds)
		if (!bounds) { return false; }

		bounds = L.latLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest()) &&
		       this._northEast.equals(bounds.getNorthEast());
	},

	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

//TODO International date line?

L.latLngBounds = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
	if (!a || a instanceof L.LatLngBounds) {
		return a;
	}
	return new L.LatLngBounds(a, b);
};


/*
 * L.Projection contains various geographical projections used by CRS classes.
 */

L.Projection = {};


/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};


/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

L.Projection.LonLat = {
	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	}
};


/*
 * L.CRS is a base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */

L.CRS = {
	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	project: function (latlng) {
		return this.projection.project(latlng);
	},

	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	}
};


/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

L.CRS.Simple = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	}
});


/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping
 * and is used by Leaflet by default.
 */

L.CRS.EPSG3857 = L.extend({}, L.CRS, {
	code: 'EPSG:3857',

	projection: L.Projection.SphericalMercator,
	transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

	project: function (latlng) { // (LatLng) -> Point
		var projectedPoint = this.projection.project(latlng),
		    earthRadius = 6378137;
		return projectedPoint.multiplyBy(earthRadius);
	}
});

L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
	code: 'EPSG:900913'
});


/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS, {
	code: 'EPSG:4326',

	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
});


/*
 * L.Map is the central class of the API - it is used to create a map.
 */

L.Map = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		crs: L.CRS.EPSG3857,

		/*
		center: LatLng,
		zoom: Number,
		layers: Array,
		*/

		fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
		trackResize: true,
		markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = L.setOptions(this, options);


		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = L.bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(L.latLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];

		this._layers = {};
		this._zoomBoundLayers = {};
		this._tileLayersNum = 0;

		this.callInitHooks();

		this._addLayers(options.layers);
	},


	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	setView: function (center, zoom) {
		zoom = zoom === undefined ? this.getZoom() : zoom;
		this._resetView(L.latLng(center), this._limitZoom(zoom));
		return this;
	},

	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = this._limitZoom(zoom);
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	zoomIn: function (delta, options) {
		return this.setZoom(this._zoom + (delta || 1), options);
	},

	zoomOut: function (delta, options) {
		return this.setZoom(this._zoom - (delta || 1), options);
	},

	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	fitBounds: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
		    paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

		return this.setView(center, zoom, options);
	},

	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	panBy: function (offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart');

		this._rawPanBy(L.point(offset));

		this.fire('move');
		return this.fire('moveend');
	},

	setMaxBounds: function (bounds) {
		bounds = L.latLngBounds(bounds);

		this.options.maxBounds = bounds;

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds, this);
		}

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds, this);
	},

	panInsideBounds: function (bounds, options) {
		var center = this.getCenter(),
			newCenter = this._limitCenter(center, this._zoom, bounds);

		if (center.equals(newCenter)) { return this; }

		return this.panTo(newCenter, options);
	},

	addLayer: function (layer) {
		// TODO method is too big, refactor

		var id = L.stamp(layer);

		if (this._layers[id]) { return this; }

		this._layers[id] = layer;

		// TODO getMaxZoom, getMinZoom in ILayer (instead of options)
		if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
			this._zoomBoundLayers[id] = layer;
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor!!!
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum++;
			this._tileLayersToLoad++;
			layer.on('load', this._onTileLayerLoad, this);
		}

		if (this._loaded) {
			this._layerAdd(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
		}

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum--;
			this._tileLayersToLoad--;
			layer.off('load', this._onTileLayerLoad, this);
		}

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (L.stamp(layer) in this._layers);
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = L.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._initialCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// TODO handler.addTo
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	remove: function () {
		if (this._loaded) {
			this.fire('unload');
		}

		this._initEvents('off');

		try {
			// throws error in IE6-8
			delete this._container._leaflet;
		} catch (e) {
			this._container._leaflet = undefined;
		}

		this._clearPanes();
		if (this._clearControlPos) {
			this._clearControlPos();
		}

		this._clearHandlers();

		return this;
	},


	// public methods for getting map state

	getCenter: function () { // (Boolean) -> LatLng
		this._checkIfLoaded();

		if (this._initialCenter && !this._moved()) {
			return this._initialCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	getZoom: function () {
		return this._zoom;
	},

	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new L.LatLngBounds(sw, ne);
	},

	getMinZoom: function () {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom;
	},

	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize;

		padding = L.point(padding || [0, 0]);

		do {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;

		} while (zoomNotFound && zoom <= maxZoom);

		if (zoomNotFound && inside) {
			return null;
		}

		return inside ? zoom : zoom - 1;
	},

	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	getPixelBounds: function () {
		var topLeftPoint = this._getTopLeftPoint();
		return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._initialTopLeftPoint;
	},

	getPanes: function () {
		return this._panes;
	},

	getContainer: function () {
		return this._container;
	},


	// TODO replace with universal implementation after refactoring projections

	getZoomScale: function (toZoom) {
		var crs = this.options.crs;
		return crs.scale(toZoom) / crs.scale(this._zoom);
	},

	getScaleZoom: function (scale) {
		return this._zoom + (Math.log(scale) / Math.LN2);
	},


	// conversion methods

	project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
	},

	unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(L.point(point), zoom);
	},

	layerPointToLatLng: function (point) { // (Point)
		var projectedPoint = L.point(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	latLngToLayerPoint: function (latlng) { // (LatLng)
		var projectedPoint = this.project(L.latLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	containerPointToLayerPoint: function (point) { // (Point)
		return L.point(point).subtract(this._getMapPanePos());
	},

	layerPointToContainerPoint: function (point) { // (Point)
		return L.point(point).add(this._getMapPanePos());
	},

	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(L.point(point));
		return this.layerPointToLatLng(layerPoint);
	},

	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
	},

	mouseEventToContainerPoint: function (e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container);
	},

	mouseEventToLayerPoint: function (e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = L.DomUtil.get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		container._leaflet = true;
	},

	_initLayout: function () {
		var container = this._container;

		L.DomUtil.addClass(container, 'leaflet-container' +
			(L.Browser.touch ? ' leaflet-touch' : '') +
			(L.Browser.retina ? ' leaflet-retina' : '') +
			(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
			(this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));

		var position = L.DomUtil.getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};

		this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

		this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
		panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
		panes.shadowPane = this._createPane('leaflet-shadow-pane');
		panes.overlayPane = this._createPane('leaflet-overlay-pane');
		panes.markerPane = this._createPane('leaflet-marker-pane');
		panes.popupPane = this._createPane('leaflet-popup-pane');

		var zoomHide = ' leaflet-zoom-hide';

		if (!this.options.markerZoomAnimation) {
			L.DomUtil.addClass(panes.markerPane, zoomHide);
			L.DomUtil.addClass(panes.shadowPane, zoomHide);
			L.DomUtil.addClass(panes.popupPane, zoomHide);
		}
	},

	_createPane: function (className, container) {
		return L.DomUtil.create('div', className, container || this._panes.objectsPane);
	},

	_clearPanes: function () {
		this._container.removeChild(this._mapPane);
	},

	_addLayers: function (layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},


	// private methods that modify map state

	_resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

		var zoomChanged = (this._zoom !== zoom);

		if (!afterZoomAnim) {
			this.fire('movestart');

			if (zoomChanged) {
				this.fire('zoomstart');
			}
		}

		this._zoom = zoom;
		this._initialCenter = center;

		this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

		if (!preserveMapOffset) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
		} else {
			this._initialTopLeftPoint._add(this._getMapPanePos());
		}

		this._tileLayersToLoad = this._tileLayersNum;

		var loading = !this._loaded;
		this._loaded = true;

		this.fire('viewreset', {hard: !preserveMapOffset});

		if (loading) {
			this.fire('load');
			this.eachLayer(this._layerAdd, this);
		}

		this.fire('move');

		if (zoomChanged || afterZoomAnim) {
			this.fire('zoomend');
		}

		this.fire('moveend', {hard: !preserveMapOffset});
	},

	_rawPanBy: function (offset) {
		L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_updateZoomLevels: function () {
		var i,
			minZoom = Infinity,
			maxZoom = -Infinity,
			oldZoomSpan = this._getZoomSpan();

		for (i in this._zoomBoundLayers) {
			var layer = this._zoomBoundLayers[i];
			if (!isNaN(layer.options.minZoom)) {
				minZoom = Math.min(minZoom, layer.options.minZoom);
			}
			if (!isNaN(layer.options.maxZoom)) {
				maxZoom = Math.max(maxZoom, layer.options.maxZoom);
			}
		}

		if (i === undefined) { // we have no tilelayers
			this._layersMaxZoom = this._layersMinZoom = undefined;
		} else {
			this._layersMaxZoom = maxZoom;
			this._layersMinZoom = minZoom;
		}

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}
	},

	_panInsideMaxBounds: function () {
		this.panInsideBounds(this.options.maxBounds);
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// map events

	_initEvents: function (onOff) {
		if (!L.DomEvent) { return; }

		onOff = onOff || 'on';

		L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

		var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
		              'mouseleave', 'mousemove', 'contextmenu'],
		    i, len;

		for (i = 0, len = events.length; i < len; i++) {
			L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
		}

		if (this.options.trackResize) {
			L.DomEvent[onOff](window, 'resize', this._onResize, this);
		}
	},

	_onResize: function () {
		L.Util.cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = L.Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this, false, this._container);
	},

	_onMouseClick: function (e) {
		if (!this._loaded || (!e._simulated &&
		        ((this.dragging && this.dragging.moved()) ||
		         (this.boxZoom  && this.boxZoom.moved()))) ||
		            L.DomEvent._skipped(e)) { return; }

		this.fire('preclick');
		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._loaded || L.DomEvent._skipped(e)) { return; }

		var type = e.type;

		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) { return; }

		if (type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}

		var containerPoint = this.mouseEventToContainerPoint(e),
		    layerPoint = this.containerPointToLayerPoint(containerPoint),
		    latlng = this.layerPointToLatLng(layerPoint);

		this.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});
	},

	_onTileLayerLoad: function () {
		this._tileLayersToLoad--;
		if (this._tileLayersNum && !this._tileLayersToLoad) {
			this.fire('tilelayersload');
		}
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, this);
		} else {
			this.on('load', callback, context);
		}
		return this;
	},

	_layerAdd: function (layer) {
		layer.onAdd(this);
		this.fire('layeradd', {layer: layer});
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return L.DomUtil.getPosition(this._mapPane);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function () {
		return this.getPixelOrigin().subtract(this._getMapPanePos());
	},

	_getNewTopLeftPoint: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		// TODO round on display, not calculation to increase precision?
		return this.project(center, zoom)._subtract(viewHalf)._round();
	},

	_latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
		var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
		return this.project(latlng, newZoom)._subtract(topLeft);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
		    seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),

		    dx = this._rebound(nwOffset.x, -seOffset.x),
		    dy = this._rebound(nwOffset.y, -seOffset.y);

		return new L.Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom();

		return Math.max(min, Math.min(max, zoom));
	}
});

L.map = function (id, options) {
	return new L.Map(id, options);
};


/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {
	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    x = latlng.lng * d * r,
		    y = lat * d,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    lng = point.x * d / r,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};



L.CRS.EPSG3395 = L.extend({}, L.CRS, {
	code: 'EPSG:3395',

	projection: L.Projection.Mercator,

	transformation: (function () {
		var m = L.Projection.Mercator,
		    r = m.R_MAJOR,
		    scale = 0.5 / (Math.PI * r);

		return new L.Transformation(scale, 0.5, -scale, 0.5);
	}())
});


/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		zoomOffset: 0,
		opacity: 1,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
	},

	onAdd: function (map) {
		this._map = map;
		this._animated = map._zoomAnimated;

		// create a container div for tiles
		this._initContainer();

		// set up events
		map.on({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
			map.on('move', this._limitedUpdate, this);
		}

		this._reset();
		this._update();
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		this._container.parentNode.removeChild(this._container);

		map.off({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.off({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			map.off('move', this._limitedUpdate, this);
		}

		this._container = null;
		this._map = null;
	},

	bringToFront: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.appendChild(this._container);
			this._setAutoZIndex(pane, Math.max);
		}

		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.insertBefore(this._container, pane.firstChild);
			this._setAutoZIndex(pane, Math.min);
		}

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getContainer: function () {
		return this._container;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}
		return this;
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
		var i,
		    tiles = this._tiles;

		if (L.Browser.ielt9) {
			for (i in tiles) {
				L.DomUtil.setOpacity(tiles[i], this.options.opacity);
			}
		} else {
			L.DomUtil.setOpacity(this._container, this.options.opacity);
		}
	},

	_initContainer: function () {
		var tilePane = this._map._panes.tilePane;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			if (this._animated) {
				var className = 'leaflet-tile-container';

				this._bgBuffer = L.DomUtil.create('div', className, this._container);
				this._tileContainer = L.DomUtil.create('div', className, this._container);

			} else {
				this._tileContainer = this._container;
			}

			tilePane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},

	_reset: function (e) {
		for (var key in this._tiles) {
			this.fire('tileunload', {tile: this._tiles[key]});
		}

		this._tiles = {};
		this._tilesToLoad = 0;

		if (this.options.reuseTiles) {
			this._unusedTiles = [];
		}

		this._tileContainer.innerHTML = '';

		if (this._animated && e && e.hard) {
			this._clearBgBuffer();
		}

		this._initContainer();
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_addTilesFromCenterOut: function (bounds) {
		var queue = [],
		    center = bounds.getCenter();

		var j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);

				if (this._tileShouldBeLoaded(point)) {
					queue.push(point);
				}
			}
		}

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		// load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._tilesToLoad) {
			this.fire('loading');
		}

		this._tilesToLoad += tilesToLoad;

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		this._tileContainer.appendChild(fragment);
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = options.tileSize,
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_removeOtherTiles: function (bounds) {
		var kArr, x, y, key;

		for (key in this._tiles) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);

			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];

		this.fire('tileunload', {tile: tile, url: tile.src});

		if (this.options.reuseTiles) {
			L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
			this._unusedTiles.push(tile);

		} else if (tile.parentNode === this._tileContainer) {
			this._tileContainer.removeChild(tile);
		}

		// for https://github.com/CloudMade/Leaflet/issues/137
		if (!L.Browser.android) {
			tile.onload = null;
			tile.src = L.Util.emptyImageUrl;
		}

		delete this._tiles[key];
	},

	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getZoomForUrl: function () {

		var options = this.options,
		    zoom = this._map.getZoom();

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}

		zoom += options.zoomOffset;

		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return tilePoint.multiplyBy(tileSize).subtract(origin);
	},

	// image-specific code (override to implement e.g. Canvas or SVG tile layer)

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getTile: function () {
		if (this.options.reuseTiles && this._unusedTiles.length > 0) {
			var tile = this._unusedTiles.pop();
			this._resetTile(tile);
			return tile;
		}
		return this._createTile();
	},

	// Override if data stored on a tile needs to be cleaned up before reuse
	_resetTile: function (/*tile*/) {},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = tile.style.height = this._getTileSize() + 'px';
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},

	_tileLoaded: function () {
		this._tilesToLoad--;

		if (this._animated) {
			L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
		}

		if (!this._tilesToLoad) {
			this.fire('load');

			if (this._animated) {
				// clear scaled tiles after all new tiles are loaded (for performance)
				clearTimeout(this._clearBgBufferTimer);
				this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
			}
		}
	},

	_tileOnLoad: function () {
		var layer = this._layer;

		//Only if we are loading an actual image
		if (this.src !== L.Util.emptyImageUrl) {
			L.DomUtil.addClass(this, 'leaflet-tile-loaded');

			layer.fire('tileload', {
				tile: this,
				url: this.src
			});
		}

		layer._tileLoaded();
	},

	_tileOnError: function () {
		var layer = this._layer;

		layer.fire('tileerror', {
			tile: this,
			url: this.src
		});

		var newUrl = layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}

		layer._tileLoaded();
	}
});

L.tileLayer = function (url, options) {
	return new L.TileLayer(url, options);
};


/*
 * L.TileLayer.WMS is used for putting WMS tile layers on the map.
 */

L.TileLayer.WMS = L.TileLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)

		this._url = url;

		var wmsParams = L.extend({}, this.defaultWmsParams),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;

		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		    tileSize = this.options.tileSize,

		    nwPoint = tilePoint.multiplyBy(tileSize),
		    sePoint = nwPoint.add([tileSize, tileSize]),

		    nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		    se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		    bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
		        [se.y, nw.x, nw.y, se.x].join(',') :
		        [nw.x, se.y, se.x, nw.y].join(','),

		    url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

		return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.tileLayer.wms = function (url, options) {
	return new L.TileLayer.WMS(url, options);
};


/*
 * L.TileLayer.Canvas is a class that you can use as a base for creating
 * dynamically drawn Canvas-based tile layers.
 */

L.TileLayer.Canvas = L.TileLayer.extend({
	options: {
		async: false
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}

		for (var i in this._tiles) {
			this._redrawTile(this._tiles[i]);
		}
		return this;
	},

	_redrawTile: function (tile) {
		this.drawTile(tile, tile._tilePoint, this._map._zoom);
	},

	_createTile: function () {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		tile.width = tile.height = this.options.tileSize;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer = this;
		tile._tilePoint = tilePoint;

		this._redrawTile(tile);

		if (!this.options.async) {
			this.tileDrawn(tile);
		}
	},

	drawTile: function (/*tile, tilePoint*/) {
		// override with rendering code
	},

	tileDrawn: function (tile) {
		this._tileOnLoad.call(tile);
	}
});


L.tileLayer.canvas = function (options) {
	return new L.TileLayer.Canvas(options);
};


/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._image);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		this._image = L.DomUtil.create('img', 'leaflet-image-layer');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._image, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			src: this._url
		});
	},

	_animateZoom: function (e) {
		var map = this._map,
		    image = this._image,
		    scale = map.getZoomScale(e.zoom),
		    nw = this._bounds.getNorthWest(),
		    se = this._bounds.getSouthEast(),

		    topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
		    size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
		    origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

		image.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
	},

	_reset: function () {
		var image   = this._image,
		    topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		    size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

		L.DomUtil.setPosition(image, topLeft);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

L.imageOverlay = function (url, bounds, options) {
	return new L.ImageOverlay(url, bounds, options);
};


/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

L.Icon = L.Class.extend({
	options: {
		/*
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		*/
		className: ''
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img;
		if (!oldIcon || oldIcon.tagName !== 'IMG') {
			img = this._createImg(src);
		} else {
			img = this._createImg(src, oldIcon);
		}
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options,
		    size = L.point(options[name + 'Size']),
		    anchor;

		if (name === 'shadow') {
			anchor = L.point(options.shadowAnchor || options.iconAnchor);
		} else {
			anchor = L.point(options.iconAnchor);
		}

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		img.className = 'leaflet-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
			return this.options[name + 'RetinaUrl'];
		}
		return this.options[name + 'Url'];
	}
});

L.icon = function (options) {
	return new L.Icon(options);
};


/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

L.Icon.Default = L.Icon.extend({

	options: {
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],

		shadowSize: [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		if (L.Browser.retina && name === 'icon') {
			name += '-2x';
		}

		var path = L.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + '.png';
	}
});

L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, matches, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;
		matches = src.match(leafletRe);

		if (matches) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());


/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		icon: new L.Icon.Default(),
		title: '',
		alt: '',
		clickable: true,
		draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		this._map = map;

		map.on('viewreset', this.update, this);

		this._initIcon();
		this.update();
		this.fire('add');

		if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
			map.on('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		if (this.dragging) {
			this.dragging.disable();
		}

		this._removeIcon();
		this._removeShadow();

		this.fire('remove');

		map.off({
			'viewreset': this.update,
			'zoomanim': this._animateZoom
		}, this);

		this._map = null;
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);

		this.update();

		return this.fire('move', { latlng: this._latlng });
	},

	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		this.update();

		return this;
	},

	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup);
		}

		return this;
	},

	update: function () {
		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    map = this._map,
		    animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
		    classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

		var icon = options.icon.createIcon(this._icon),
			addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}
			
			if (options.alt) {
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		this._initInteraction();

		if (options.riseOnHover) {
			L.DomEvent
				.on(icon, 'mouseover', this._bringToFront, this)
				.on(icon, 'mouseout', this._resetZIndex, this);
		}

		var newShadow = options.icon.createShadow(this._shadow),
			addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		var panes = this._map._panes;

		if (addIcon) {
			panes.markerPane.appendChild(this._icon);
		}

		if (newShadow && addShadow) {
			panes.shadowPane.appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			L.DomEvent
			    .off(this._icon, 'mouseover', this._bringToFront)
			    .off(this._icon, 'mouseout', this._resetZIndex);
		}

		this._map._panes.markerPane.removeChild(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			this._map._panes.shadowPane.removeChild(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.clickable) { return; }

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
		    events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_onMouseClick: function (e) {
		var wasDragged = this.dragging && this.dragging.moved();

		if (this.hasEventListeners(e.type) || wasDragged) {
			L.DomEvent.stopPropagation(e);
		}

		if (wasDragged) { return; }

		if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});
	},

	_onKeyPress: function (e) {
		if (e.keyCode === 13) {
			this.fire('click', {
				originalEvent: e,
				latlng: this._latlng
			});
		}
	},

	_fireMouseEvent: function (e) {

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._icon, this.options.opacity);
		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, this.options.opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};


/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

L.DivIcon = L.Icon.extend({
	options: {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html !== false) {
			div.innerHTML = options.html;
		} else {
			div.innerHTML = '';
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}

		this._setIconStyles(div, 'icon');
		return div;
	},

	createShadow: function () {
		return null;
	}
});

L.divIcon = function (options) {
	return new L.DivIcon(options);
};


/*
 * L.Popup is used for displaying popups on the map.
 */

L.Map.mergeOptions({
	closePopupOnClick: true
});

L.Popup = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minWidth: 50,
		maxWidth: 300,
		// maxHeight: null,
		autoPan: true,
		closeButton: true,
		offset: [0, 7],
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: null,
		// autoPanPaddingBottomRight: null,
		keepInView: false,
		className: '',
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on(this._getEvents(), this);

		this.update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}

		this.fire('open');

		map.fire('popupopen', {popup: this});

		if (this._source) {
			this._source.fire('popupopen', {popup: this});
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onRemove: function (map) {
		map._panes.popupPane.removeChild(this._container);

		L.Util.falseFn(this._container.offsetWidth); // force reflow

		map.off(this._getEvents(), this);

		if (map.options.fadeAnimation) {
			L.DomUtil.setOpacity(this._container, 0);
		}

		this._map = null;

		this.fire('close');

		map.fire('popupclose', {popup: this});

		if (this._source) {
			this._source.fire('popupclose', {popup: this});
		}
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	_getEvents: function () {
		var events = {
			viewreset: this._updatePosition
		};

		if (this._animated) {
			events.zoomanim = this._zoomAnimation;
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
			containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' +
			        (this._animated ? 'animated' : 'hide'),
			container = this._container = L.DomUtil.create('div', containerClass),
			closeButton;

		if (this.options.closeButton) {
			closeButton = this._closeButton =
			        L.DomUtil.create('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';
			L.DomEvent.disableClickPropagation(closeButton);

			L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		}

		var wrapper = this._wrapper =
		        L.DomUtil.create('div', prefix + '-content-wrapper', container);
		L.DomEvent.disableClickPropagation(wrapper);

		this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

		L.DomEvent.disableScrollPropagation(this._contentNode);
		L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

		this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
		this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
	},

	_updateContent: function () {
		if (!this._content) { return; }

		if (typeof this._content === 'string') {
			this._contentNode.innerHTML = this._content;
		} else {
			while (this._contentNode.hasChildNodes()) {
				this._contentNode.removeChild(this._contentNode.firstChild);
			}
			this._contentNode.appendChild(this._content);
		}
		this.fire('contentupdate');
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			L.DomUtil.addClass(container, scrolledClass);
		} else {
			L.DomUtil.removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    animated = this._animated,
		    offset = L.point(this.options.offset);

		if (animated) {
			L.DomUtil.setPosition(this._container, pos);
		}

		this._containerBottom = -offset.y - (animated ? 0 : pos.y);
		this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = this._containerBottom + 'px';
		this._container.style.left = this._containerLeft + 'px';
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);

		L.DomUtil.setPosition(this._container, pos);
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,

		    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

		if (this._animated) {
			layerPos._add(L.DomUtil.getPosition(this._container));
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = L.point(this.options.autoPanPadding),
		    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		L.DomEvent.stop(e);
	}
});

L.popup = function (options, source) {
	return new L.Popup(options, source);
};


L.Map.include({
	openPopup: function (popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		this.closePopup();

		if (!(popup instanceof L.Popup)) {
			var content = popup;

			popup = new L.Popup(options)
			    .setLatLng(latlng)
			    .setContent(content);
		}
		popup._isOpen = true;

		this._popup = popup;
		return this.addLayer(popup);
	},

	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
			popup._isOpen = false;
		}
		return this;
	}
});


/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	openPopup: function () {
		if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
			this._popup.setLatLng(this._latlng);
			this._map.openPopup(this._popup);
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	togglePopup: function () {
		if (this._popup) {
			if (this._popup._isOpen) {
				this.closePopup();
			} else {
				this.openPopup();
			}
		}
		return this;
	},

	bindPopup: function (content, options) {
		var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

		anchor = anchor.add(L.Popup.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.extend({offset: anchor}, options);

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this.togglePopup, this)
			    .on('remove', this.closePopup, this)
			    .on('move', this._movePopup, this);
			this._popupHandlersAdded = true;
		}

		if (content instanceof L.Popup) {
			L.setOptions(content, options);
			this._popup = content;
		} else {
			this._popup = new L.Popup(options, this)
				.setContent(content);
		}

		return this;
	},

	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this.togglePopup, this)
			    .off('remove', this.closePopup, this)
			    .off('move', this._movePopup, this);
			this._popupHandlersAdded = false;
		}
		return this;
	},

	getPopup: function () {
		return this._popup;
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	}
});


/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

L.LayerGroup = L.Class.extend({
	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	clearLayers: function () {
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
		this._map = null;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	getLayer: function (id) {
		return this._layers[id];
	},

	getLayers: function () {
		var layers = [];

		for (var i in this._layers) {
			layers.push(this._layers[i]);
		}
		return layers;
	},

	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	getLayerId: function (layer) {
		return L.stamp(layer);
	}
});

L.layerGroup = function (layers) {
	return new L.LayerGroup(layers);
};


/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

L.FeatureGroup = L.LayerGroup.extend({
	includes: L.Mixin.Events,

	statics: {
		EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'
	},

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		if ('on' in layer) {
			layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.addLayer.call(this, layer);

		if (this._popupContent && layer.bindPopup) {
			layer.bindPopup(this._popupContent, this._popupOptions);
		}

		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);

		L.LayerGroup.prototype.removeLayer.call(this, layer);

		if (this._popupContent) {
			this.invoke('unbindPopup');
		}

		return this.fire('layerremove', {layer: layer});
	},

	bindPopup: function (content, options) {
		this._popupContent = content;
		this._popupOptions = options;
		return this.invoke('bindPopup', content, options);
	},

	openPopup: function (latlng) {
		// open popup on the first layer
		for (var id in this._layers) {
			this._layers[id].openPopup(latlng);
			break;
		}
		return this;
	},

	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	},

	_propagateEvent: function (e) {
		e = L.extend({
			layer: e.target,
			target: this
		}, e);
		this.fire(e.type, e);
	}
});

L.featureGroup = function (layers) {
	return new L.FeatureGroup(layers);
};


/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Class.extend({
	includes: [L.Mixin.Events],

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		dashArray: null,
		lineCap: null,
		lineJoin: null,
		weight: 5,
		opacity: 0.5,

		fill: false,
		fillColor: null, //same as color by default
		fillOpacity: 0.2,

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	projectLatlngs: function () {
		// do all projection stuff here
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});


/*
 * Extends L.Path with SVG-specific rendering code.
 */

L.Path.SVG_NS = 'http://www.w3.org/2000/svg';

L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);

L.Path = L.Path.extend({
	statics: {
		SVG: L.Browser.svg
	},

	bringToFront: function () {
		var root = this._map._pathRoot,
		    path = this._container;

		if (path && root.lastChild !== path) {
			root.appendChild(path);
		}
		return this;
	},

	bringToBack: function () {
		var root = this._map._pathRoot,
		    path = this._container,
		    first = root.firstChild;

		if (path && first !== path) {
			root.insertBefore(path, first);
		}
		return this;
	},

	getPathString: function () {
		// form path string here
	},

	_createElement: function (name) {
		return document.createElementNS(L.Path.SVG_NS, name);
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_initPath: function () {
		this._container = this._createElement('g');

		this._path = this._createElement('path');

		if (this.options.className) {
			L.DomUtil.addClass(this._path, this.options.className);
		}

		this._container.appendChild(this._path);
	},

	_initStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke-linejoin', 'round');
			this._path.setAttribute('stroke-linecap', 'round');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill-rule', 'evenodd');
		}
		if (this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', this.options.pointerEvents);
		}
		if (!this.options.clickable && !this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', 'none');
		}
		this._updateStyle();
	},

	_updateStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke', this.options.color);
			this._path.setAttribute('stroke-opacity', this.options.opacity);
			this._path.setAttribute('stroke-width', this.options.weight);
			if (this.options.dashArray) {
				this._path.setAttribute('stroke-dasharray', this.options.dashArray);
			} else {
				this._path.removeAttribute('stroke-dasharray');
			}
			if (this.options.lineCap) {
				this._path.setAttribute('stroke-linecap', this.options.lineCap);
			}
			if (this.options.lineJoin) {
				this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
			}
		} else {
			this._path.setAttribute('stroke', 'none');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill', this.options.fillColor || this.options.color);
			this._path.setAttribute('fill-opacity', this.options.fillOpacity);
		} else {
			this._path.setAttribute('fill', 'none');
		}
	},

	_updatePath: function () {
		var str = this.getPathString();
		if (!str) {
			// fix webkit empty string parsing bug
			str = 'M0 0';
		}
		this._path.setAttribute('d', str);
	},

	// TODO remove duplication with L.Map
	_initEvents: function () {
		if (this.options.clickable) {
			if (L.Browser.svg || !L.Browser.vml) {
				L.DomUtil.addClass(this._path, 'leaflet-clickable');
			}

			L.DomEvent.on(this._container, 'click', this._onMouseClick, this);

			var events = ['dblclick', 'mousedown', 'mouseover',
			              'mouseout', 'mousemove', 'contextmenu'];
			for (var i = 0; i < events.length; i++) {
				L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
			}
		}
	},

	_onMouseClick: function (e) {
		if (this._map.dragging && this._map.dragging.moved()) { return; }

		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this.hasEventListeners(e.type)) { return; }

		var map = this._map,
		    containerPoint = map.mouseEventToContainerPoint(e),
		    layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this.fire(e.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});

		if (e.type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousemove') {
			L.DomEvent.stopPropagation(e);
		}
	}
});

L.Map.include({
	_initPathRoot: function () {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._panes.overlayPane.appendChild(this._pathRoot);

			if (this.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

				this.on({
					'zoomanim': this._animatePathZoom,
					'zoomend': this._endPathZoom
				});
			} else {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
			}

			this.on('moveend', this._updateSvgViewport);
			this._updateSvgViewport();
		}
	},

	_animatePathZoom: function (e) {
		var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

		this._pathZooming = true;
	},

	_endPathZoom: function () {
		this._pathZooming = false;
	},

	_updateSvgViewport: function () {

		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});


/*
 * Popup extension to L.Path (polylines, polygons, circles), adding popup-related methods.
 */

L.Path.include({

	bindPopup: function (content, options) {

		if (content instanceof L.Popup) {
			this._popup = content;
		} else {
			if (!this._popup || options) {
				this._popup = new L.Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this._openPopup, this)
			    .on('remove', this.closePopup, this);

			this._popupHandlersAdded = true;
		}

		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this._openPopup)
			    .off('remove', this.closePopup);

			this._popupHandlersAdded = false;
		}
		return this;
	},

	openPopup: function (latlng) {

		if (this._popup) {
			// open the popup from one of the path's points if not specified
			latlng = latlng || this._latlng ||
			         this._latlngs[Math.floor(this._latlngs.length / 2)];

			this._openPopup({latlng: latlng});
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	_openPopup: function (e) {
		this._popup.setLatLng(e.latlng);
		this._map.openPopup(this._popup);
	}
});


/*
 * Vector rendering for IE6-8 through VML.
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */

L.Browser.vml = !L.Browser.svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());

L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
	statics: {
		VML: true,
		CLIP_PADDING: 0.02
	},

	_createElement: (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement(
				        '<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	}()),

	_initPath: function () {
		var container = this._container = this._createElement('shape');

		L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

		if (this.options.clickable) {
			L.DomUtil.addClass(container, 'leaflet-clickable');
		}

		container.coordsize = '1 1';

		this._path = this._createElement('path');
		container.appendChild(this._path);

		this._map._pathRoot.appendChild(container);
	},

	_initStyle: function () {
		this._updateStyle();
	},

	_updateStyle: function () {
		var stroke = this._stroke,
		    fill = this._fill,
		    options = this.options,
		    container = this._container;

		container.stroked = options.stroke;
		container.filled = options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = this._stroke = this._createElement('stroke');
				stroke.endcap = 'round';
				container.appendChild(stroke);
			}
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = L.Util.isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			if (options.lineCap) {
				stroke.endcap = options.lineCap.replace('butt', 'flat');
			}
			if (options.lineJoin) {
				stroke.joinstyle = options.lineJoin;
			}

		} else if (stroke) {
			container.removeChild(stroke);
			this._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = this._fill = this._createElement('fill');
				container.appendChild(fill);
			}
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			this._fill = null;
		}
	},

	_updatePath: function () {
		var style = this._container.style;

		style.display = 'none';
		this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
		style.display = '';
	}
});

L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
	_initPathRoot: function () {
		if (this._pathRoot) { return; }

		var root = this._pathRoot = document.createElement('div');
		root.className = 'leaflet-vml-container';
		this._panes.overlayPane.appendChild(root);

		this.on('moveend', this._updatePathViewport);
		this._updatePathViewport();
	}
});


/*
 * Vector rendering for all browsers that support canvas.
 */

L.Browser.canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
	statics: {
		//CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
		CANVAS: true,
		SVG: false
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._requestUpdate();
		}
		return this;
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._map) {
			this._updateStyle();
			this._requestUpdate();
		}
		return this;
	},

	onRemove: function (map) {
		map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

		if (this.options.clickable) {
			this._map.off('click', this._onClick, this);
			this._map.off('mousemove', this._onMouseMove, this);
		}

		this._requestUpdate();
		
		this.fire('remove');
		this._map = null;
	},

	_requestUpdate: function () {
		if (this._map && !L.Path._updateRequest) {
			L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
		}
	},

	_fireMapMoveEnd: function () {
		L.Path._updateRequest = null;
		this.fire('moveend');
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._ctx = this._map._canvasCtx;
	},

	_updateStyle: function () {
		var options = this.options;

		if (options.stroke) {
			this._ctx.lineWidth = options.weight;
			this._ctx.strokeStyle = options.color;
		}
		if (options.fill) {
			this._ctx.fillStyle = options.fillColor || options.color;
		}
	},

	_drawPath: function () {
		var i, j, len, len2, point, drawMethod;

		this._ctx.beginPath();

		for (i = 0, len = this._parts.length; i < len; i++) {
			for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
				point = this._parts[i][j];
				drawMethod = (j === 0 ? 'move' : 'line') + 'To';

				this._ctx[drawMethod](point.x, point.y);
			}
			// TODO refactor ugly hack
			if (this instanceof L.Polygon) {
				this._ctx.closePath();
			}
		}
	},

	_checkIfEmpty: function () {
		return !this._parts.length;
	},

	_updatePath: function () {
		if (this._checkIfEmpty()) { return; }

		var ctx = this._ctx,
		    options = this.options;

		this._drawPath();
		ctx.save();
		this._updateStyle();

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fill();
		}

		if (options.stroke) {
			ctx.globalAlpha = options.opacity;
			ctx.stroke();
		}

		ctx.restore();

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_initEvents: function () {
		if (this.options.clickable) {
			// TODO dblclick
			this._map.on('mousemove', this._onMouseMove, this);
			this._map.on('click', this._onClick, this);
		}
	},

	_onClick: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire('click', e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map._animatingZoom) { return; }

		// TODO don't do on each move
		if (this._containsPoint(e.layerPoint)) {
			this._ctx.canvas.style.cursor = 'pointer';
			this._mouseInside = true;
			this.fire('mouseover', e);

		} else if (this._mouseInside) {
			this._ctx.canvas.style.cursor = '';
			this._mouseInside = false;
			this.fire('mouseout', e);
		}
	}
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
	_initPathRoot: function () {
		var root = this._pathRoot,
		    ctx;

		if (!root) {
			root = this._pathRoot = document.createElement('canvas');
			root.style.position = 'absolute';
			ctx = this._canvasCtx = root.getContext('2d');

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			this._panes.overlayPane.appendChild(root);

			if (this.options.zoomAnimation) {
				this._pathRoot.className = 'leaflet-zoom-animated';
				this.on('zoomanim', this._animatePathZoom);
				this.on('zoomend', this._endPathZoom);
			}
			this.on('moveend', this._updateCanvasViewport);
			this._updateCanvasViewport();
		}
	},

	_updateCanvasViewport: function () {
		// don't redraw while zooming. See _updateSvgViewport for more details
		if (this._pathZooming) { return; }
		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._pathRoot;

		//TODO check if this works properly on mobile webkit
		L.DomUtil.setPosition(root, min);
		root.width = size.x;
		root.height = size.y;
		root.getContext('2d').translate(-min.x, -min.y);
	}
});


/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */

/*jshint bitwise:false */ // allow bitwise operations for this file

L.LineUtil = {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		points = this._reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// distance from a point to a segment between two points
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// reduce points that are too close to each other to a single point
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	clipSegment: function (a, b, bounds, useLastCode) {
		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
		    codeB = this._getBitCode(b, bounds),

		    codeOut, p, newCode;

		// save 2nd code to avoid calculating it on the next segment
		this._lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			// if a,b is outside the clip window (trivial reject)
			} else if (codeA & codeB) {
				return false;
			// other cases
			} else {
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds);
				newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max;

		if (code & 8) { // top
			return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
			return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
			return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
			return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	// square distance (to avoid unnecessary Math.sqrt calls)
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// return closest point on segment or distance to that point
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
	}
};


/*
 * L.Polyline is used to display polylines on a map.
 */

L.Polyline = L.Path.extend({
	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);
	},

	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false
	},

	projectLatlngs: function () {
		this._originalPoints = [];

		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},

	getPathString: function () {
		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
			str += this._getPathPartStr(this._parts[i]);
		}
		return str;
	},

	getLatLngs: function () {
		return this._latlngs;
	},

	setLatLngs: function (latlngs) {
		this._latlngs = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	addLatLng: function (latlng) {
		this._latlngs.push(L.latLng(latlng));
		return this.redraw();
	},

	spliceLatLngs: function () { // (Number index, Number howMany)
		var removed = [].splice.apply(this._latlngs, arguments);
		this._convertLatLngs(this._latlngs, true);
		this.redraw();
		return removed;
	},

	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},

	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];

		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
				return;
			}
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},

	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},

	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	// simplify each clipped part of the polyline
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},

	_updatePath: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();

		L.Path.prototype._updatePath.call(this);
	}
});

L.polyline = function (latlngs, options) {
	return new L.Polyline(latlngs, options);
};


/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise operations here

L.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
L.PolyUtil.clipPolygon = function (points, bounds) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p,
	    lu = L.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};


/*
 * L.Polygon is used to display polygons on a map.
 */

L.Polygon = L.Polyline.extend({
	options: {
		fill: true
	},

	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
		this._initWithHoles(latlngs);
	},

	_initWithHoles: function (latlngs) {
		var i, len, hole;
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._latlngs = this._convertLatLngs(latlngs[0]);
			this._holes = latlngs.slice(1);

			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
				if (hole[0].equals(hole[hole.length - 1])) {
					hole.pop();
				}
			}
		}

		// filter out last point if its equal to the first one
		latlngs = this._latlngs;

		if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
			latlngs.pop();
		}
	},

	projectLatlngs: function () {
		L.Polyline.prototype.projectLatlngs.call(this);

		// project polygon holes points
		// TODO move this logic to Polyline to get rid of duplication
		this._holePoints = [];

		if (!this._holes) { return; }

		var i, j, len, len2;

		for (i = 0, len = this._holes.length; i < len; i++) {
			this._holePoints[i] = [];

			for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
				this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
			}
		}
	},

	setLatLngs: function (latlngs) {
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._initWithHoles(latlngs);
			return this.redraw();
		} else {
			return L.Polyline.prototype.setLatLngs.call(this, latlngs);
		}
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    newParts = [];

		this._parts = [points].concat(this._holePoints);

		if (this.options.noClip) { return; }

		for (var i = 0, len = this._parts.length; i < len; i++) {
			var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
			if (clipped.length) {
				newParts.push(clipped);
			}
		}

		this._parts = newParts;
	},

	_getPathPartStr: function (points) {
		var str = L.Polyline.prototype._getPathPartStr.call(this, points);
		return str + (L.Browser.svg ? 'z' : 'x');
	}
});

L.polygon = function (latlngs, options) {
	return new L.Polygon(latlngs, options);
};


/*
 * Contains L.MultiPolyline and L.MultiPolygon layers.
 */

(function () {
	function createMulti(Klass) {

		return L.FeatureGroup.extend({

			initialize: function (latlngs, options) {
				this._layers = {};
				this._options = options;
				this.setLatLngs(latlngs);
			},

			setLatLngs: function (latlngs) {
				var i = 0,
				    len = latlngs.length;

				this.eachLayer(function (layer) {
					if (i < len) {
						layer.setLatLngs(latlngs[i++]);
					} else {
						this.removeLayer(layer);
					}
				}, this);

				while (i < len) {
					this.addLayer(new Klass(latlngs[i++], this._options));
				}

				return this;
			},

			getLatLngs: function () {
				var latlngs = [];

				this.eachLayer(function (layer) {
					latlngs.push(layer.getLatLngs());
				});

				return latlngs;
			}
		});
	}

	L.MultiPolyline = createMulti(L.Polyline);
	L.MultiPolygon = createMulti(L.Polygon);

	L.multiPolyline = function (latlngs, options) {
		return new L.MultiPolyline(latlngs, options);
	};

	L.multiPolygon = function (latlngs, options) {
		return new L.MultiPolygon(latlngs, options);
	};
}());


/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

L.Rectangle = L.Polygon.extend({
	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = L.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

L.rectangle = function (latLngBounds, options) {
	return new L.Rectangle(latLngBounds, options);
};


/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);
		this._mRadius = radius;
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng = this._latlng,
		    pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

		this._point = this._map.latLngToLayerPoint(latlng);
		this._radius = Math.max(this._point.x - pointLeft.x, 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng;

		return new L.LatLngBounds(
		        [latlng.lat - latRadius, latlng.lng - lngRadius],
		        [latlng.lat + latRadius, latlng.lng + lngRadius]);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return 'M' + p.x + ',' + (p.y - r) +
			       'A' + r + ',' + r + ',0,1,1,' +
			       (p.x - 0.1) + ',' + (p.y - r) + ' z';
		} else {
			p._round();
			r = Math.round(r);
			return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};


/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

L.CircleMarker = L.Circle.extend({
	options: {
		radius: 10,
		weight: 2
	},

	initialize: function (latlng, options) {
		L.Circle.prototype.initialize.call(this, latlng, null, options);
		this._radius = this.options.radius;
	},

	projectLatlngs: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
	},

	_updateStyle : function () {
		L.Circle.prototype._updateStyle.call(this);
		this.setRadius(this.options.radius);
	},

	setLatLng: function (latlng) {
		L.Circle.prototype.setLatLng.call(this, latlng);
		if (this._popup && this._popup._isOpen) {
			this._popup.setLatLng(latlng);
		}
		return this;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	}
});

L.circleMarker = function (latlng, options) {
	return new L.CircleMarker(latlng, options);
};


/*
 * Extends L.Polyline to be able to manually detect clicks on Canvas-rendered polylines.
 */

L.Polyline.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
		    w = this.options.weight / 2;

		if (L.Browser.touch) {
			w += 10; // polyline click tolerance on touch devices
		}

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}

				dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
 * Extends L.Polygon to be able to manually detect clicks on Canvas-rendered polygons.
 */

L.Polygon.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2,
		    i, j, k,
		    len, len2;

		// TODO optimization: check if within bounds first

		if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		// ray casting algorithm for detecting if point is in polygon

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}
});


/*
 * Extends L.Circle with Canvas-specific code.
 */

L.Circle.include(!L.Path.CANVAS ? {} : {
	_drawPath: function () {
		var p = this._point;
		this._ctx.beginPath();
		this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
	},

	_containsPoint: function (p) {
		var center = this._point,
		    w2 = this.options.stroke ? this.options.weight / 2 : 0;

		return (p.distanceTo(center) <= this._radius + w2);
	}
});


/*
 * CircleMarker canvas specific drawing parts.
 */

L.CircleMarker.include(!L.Path.CANVAS ? {} : {
	_updateStyle: function () {
		L.Path.prototype._updateStyle.call(this);
	}
});


/*
 * L.GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

L.GeoJSON = L.FeatureGroup.extend({

	initialize: function (geojson, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(features[i]);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(L.GeoJSON, {
	geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
			latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
			if (coords.length === 2 && !coords[1].length) {
				throw new Error('Invalid GeoJSON object.');
			}
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);

		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, pointToLayer, coordsToLatLng, vectorOptions));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	},

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
		}

		return coords;
	},

	getFeature: function (layer, newGeometry) {
		return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
	},

	asFeature: function (geoJSON) {
		if (geoJSON.type === 'Feature') {
			return geoJSON;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geoJSON
		};
	}
});

var PointToGeoJSON = {
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});
	}
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
		});
	}
});

L.Polygon.include({
	toGeoJSON: function () {
		var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
		    i, len, hole;

		coords[0].push(coords[0][0]);

		if (this._holes) {
			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
				hole.push(hole[0]);
				coords.push(hole);
			}
		}

		return L.GeoJSON.getFeature(this, {
			type: 'Polygon',
			coordinates: coords
		});
	}
});

(function () {
	function multiToGeoJSON(type) {
		return function () {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});

			return L.GeoJSON.getFeature(this, {
				type: type,
				coordinates: coords
			});
		};
	}

	L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
	L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});

	L.LayerGroup.include({
		toGeoJSON: function () {

			var geometry = this.feature && this.feature.geometry,
				jsons = [],
				json;

			if (geometry && geometry.type === 'MultiPoint') {
				return multiToGeoJSON('MultiPoint').call(this);
			}

			var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});

			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
}());

L.geoJson = function (geojson, options) {
	return new L.GeoJSON(geojson, options);
};


/*
 * L.DomEvent contains functions for working with DOM events.
 */

L.DomEvent = {
	/* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler, originalHandler, newType;

		if (obj[key]) { return this; }

		handler = function (e) {
			return fn.call(context || obj, e || L.DomEvent._getEvent());
		};

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {

				originalHandler = handler;
				newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

				handler = function (e) {
					if (!L.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};

				obj.addEventListener(newType, handler, false);

			} else if (type === 'click' && L.Browser.android) {
				originalHandler = handler;
				handler = function (e) {
					return L.DomEvent._filterClick(e, originalHandler);
				};

				obj.addEventListener(type, handler, false);
			} else {
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[key] = handler;

		return this;
	},

	removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler = obj[key];

		if (!handler) { return this; }

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);
		} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[key] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		L.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		return L.DomEvent
			.on(el, 'mousewheel', stop)
			.on(el, 'MozMousePixelScroll', stop);
	},

	disableClickPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(el, L.Draggable.START[i], stop);
		}

		return L.DomEvent
			.on(el, 'click', L.DomEvent._fakeStop)
			.on(el, 'dblclick', stop);
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return L.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new L.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new L.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
		L.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	_getEvent: function () { // evil magic for IE
		/*jshint noarg:false */
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return;
		}
		L.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

L.DomEvent.on = L.DomEvent.addListener;
L.DomEvent.off = L.DomEvent.removeListener;


/*
 * L.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

L.Draggable = L.Class.extend({
	includes: L.Mixin.Events,

	statics: {
		START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		L.DomEvent.stopPropagation(e);

		if (L.Draggable._disabled) { return; }

		L.DomUtil.disableImageDrag();
		L.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new L.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

		L.DomEvent
		    .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, L.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new L.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		L.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

			L.DomUtil.addClass(document.body, 'leaflet-dragging');
			this._lastTarget = e.target || e.srcElement;
			L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		L.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function () {
		L.DomUtil.removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
			    .off(document, L.Draggable.MOVE[i], this._onMove)
			    .off(document, L.Draggable.END[i], this._onUp);
		}

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			L.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});


/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

L.Handler = L.Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	enable: function () {
		if (this._enabled) { return; }

		this._enabled = true;
		this.addHooks();
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._enabled = false;
		this.removeHooks();
	},

	enabled: function () {
		return !!this._enabled;
	}
});


/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

L.Map.mergeOptions({
	dragging: true,

	inertia: !L.Browser.android23,
	inertiaDeceleration: 3400, // px/s^2
	inertiaMaxSpeed: Infinity, // px/s
	inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
	easeLinearity: 0.25,

	// TODO refactor, move to CRS
	worldCopyJump: false
});

L.Map.Drag = L.Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new L.Draggable(map._mapPane, map._container);

			this._draggable.on({
				'dragstart': this._onDragStart,
				'drag': this._onDrag,
				'dragend': this._onDragEnd
			}, this);

			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDrag, this);
				map.on('viewreset', this._onViewReset, this);

				map.whenReady(this._onViewReset, this);
			}
		}
		this._draggable.enable();
	},

	removeHooks: function () {
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		var map = this._map;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function () {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			if (time - this._times[0] > 200) {
				this._positions.shift();
				this._times.shift();
			}
		}

		this._map
		    .fire('move')
		    .fire('drag');
	},

	_onViewReset: function () {
		// TODO fix hardcoded Earth values
		var pxCenter = this._map.getSize()._divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.project([0, 180]).x;
	},

	_onPreDrag: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,
		    delay = +new Date() - this._lastTime,

		    noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime + delay - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x || !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				L.Util.requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true
					});
				});
			}
		}
	}
});

L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);


/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

L.Map.mergeOptions({
	doubleClickZoom: true
});

L.Map.DoubleClickZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);


/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
		L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);


/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

L.extend(L.DomEvent, {

	_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
	_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',

	// inspired by Zepto touch code by Thomas Fuchs
	addDoubleTapListener: function (obj, handler, id) {
		var last,
		    doubleTap = false,
		    delay = 250,
		    touch,
		    pre = '_leaflet_',
		    touchstart = this._touchstart,
		    touchend = this._touchend,
		    trackedTouches = [];

		function onTouchStart(e) {
			var count;

			if (L.Browser.pointer) {
				trackedTouches.push(e.pointerId);
				count = trackedTouches.length;
			} else {
				count = e.touches.length;
			}
			if (count > 1) {
				return;
			}

			var now = Date.now(),
				delta = now - (last || now);

			touch = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (L.Browser.pointer) {
				var idx = trackedTouches.indexOf(e.pointerId);
				if (idx === -1) {
					return;
				}
				trackedTouches.splice(idx, 1);
			}

			if (doubleTap) {
				if (L.Browser.pointer) {
					// work around .type being readonly with MSPointer* events
					var newTouch = { },
						prop;

					// jshint forin:false
					for (var i in touch) {
						prop = touch[i];
						if (typeof prop === 'function') {
							newTouch[i] = prop.bind(touch);
						} else {
							newTouch[i] = prop;
						}
					}
					touch = newTouch;
				}
				touch.type = 'dblclick';
				handler(touch);
				last = null;
			}
		}
		obj[pre + touchstart + id] = onTouchStart;
		obj[pre + touchend + id] = onTouchEnd;

		// on pointer we need to listen on the document, otherwise a drag starting on the map and moving off screen
		// will not come through to us, so we will lose track of how many touches are ongoing
		var endElement = L.Browser.pointer ? document.documentElement : obj;

		obj.addEventListener(touchstart, onTouchStart, false);
		endElement.addEventListener(touchend, onTouchEnd, false);

		if (L.Browser.pointer) {
			endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
		}

		return this;
	},

	removeDoubleTapListener: function (obj, id) {
		var pre = '_leaflet_';

		obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
		(L.Browser.pointer ? document.documentElement : obj).removeEventListener(
		        this._touchend, obj[pre + this._touchend + id], false);

		if (L.Browser.pointer) {
			document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id],
				false);
		}

		return this;
	}
});


/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */

L.extend(L.DomEvent, {

	//static
	POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
	POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
	POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
	POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',

	_pointers: [],
	_pointerDocumentListener: false,

	// Provides a touch events wrapper for (ms)pointer events.
	// Based on changes by veproza https://github.com/CloudMade/Leaflet/pull/1019
	//ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	addPointerListener: function (obj, type, handler, id) {

		switch (type) {
		case 'touchstart':
			return this.addPointerListenerStart(obj, type, handler, id);
		case 'touchend':
			return this.addPointerListenerEnd(obj, type, handler, id);
		case 'touchmove':
			return this.addPointerListenerMove(obj, type, handler, id);
		default:
			throw 'Unknown touch event type';
		}
	},

	addPointerListenerStart: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    pointers = this._pointers;

		var cb = function (e) {

			L.DomEvent.preventDefault(e);

			var alreadyInArray = false;
			for (var i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId === e.pointerId) {
					alreadyInArray = true;
					break;
				}
			}
			if (!alreadyInArray) {
				pointers.push(e);
			}

			e.touches = pointers.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchstart' + id] = cb;
		obj.addEventListener(this.POINTER_DOWN, cb, false);

		// need to also listen for end events to keep the _pointers list accurate
		// this needs to be on the body and never go away
		if (!this._pointerDocumentListener) {
			var internalCb = function (e) {
				for (var i = 0; i < pointers.length; i++) {
					if (pointers[i].pointerId === e.pointerId) {
						pointers.splice(i, 1);
						break;
					}
				}
			};
			//We listen on the documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
			document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);

			this._pointerDocumentListener = true;
		}

		return this;
	},

	addPointerListenerMove: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		function cb(e) {

			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches[i] = e;
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		}

		obj[pre + 'touchmove' + id] = cb;
		obj.addEventListener(this.POINTER_MOVE, cb, false);

		return this;
	},

	addPointerListenerEnd: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		var cb = function (e) {
			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches.splice(i, 1);
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchend' + id] = cb;
		obj.addEventListener(this.POINTER_UP, cb, false);
		obj.addEventListener(this.POINTER_CANCEL, cb, false);

		return this;
	},

	removePointerListener: function (obj, type, id) {
		var pre = '_leaflet_',
		    cb = obj[pre + type + id];

		switch (type) {
		case 'touchstart':
			obj.removeEventListener(this.POINTER_DOWN, cb, false);
			break;
		case 'touchmove':
			obj.removeEventListener(this.POINTER_MOVE, cb, false);
			break;
		case 'touchend':
			obj.removeEventListener(this.POINTER_UP, cb, false);
			obj.removeEventListener(this.POINTER_CANCEL, cb, false);
			break;
		}

		return this;
	}
});


/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

L.Map.mergeOptions({
	touchZoom: L.Browser.touch && !L.Browser.android23,
	bounceAtZoomLimits: true
});

L.Map.TouchZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		L.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		L.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (this._scale === 1) { return; }

		if (!map.options.bounceAtZoomLimits) {
			if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
			    (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
		}

		if (!this._moved) {
			L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(
		        this._updateOnMove, this, true, this._map._container);

		L.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map,
		    origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),
		    zoom = map.getScaleZoom(this._scale);

		map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		var map = this._map;

		this._zooming = false;
		L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
		L.Util.cancelAnimFrame(this._animRequest);

		L.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),

		    oldZoom = map.getZoom(),
		    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
		    roundZoomDelta = (floatZoomDelta > 0 ?
		            Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),

		    zoom = map._limitZoom(oldZoom + roundZoomDelta),
		    scale = map.getZoomScale(zoom) / this._scale;

		map._animateZoom(center, zoom, origin, scale);
	},

	_getScaleOrigin: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);


/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

L.Map.mergeOptions({
	tap: true,
	tapTolerance: 15
});

L.Map.Tap = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		L.DomEvent.preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			L.DomUtil.addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(L.bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		L.DomEvent
			.on(document, 'touchmove', this._onMove, this)
			.on(document, 'touchend', this._onUp, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		L.DomEvent
			.off(document, 'touchmove', this._onMove, this)
			.off(document, 'touchend', this._onUp, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.removeClass(el, 'leaflet-active');
			}

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new L.Point(first.clientX, first.clientY);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

if (L.Browser.touch && !L.Browser.pointer) {
	L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
}


/*
 * L.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

L.Map.mergeOptions({
	boxZoom: true
});

L.Map.BoxZoom = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		this._moved = false;

		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
		    .on(document, 'mouseup', this._onMouseUp, this)
		    .on(document, 'keydown', this._onKeyDown, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
			L.DomUtil.setPosition(this._box, this._startLayerPoint);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';
			this._map.fire('boxzoomstart');
		}

		var startPoint = this._startLayerPoint,
		    box = this._box,

		    layerPoint = this._map.mouseEventToLayerPoint(e),
		    offset = layerPoint.subtract(startPoint),

		    newPos = new L.Point(
		        Math.min(layerPoint.x, startPoint.x),
		        Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

		this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
		box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
	},

	_finish: function () {
		if (this._moved) {
			this._pane.removeChild(this._box);
			this._container.style.cursor = '';
		}

		L.DomUtil.enableTextSelection();
		L.DomUtil.enableImageDrag();

		L.DomEvent
		    .off(document, 'mousemove', this._onMouseMove)
		    .off(document, 'mouseup', this._onMouseUp)
		    .off(document, 'keydown', this._onKeyDown);
	},

	_onMouseUp: function (e) {

		this._finish();

		var map = this._map,
		    layerPoint = map.mouseEventToLayerPoint(e);

		if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
		        map.layerPointToLatLng(this._startLayerPoint),
		        map.layerPointToLatLng(layerPoint));

		map.fitBounds(bounds);

		map.fire('boxzoomend', {
			boxZoomBounds: bounds
		});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);


/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

L.Map.mergeOptions({
	keyboard: true,
	keyboardPanOffset: 80,
	keyboardZoomOffset: 1
});

L.Map.Keyboard = L.Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanOffset(map.options.keyboardPanOffset);
		this._setZoomOffset(map.options.keyboardZoomOffset);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex === -1) {
			container.tabIndex = '0';
		}

		L.DomEvent
		    .on(container, 'focus', this._onFocus, this)
		    .on(container, 'blur', this._onBlur, this)
		    .on(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .on('focus', this._addHooks, this)
		    .on('blur', this._removeHooks, this);
	},

	removeHooks: function () {
		this._removeHooks();

		var container = this._map._container;

		L.DomEvent
		    .off(container, 'focus', this._onFocus, this)
		    .off(container, 'blur', this._onBlur, this)
		    .off(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .off('focus', this._addHooks, this)
		    .off('blur', this._removeHooks, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanOffset: function (pan) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * pan, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [pan, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, pan];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * pan];
		}
	},

	_setZoomOffset: function (zoom) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoom;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoom;
		}
	},

	_addHooks: function () {
		L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		var key = e.keyCode,
		    map = this._map;

		if (key in this._panKeys) {

			if (map._panAnim && map._panAnim._inProgress) { return; }

			map.panBy(this._panKeys[key]);

			if (map.options.maxBounds) {
				map.panInsideBounds(map.options.maxBounds);
			}

		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + this._zoomKeys[key]);

		} else {
			return;
		}

		L.DomEvent.stop(e);
	}
});

L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);


/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;
		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon);
		}

		this._draggable
			.on('dragstart', this._onDragStart, this)
			.on('drag', this._onDrag, this)
			.on('dragend', this._onDragEnd, this);
		this._draggable.enable();
		L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable
			.off('dragstart', this._onDragStart, this)
			.off('drag', this._onDrag, this)
			.off('dragend', this._onDragEnd, this);

		this._draggable.disable();
		L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function () {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;

		marker
		    .fire('move', {latlng: latlng})
		    .fire('drag');
	},

	_onDragEnd: function (e) {
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});


/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

L.Control = L.Class.extend({
	options: {
		position: 'topright'
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	getPosition: function () {
		return this.options.position;
	},

	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	getContainer: function () {
		return this._container;
	},

	addTo: function (map) {
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		L.DomUtil.addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	removeFrom: function (map) {
		var pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		corner.removeChild(this._container);
		this._map = null;

		if (this.onRemove) {
			this.onRemove(map);
		}

		return this;
	},

	_refocusOnMap: function () {
		if (this._map) {
			this._map.getContainer().focus();
		}
	}
});

L.control = function (options) {
	return new L.Control(options);
};


// adds control-related methods to L.Map

L.Map.include({
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            L.DomUtil.create('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		this._container.removeChild(this._controlContainer);
	}
});


/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */

L.Control.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        this.options.zoomInText, this.options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn,  this);
		this._zoomOutButton = this._createButton(
		        this.options.zoomOutText, this.options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._zoomInButton, className);
		L.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: true
});

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

L.control.zoom = function (options) {
	return new L.Control.Zoom(options);
};



/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

L.Control.Attribution = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}
		
		map
		    .on('layeradd', this._onLayerAdd, this)
		    .on('layerremove', this._onLayerRemove, this);

		this._update();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerAdd)
		    .off('layerremove', this._onLayerRemove);

	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	},

	_onLayerAdd: function (e) {
		if (e.layer.getAttribution) {
			this.addAttribution(e.layer.getAttribution());
		}
	},

	_onLayerRemove: function (e) {
		if (e.layer.getAttribution) {
			this.removeAttribution(e.layer.getAttribution());
		}
	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this);
	}
});

L.control.attribution = function (options) {
	return new L.Control.Attribution(options);
};


/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

L.Control.Scale = L.Control.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true,
		updateWhenIdle: false
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addScales(options, className, container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});

L.control.scale = function (options) {
	return new L.Control.Scale(options);
};


/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange, this)
		    .off('layerremove', this._onLayerChange, this);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
			//Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

L.control.layers = function (baseLayers, overlays, options) {
	return new L.Control.Layers(baseLayers, overlays, options);
};


/*
 * L.PosAnimation is used by Leaflet internally for pan animations.
 */

L.PosAnimation = L.Class.extend({
	includes: L.Mixin.Events,

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._newPos = newPos;

		this.fire('start');

		el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) +
		        's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';

		L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
		L.DomUtil.setPosition(el, newPos);

		// toggle reflow, Chrome flickers for some reason if you don't do this
		L.Util.falseFn(el.offsetWidth);

		// there's no native way to track value updates of transitioned properties, so we imitate this
		this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
	},

	stop: function () {
		if (!this._inProgress) { return; }

		// if we just removed the transition property, the element would jump to its final position,
		// so we need to make it stay at the current position

		L.DomUtil.setPosition(this._el, this._getPos());
		this._onTransitionEnd();
		L.Util.falseFn(this._el.offsetWidth); // force reflow in case we are about to start a new animation
	},

	_onStep: function () {
		var stepPos = this._getPos();
		if (!stepPos) {
			this._onTransitionEnd();
			return;
		}
		// jshint camelcase: false
		// make L.DomUtil.getPosition return intermediate position value during animation
		this._el._leaflet_pos = stepPos;

		this.fire('step');
	},

	// you can't easily get intermediate values of properties animated with CSS3 Transitions,
	// we need to parse computed style (in case of transform it returns matrix string)

	_transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,

	_getPos: function () {
		var left, top, matches,
		    el = this._el,
		    style = window.getComputedStyle(el);

		if (L.Browser.any3d) {
			matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
			if (!matches) { return; }
			left = parseFloat(matches[1]);
			top  = parseFloat(matches[2]);
		} else {
			left = parseFloat(style.left);
			top  = parseFloat(style.top);
		}

		return new L.Point(left, top, true);
	},

	_onTransitionEnd: function () {
		L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);

		if (!this._inProgress) { return; }
		this._inProgress = false;

		this._el.style[L.DomUtil.TRANSITION] = '';

		// jshint camelcase: false
		// make sure L.DomUtil.getPosition returns the final position value after animation
		this._el._leaflet_pos = this._newPos;

		clearInterval(this._stepTimer);

		this.fire('step').fire('end');
	}

});


/*
 * Extends L.Map to handle panning animations.
 */

L.Map.include({

	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
		options = options || {};

		if (this._panAnim) {
			this._panAnim.stop();
		}

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = L.extend({animate: options.animate}, options.zoom);
				options.pan = L.extend({animate: options.animate}, options.pan);
			}

			// try animating pan or zoom
			var animated = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (animated) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	panBy: function (offset, options) {
		offset = L.point(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new L.PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset);
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._floor();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	}
});


/*
 * L.PosAnimation fallback implementation that powers Leaflet pan animations
 * in browsers that don't support CSS3 Transitions.
 */

L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = L.DomUtil.getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		this.fire('start');

		this._animate();
	},

	stop: function () {
		if (!this._inProgress) { return; }

		this._step();
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = L.Util.requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function () {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration));
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		L.DomUtil.setPosition(this._el, pos);

		this.fire('step');
	},

	_complete: function () {
		L.Util.cancelAnimFrame(this._animId);

		this._inProgress = false;
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});


/*
 * Extends L.Map to handle zoom animations.
 */

L.Map.mergeOptions({
	zoomAnimation: true,
	zoomAnimationThreshold: 4
});

if (L.DomUtil.TRANSITION) {

	L.Map.addInitHook(function () {
		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION &&
				L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
		}
	});
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	_animateZoom: function (center, zoom, origin, scale, delta, backwards, forTouchZoom) {

		if (!forTouchZoom) {
			this._animatingZoom = true;
		}

		// put transform transition on all layers with leaflet-zoom-animated class
		L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');

		// remember what center/zoom to set after animation
		this._animateToCenter = center;
		this._animateToZoom = zoom;

		// disable any dragging during animation
		if (L.Draggable) {
			L.Draggable._disabled = true;
		}

		L.Util.requestAnimFrame(function () {
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				origin: origin,
				scale: scale,
				delta: delta,
				backwards: backwards
			});
		}, this);
	},

	_onZoomTransitionEnd: function () {

		this._animatingZoom = false;

		L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');

		this._resetView(this._animateToCenter, this._animateToZoom, true, true);

		if (L.Draggable) {
			L.Draggable._disabled = false;
		}
	}
});


/*
	Zoom animation logic for L.TileLayer.
*/

L.TileLayer.include({
	_animateZoom: function (e) {
		if (!this._animating) {
			this._animating = true;
			this._prepareBgBuffer();
		}

		var bg = this._bgBuffer,
		    transform = L.DomUtil.TRANSFORM,
		    initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
		    scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);

		bg.style[transform] = e.backwards ?
				scaleStr + ' ' + initialTransform :
				initialTransform + ' ' + scaleStr;
	},

	_endZoomAnim: function () {
		var front = this._tileContainer,
		    bg = this._bgBuffer;

		front.style.visibility = '';
		front.parentNode.appendChild(front); // Bring to fore

		// force reflow
		L.Util.falseFn(bg.offsetWidth);

		this._animating = false;
	},

	_clearBgBuffer: function () {
		var map = this._map;

		if (map && !map._animatingZoom && !map.touchZoom._zooming) {
			this._bgBuffer.innerHTML = '';
			this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
		}
	},

	_prepareBgBuffer: function () {

		var front = this._tileContainer,
		    bg = this._bgBuffer;

		// if foreground layer doesn't have many tiles but bg layer does,
		// keep the existing bg layer and just zoom it some more

		var bgLoaded = this._getLoadedTilesPercentage(bg),
		    frontLoaded = this._getLoadedTilesPercentage(front);

		if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {

			front.style.visibility = 'hidden';
			this._stopLoadingImages(front);
			return;
		}

		// prepare the buffer to become the front tile pane
		bg.style.visibility = 'hidden';
		bg.style[L.DomUtil.TRANSFORM] = '';

		// switch out the current layer to be the new bg layer (and vice-versa)
		this._tileContainer = bg;
		bg = this._bgBuffer = front;

		this._stopLoadingImages(bg);

		//prevent bg buffer from clearing right after zoom
		clearTimeout(this._clearBgBufferTimer);
	},

	_getLoadedTilesPercentage: function (container) {
		var tiles = container.getElementsByTagName('img'),
		    i, len, count = 0;

		for (i = 0, len = tiles.length; i < len; i++) {
			if (tiles[i].complete) {
				count++;
			}
		}
		return count / len;
	},

	// stops loading all tiles in the background layer
	_stopLoadingImages: function (container) {
		var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
		    i, len, tile;

		for (i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];

			if (!tile.complete) {
				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;
				tile.src = L.Util.emptyImageUrl;

				tile.parentNode.removeChild(tile);
			}
		}
	}
});


/*
 * Provides L.Map with convenient shortcuts for using browser geolocation features.
 */

L.Map.include({
	_defaultLocateOptions: {
		watch: false,
		setView: false,
		maxZoom: Infinity,
		timeout: 10000,
		maximumAge: 0,
		enableHighAccuracy: false
	},

	locate: function (/*Object*/ options) {

		options = this._locateOptions = L.extend(this._defaultLocateOptions, options);

		if (!navigator.geolocation) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = L.bind(this._handleGeolocationResponse, this),
			onError = L.bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	stopLocate: function () {
		if (navigator.geolocation) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new L.LatLng(lat, lng),

		    latAccuracy = 180 * pos.coords.accuracy / 40075017,
		    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

		    bounds = L.latLngBounds(
		            [lat - latAccuracy, lng - lngAccuracy],
		            [lat + latAccuracy, lng + lngAccuracy]),

		    options = this._locateOptions;

		if (options.setView) {
			var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
			this.setView(latlng, zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		this.fire('locationfound', data);
	}
});


}(window, document));
},{}],4:[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],5:[function(require,module,exports){
var css = ".marker-cluster-small {\n\tbackground-color: rgba(181, 226, 140, 0.6);\n\t}\n.marker-cluster-small div {\n\tbackground-color: rgba(110, 204, 57, 0.6);\n\t}\n\n.marker-cluster-medium {\n\tbackground-color: rgba(241, 211, 87, 0.6);\n\t}\n.marker-cluster-medium div {\n\tbackground-color: rgba(240, 194, 12, 0.6);\n\t}\n\n.marker-cluster-large {\n\tbackground-color: rgba(253, 156, 115, 0.6);\n\t}\n.marker-cluster-large div {\n\tbackground-color: rgba(241, 128, 23, 0.6);\n\t}\n\n\t/* IE 6-8 fallback colors */\n.leaflet-oldie .marker-cluster-small {\n\tbackground-color: rgb(181, 226, 140);\n\t}\n.leaflet-oldie .marker-cluster-small div {\n\tbackground-color: rgb(110, 204, 57);\n\t}\n\n.leaflet-oldie .marker-cluster-medium {\n\tbackground-color: rgb(241, 211, 87);\n\t}\n.leaflet-oldie .marker-cluster-medium div {\n\tbackground-color: rgb(240, 194, 12);\n\t}\n\n.leaflet-oldie .marker-cluster-large {\n\tbackground-color: rgb(253, 156, 115);\n\t}\n.leaflet-oldie .marker-cluster-large div {\n\tbackground-color: rgb(241, 128, 23);\n}\n\n.marker-cluster {\n\tbackground-clip: padding-box;\n\tborder-radius: 20px;\n\t}\n.marker-cluster div {\n\twidth: 30px;\n\theight: 30px;\n\tmargin-left: 5px;\n\tmargin-top: 5px;\n\n\ttext-align: center;\n\tborder-radius: 15px;\n\tfont: 12px \"Helvetica Neue\", Arial, Helvetica, sans-serif;\n\t}\n.marker-cluster span {\n\tline-height: 30px;\n\t}"; (require("/Users/pkro/Dropbox/Dippa/geoviz-framework-3/node_modules/cssify"))(css); module.exports = css;
},{"/Users/pkro/Dropbox/Dippa/geoviz-framework-3/node_modules/cssify":2}],6:[function(require,module,exports){
var css = ".leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {\n\t-webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease-in;\n\t-moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease-in;\n\t-o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease-in;\n\ttransition: transform 0.3s ease-out, opacity 0.3s ease-in;\n\t}\n"; (require("/Users/pkro/Dropbox/Dippa/geoviz-framework-3/node_modules/cssify"))(css); module.exports = css;
},{"/Users/pkro/Dropbox/Dippa/geoviz-framework-3/node_modules/cssify":2}],7:[function(require,module,exports){
(function (global){

; L = global.L = require("leaflet");
;__browserify_shim_require__=require;(function browserifyShim(module, define, require) {
/*
* Leaflet Heatmap Overlay
*
* Copyright (c) 2014, Patrick Wied (http://www.patrick-wied.at)
* Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
*/

// Leaflet < 0.8 compatibility
if (typeof L.Layer === 'undefined') {
  L.Layer = L.Class;
}

var HeatmapOverlay = L.Layer.extend({

  initialize: function (config) {
    this.cfg = config;
    this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
    this._data = [];
    this._max = 1;
    this._min = 0;
    this.cfg.container = this._el;
  },

  onAdd: function (map) {
    var size = map.getSize();

    this._map = map;

    this._width = size.x;
    this._height = size.y;

    this._el.style.width = size.x + 'px';
    this._el.style.height = size.y + 'px';

    this._resetOrigin();

    map.getPanes().overlayPane.appendChild(this._el);

    if (!this._heatmap) {
      this._heatmap = h337.create(this.cfg);
    } 

    // on zoom, reset origin
    map.on('viewreset', this._resetOrigin, this);
    // redraw whenever dragend
    map.on('dragend', this._draw, this);

    this._draw();
  },

  onRemove: function (map) {
    // remove layer's DOM elements and listeners
    map.getPanes().overlayPane.removeChild(this._el);

    map.off('viewreset', this._resetOrigin, this);
    map.off('dragend', this._draw, this);
  },
  _draw: function() {
    if (!this._map) { return; }
    
    var point = this._map.latLngToContainerPoint(this._origin);        

    // reposition the layer
    this._el.style[HeatmapOverlay.CSS_TRANSFORM] = 'translate(' +
      -Math.round(point.x) + 'px,' +
      -Math.round(point.y) + 'px)';

    this._update();
  },
  _update: function() {
    var bounds, zoom, scale;

    bounds = this._map.getBounds();
    zoom = this._map.getZoom();
    scale = Math.pow(2, zoom);

    if (this._data.length == 0) {
      return;
    }

    var generatedData = { max: this._max, min: this._min };
    var latLngPoints = [];
    var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
    var localMax = 0;
    var localMin = 0;
    var valueField = this.cfg.valueField;
    var len = this._data.length;
  
    while (len--) {
      var entry = this._data[len];
      var value = entry[valueField];
      var latlng = entry.latlng;


      // we don't wanna render points that are not even on the map ;-)
      if (!bounds.contains(latlng)) {
        continue;
      }
      // local max is the maximum within current bounds
      localMax = Math.max(value, localMax);
      localMin = Math.min(value, localMin);

      var point = this._map.latLngToContainerPoint(latlng);
      var latlngPoint = { x: Math.round(point.x), y: Math.round(point.y) };
      latlngPoint[valueField] = value;

      var radius;

      if (entry.radius) {
        radius = entry.radius * radiusMultiplier;
      } else {
        radius = (this.cfg.radius || 2) * radiusMultiplier;
      }
      latlngPoint.radius = radius;
      latLngPoints.push(latlngPoint);
    }
    if (this.cfg.useLocalExtrema) {
      generatedData.max = localMax;
      generatedData.min = localMin;
    }

    generatedData.data = latLngPoints;

    this._heatmap.setData(generatedData);
  },
  setData: function(data) {
    this._max = data.max || this._max;
    this._min = data.min || this._min;
    var latField = this.cfg.latField || 'lat';
    var lngField = this.cfg.lngField || 'lng';
    var valueField = this.cfg.valueField || 'value';
  
    // transform data to latlngs
    var data = data.data;
    var len = data.length;
    var d = [];
  
    while (len--) {
      var entry = data[len];
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      dataObj[valueField] = entry[valueField];
      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      d.push(dataObj);
    }
    this._data = d;
  
    this._draw();
  },
  // experimential... not ready.
  addData: function(pointOrArray) {
    if (pointOrArray.length > 0) {
      var len = pointOrArray.length;
      while(len--) {
        this.addData(pointOrArray[len]);
      }
    } else {
      var latField = this.cfg.latField || 'lat';
      var lngField = this.cfg.lngField || 'lng';
      var valueField = this.cfg.valueField || 'value';
      var entry = pointOrArray;
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      
      dataObj[valueField] = entry[valueField];
      this._max = Math.max(this._max, dataObj[valueField]);
      this._min = Math.min(this._min, dataObj[valueField]);

      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      this._data.push(dataObj);
      this._draw();
    }
  },
  _resetOrigin: function () {
    this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));
    this._draw();
  } 
});

HeatmapOverlay.CSS_TRANSFORM = (function() {
  var div = document.createElement('div');
  var props = [
  'transform',
  'WebkitTransform',
  'MozTransform',
  'OTransform',
  'msTransform'
  ];

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  return props[0];
})();
}).call(global, module, undefined, undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"leaflet":3}],8:[function(require,module,exports){
(function (global){

; L = global.L = require("leaflet");
;__browserify_shim_require__=require;(function browserifyShim(module, define, require) {
/*
 Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 https://github.com/Leaflet/Leaflet.markercluster
 (c) 2012-2013, Dave Leaver, smartrak
*/
!function(t,e){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,chunkedLoading:!1,chunkInterval:200,chunkDelay:50,chunkProgress:null,polygonOptions:{}},initialize:function(t){L.Util.setOptions(this,t),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._inZoomAnimation=0,this._needsClustering=[],this._needsRemoving=[],this._currentShownBounds=null,this._queue=[]},addLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.addLayers(e)}if(!t.getLatLng)return this._nonPointGroup.addLayer(t),this;if(!this._map)return this._needsClustering.push(t),this;if(this.hasLayer(t))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(t,this._maxZoom);var n=t,s=this._map.getZoom();if(t.__parent)for(;n.__parent._zoom>=s;)n=n.__parent;return this._currentShownBounds.contains(n.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(t,n):this._animationAddLayerNonAnimated(t,n)),this},removeLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.removeLayers(e)}return t.getLatLng?this._map?t.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(t)),this._removeLayer(t,!0),this._featureGroup.hasLayer(t)&&(this._featureGroup.removeLayer(t),t.setOpacity&&t.setOpacity(1)),this):this:(!this._arraySplice(this._needsClustering,t)&&this.hasLayer(t)&&this._needsRemoving.push(t),this):(this._nonPointGroup.removeLayer(t),this)},addLayers:function(t){var e,i,n,s,r=this._featureGroup,o=this._nonPointGroup,a=this.options.chunkedLoading,h=this.options.chunkInterval,_=this.options.chunkProgress;if(this._map){var u=0,l=(new Date).getTime(),d=L.bind(function(){for(var e=(new Date).getTime();u<t.length;u++){if(a&&0===u%200){var i=(new Date).getTime()-e;if(i>h)break}if(s=t[u],s.getLatLng){if(!this.hasLayer(s)&&(this._addLayer(s,this._maxZoom),s.__parent&&2===s.__parent.getChildCount())){var n=s.__parent.getAllChildMarkers(),p=n[0]===s?n[1]:n[0];r.removeLayer(p)}}else o.addLayer(s)}_&&_(u,t.length,(new Date).getTime()-l),u===t.length?(this._featureGroup.eachLayer(function(t){t instanceof L.MarkerCluster&&t._iconNeedsUpdate&&t._updateIcon()}),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)):setTimeout(d,this.options.chunkDelay)},this);d()}else{for(e=[],i=0,n=t.length;n>i;i++)s=t[i],s.getLatLng?this.hasLayer(s)||e.push(s):o.addLayer(s);this._needsClustering=this._needsClustering.concat(e)}return this},removeLayers:function(t){var e,i,n,s=this._featureGroup,r=this._nonPointGroup;if(!this._map){for(e=0,i=t.length;i>e;e++)n=t[e],this._arraySplice(this._needsClustering,n),r.removeLayer(n);return this}for(e=0,i=t.length;i>e;e++)n=t[e],n.__parent?(this._removeLayer(n,!0,!0),s.hasLayer(n)&&(s.removeLayer(n),n.setOpacity&&n.setOpacity(1))):r.removeLayer(n);return this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),s.eachLayer(function(t){t instanceof L.MarkerCluster&&t._updateIcon()}),this},clearLayers:function(){return this._map||(this._needsClustering=[],delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(t){delete t.__parent}),this._map&&this._generateInitialClusters(),this},getBounds:function(){var t=new L.LatLngBounds;this._topClusterLevel&&t.extend(this._topClusterLevel._bounds);for(var e=this._needsClustering.length-1;e>=0;e--)t.extend(this._needsClustering[e].getLatLng());return t.extend(this._nonPointGroup.getBounds()),t},eachLayer:function(t,e){var i,n=this._needsClustering.slice();for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(n),i=n.length-1;i>=0;i--)t.call(e,n[i]);this._nonPointGroup.eachLayer(t,e)},getLayers:function(){var t=[];return this.eachLayer(function(e){t.push(e)}),t},getLayer:function(t){var e=null;return this.eachLayer(function(i){L.stamp(i)===t&&(e=i)}),e},hasLayer:function(t){if(!t)return!1;var e,i=this._needsClustering;for(e=i.length-1;e>=0;e--)if(i[e]===t)return!0;for(i=this._needsRemoving,e=i.length-1;e>=0;e--)if(i[e]===t)return!1;return!(!t.__parent||t.__parent._group!==this)||this._nonPointGroup.hasLayer(t)},zoomToShowLayer:function(t,e){var i=function(){if((t._icon||t.__parent._icon)&&!this._inZoomAnimation)if(this._map.off("moveend",i,this),this.off("animationend",i,this),t._icon)e();else if(t.__parent._icon){var n=function(){this.off("spiderfied",n,this),e()};this.on("spiderfied",n,this),t.__parent.spiderfy()}};if(t._icon&&this._map.getBounds().contains(t.getLatLng()))e();else if(t.__parent._zoom<this._map.getZoom())this._map.on("moveend",i,this),this._map.panTo(t.getLatLng());else{var n=function(){this._map.off("movestart",n,this),n=null};this._map.on("movestart",n,this),this._map.on("moveend",i,this),this.on("animationend",i,this),t.__parent.zoomToBounds(),n&&i.call(this)}},onAdd:function(t){this._map=t;var e,i,n;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";for(this._featureGroup.onAdd(t),this._nonPointGroup.onAdd(t),this._gridClusters||this._generateInitialClusters(),e=0,i=this._needsRemoving.length;i>e;e++)n=this._needsRemoving[e],this._removeLayer(n,!0);this._needsRemoving=[],this._zoom=this._map.getZoom(),this._currentShownBounds=this._getExpandedVisibleBounds(),this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents(),i=this._needsClustering,this._needsClustering=[],this.addLayers(i)},onRemove:function(t){t.off("zoomend",this._zoomEnd,this),t.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),this._hideCoverage(),this._featureGroup.onRemove(t),this._nonPointGroup.onRemove(t),this._featureGroup.clearLayers(),this._map=null},getVisibleParent:function(t){for(var e=t;e&&!e._icon;)e=e.__parent;return e||null},_arraySplice:function(t,e){for(var i=t.length-1;i>=0;i--)if(t[i]===e)return t.splice(i,1),!0},_removeLayer:function(t,e,i){var n=this._gridClusters,s=this._gridUnclustered,r=this._featureGroup,o=this._map;if(e)for(var a=this._maxZoom;a>=0&&s[a].removeObject(t,o.project(t.getLatLng(),a));a--);var h,_=t.__parent,u=_._markers;for(this._arraySplice(u,t);_&&(_._childCount--,!(_._zoom<0));)e&&_._childCount<=1?(h=_._markers[0]===t?_._markers[1]:_._markers[0],n[_._zoom].removeObject(_,o.project(_._cLatLng,_._zoom)),s[_._zoom].addObject(h,o.project(h.getLatLng(),_._zoom)),this._arraySplice(_.__parent._childClusters,_),_.__parent._markers.push(h),h.__parent=_.__parent,_._icon&&(r.removeLayer(_),i||r.addLayer(h))):(_._recalculateBounds(),i&&_._icon||_._updateIcon()),_=_.__parent;delete t.__parent},_isOrIsParent:function(t,e){for(;e;){if(t===e)return!0;e=e.parentNode}return!1},_propagateEvent:function(t){if(t.layer instanceof L.MarkerCluster){if(t.originalEvent&&this._isOrIsParent(t.layer._icon,t.originalEvent.relatedTarget))return;t.type="cluster"+t.type}this.fire(t.type,t)},_defaultIconCreateFunction:function(t){var e=t.getChildCount(),i=" marker-cluster-";return i+=10>e?"small":100>e?"medium":"large",new L.DivIcon({html:"<div><span>"+e+"</span></div>",className:"marker-cluster"+i,iconSize:new L.Point(40,40)})},_bindEvents:function(){var t=this._map,e=this.options.spiderfyOnMaxZoom,i=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick;(e||n)&&this.on("clusterclick",this._zoomOrSpiderfy,this),i&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),t.on("zoomend",this._hideCoverage,this))},_zoomOrSpiderfy:function(t){var e=this._map;e.getMaxZoom()===e.getZoom()?this.options.spiderfyOnMaxZoom&&t.layer.spiderfy():this.options.zoomToBoundsOnClick&&t.layer.zoomToBounds(),t.originalEvent&&13===t.originalEvent.keyCode&&e._container.focus()},_showCoverage:function(t){var e=this._map;this._inZoomAnimation||(this._shownPolygon&&e.removeLayer(this._shownPolygon),t.layer.getChildCount()>2&&t.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(t.layer.getConvexHull(),this.options.polygonOptions),e.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_unbindEvents:function(){var t=this.options.spiderfyOnMaxZoom,e=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick,n=this._map;(t||i)&&this.off("clusterclick",this._zoomOrSpiderfy,this),e&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),n.off("zoomend",this._hideCoverage,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var t=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._map._zoom,t),this._currentShownBounds=t}},_generateInitialClusters:function(){var t=this._map.getMaxZoom(),e=this.options.maxClusterRadius,i=e;"function"!=typeof e&&(i=function(){return e}),this.options.disableClusteringAtZoom&&(t=this.options.disableClusteringAtZoom-1),this._maxZoom=t,this._gridClusters={},this._gridUnclustered={};for(var n=t;n>=0;n--)this._gridClusters[n]=new L.DistanceGrid(i(n)),this._gridUnclustered[n]=new L.DistanceGrid(i(n));this._topClusterLevel=new L.MarkerCluster(this,-1)},_addLayer:function(t,e){var i,n,s=this._gridClusters,r=this._gridUnclustered;for(this.options.singleMarkerMode&&(t.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[t]}}));e>=0;e--){i=this._map.project(t.getLatLng(),e);var o=s[e].getNearObject(i);if(o)return o._addChild(t),t.__parent=o,void 0;if(o=r[e].getNearObject(i)){var a=o.__parent;a&&this._removeLayer(o,!1);var h=new L.MarkerCluster(this,e,o,t);s[e].addObject(h,this._map.project(h._cLatLng,e)),o.__parent=h,t.__parent=h;var _=h;for(n=e-1;n>a._zoom;n--)_=new L.MarkerCluster(this,n,_),s[n].addObject(_,this._map.project(o.getLatLng(),n));for(a._addChild(_),n=e;n>=0&&r[n].removeObject(o,this._map.project(o.getLatLng(),n));n--);return}r[e].addObject(t,i)}this._topClusterLevel._addChild(t),t.__parent=this._topClusterLevel},_enqueue:function(t){this._queue.push(t),this._queueTimeout||(this._queueTimeout=setTimeout(L.bind(this._processQueue,this),300))},_processQueue:function(){for(var t=0;t<this._queue.length;t++)this._queue[t].call(this);this._queue.length=0,clearTimeout(this._queueTimeout),this._queueTimeout=null},_mergeSplitClusters:function(){this._processQueue(),this._zoom<this._map._zoom&&this._currentShownBounds.intersects(this._getExpandedVisibleBounds())?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds)return this._map.getBounds();var t=this._map,e=t.getBounds(),i=e._southWest,n=e._northEast,s=L.Browser.mobile?0:Math.abs(i.lat-n.lat),r=L.Browser.mobile?0:Math.abs(i.lng-n.lng);return new L.LatLngBounds(new L.LatLng(i.lat-s,i.lng-r,!0),new L.LatLng(n.lat+s,n.lng+r,!0))},_animationAddLayerNonAnimated:function(t,e){if(e===t)this._featureGroup.addLayer(t);else if(2===e._childCount){e._addToMap();var i=e.getAllChildMarkers();this._featureGroup.removeLayer(i[0]),this._featureGroup.removeLayer(i[1])}else e._updateIcon()}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_animationZoomIn:function(t,e){var i,n=this._getExpandedVisibleBounds(),s=this._featureGroup;this._topClusterLevel._recursively(n,t,0,function(r){var o,a=r._latlng,h=r._markers;for(n.contains(a)||(a=null),r._isSingleParent()&&t+1===e?(s.removeLayer(r),r._recursivelyAddChildrenToMap(null,e,n)):(r.setOpacity(0),r._recursivelyAddChildrenToMap(a,e,n)),i=h.length-1;i>=0;i--)o=h[i],n.contains(o._latlng)||s.removeLayer(o)}),this._forceLayout(),this._topClusterLevel._recursivelyBecomeVisible(n,e),s.eachLayer(function(t){t instanceof L.MarkerCluster||!t._icon||t.setOpacity(1)}),this._topClusterLevel._recursively(n,t,e,function(t){t._recursivelyRestoreChildPositions(e)}),this._enqueue(function(){this._topClusterLevel._recursively(n,t,0,function(t){s.removeLayer(t),t.setOpacity(1)}),this._animationEnd()})},_animationZoomOut:function(t,e){this._animationZoomOutSingle(this._topClusterLevel,t-1,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(t,e,i){var n=this._getExpandedVisibleBounds();t._recursivelyAnimateChildrenInAndAddSelfToMap(n,e+1,i);var s=this;this._forceLayout(),t._recursivelyBecomeVisible(n,i),this._enqueue(function(){if(1===t._childCount){var r=t._markers[0];r.setLatLng(r.getLatLng()),r.setOpacity&&r.setOpacity(1)}else t._recursively(n,i,0,function(t){t._recursivelyRemoveChildrenFromMap(n,e+1)});s._animationEnd()})},_animationAddLayer:function(t,e){var i=this,n=this._featureGroup;n.addLayer(t),e!==t&&(e._childCount>2?(e._updateIcon(),this._forceLayout(),this._animationStart(),t._setPos(this._map.latLngToLayerPoint(e.getLatLng())),t.setOpacity(0),this._enqueue(function(){n.removeLayer(t),t.setOpacity(1),i._animationEnd()})):(this._forceLayout(),i._animationStart(),i._animationZoomOutSingle(e,this._map.getMaxZoom(),this._map.getZoom())))},_forceLayout:function(){L.Util.falseFn(e.body.offsetWidth)}}:{_animationStart:function(){},_animationZoomIn:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this.fire("animationend")},_animationZoomOut:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this.fire("animationend")},_animationAddLayer:function(t,e){this._animationAddLayerNonAnimated(t,e)}}),L.markerClusterGroup=function(t){return new L.MarkerClusterGroup(t)},L.MarkerCluster=L.Marker.extend({initialize:function(t,e,i,n){L.Marker.prototype.initialize.call(this,i?i._cLatLng||i.getLatLng():new L.LatLng(0,0),{icon:this}),this._group=t,this._zoom=e,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._bounds=new L.LatLngBounds,i&&this._addChild(i),n&&this._addChild(n)},getAllChildMarkers:function(t){t=t||[];for(var e=this._childClusters.length-1;e>=0;e--)this._childClusters[e].getAllChildMarkers(t);for(var i=this._markers.length-1;i>=0;i--)t.push(this._markers[i]);return t},getChildCount:function(){return this._childCount},zoomToBounds:function(){for(var t,e=this._childClusters.slice(),i=this._group._map,n=i.getBoundsZoom(this._bounds),s=this._zoom+1,r=i.getZoom();e.length>0&&n>s;){s++;var o=[];for(t=0;t<e.length;t++)o=o.concat(e[t]._childClusters);e=o}n>s?this._group._map.setView(this._latlng,s):r>=n?this._group._map.setView(this._latlng,r+1):this._group._map.fitBounds(this._bounds)},getBounds:function(){var t=new L.LatLngBounds;return t.extend(this._bounds),t},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(t,e){this._iconNeedsUpdate=!0,this._expandBounds(t),t instanceof L.MarkerCluster?(e||(this._childClusters.push(t),t.__parent=this),this._childCount+=t._childCount):(e||this._markers.push(t),this._childCount++),this.__parent&&this.__parent._addChild(t,!0)},_expandBounds:function(t){var e,i=t._wLatLng||t._latlng;t instanceof L.MarkerCluster?(this._bounds.extend(t._bounds),e=t._childCount):(this._bounds.extend(i),e=1),this._cLatLng||(this._cLatLng=t._cLatLng||i);var n=this._childCount+e;this._wLatLng?(this._wLatLng.lat=(i.lat*e+this._wLatLng.lat*this._childCount)/n,this._wLatLng.lng=(i.lng*e+this._wLatLng.lng*this._childCount)/n):this._latlng=this._wLatLng=new L.LatLng(i.lat,i.lng)},_addToMap:function(t){t&&(this._backupLatlng=this._latlng,this.setLatLng(t)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(t,e,i){this._recursively(t,0,i-1,function(t){var i,n,s=t._markers;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))},function(t){var i,n,s=t._childClusters;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(t,e,i){this._recursively(t,i,0,function(n){n._recursivelyAnimateChildrenIn(t,n._group._map.latLngToLayerPoint(n.getLatLng()).round(),e),n._isSingleParent()&&e-1===i?(n.setOpacity(1),n._recursivelyRemoveChildrenFromMap(t,e)):n.setOpacity(0),n._addToMap()})},_recursivelyBecomeVisible:function(t,e){this._recursively(t,0,e,null,function(t){t.setOpacity(1)})},_recursivelyAddChildrenToMap:function(t,e,i){this._recursively(i,-1,e,function(n){if(e!==n._zoom)for(var s=n._markers.length-1;s>=0;s--){var r=n._markers[s];i.contains(r._latlng)&&(t&&(r._backupLatlng=r.getLatLng(),r.setLatLng(t),r.setOpacity&&r.setOpacity(0)),n._group._featureGroup.addLayer(r))}},function(e){e._addToMap(t)})},_recursivelyRestoreChildPositions:function(t){for(var e=this._markers.length-1;e>=0;e--){var i=this._markers[e];i._backupLatlng&&(i.setLatLng(i._backupLatlng),delete i._backupLatlng)}if(t-1===this._zoom)for(var n=this._childClusters.length-1;n>=0;n--)this._childClusters[n]._restorePosition();else for(var s=this._childClusters.length-1;s>=0;s--)this._childClusters[s]._recursivelyRestoreChildPositions(t)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(t,e,i){var n,s;this._recursively(t,-1,e-1,function(t){for(s=t._markers.length-1;s>=0;s--)n=t._markers[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))},function(t){for(s=t._childClusters.length-1;s>=0;s--)n=t._childClusters[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))})},_recursively:function(t,e,i,n,s){var r,o,a=this._childClusters,h=this._zoom;if(e>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s);else if(n&&n(this),s&&this._zoom===i&&s(this),i>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s)},_recalculateBounds:function(){var t,e=this._markers,i=this._childClusters;for(this._bounds=new L.LatLngBounds,delete this._wLatLng,t=e.length-1;t>=0;t--)this._expandBounds(e[t]);for(t=i.length-1;t>=0;t--)this._expandBounds(i[t])},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),L.DistanceGrid=function(t){this._cellSize=t,this._sqCellSize=t*t,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(t,e){var i=this._getCoord(e.x),n=this._getCoord(e.y),s=this._grid,r=s[n]=s[n]||{},o=r[i]=r[i]||[],a=L.Util.stamp(t);this._objectPoint[a]=e,o.push(t)},updateObject:function(t,e){this.removeObject(t),this.addObject(t,e)},removeObject:function(t,e){var i,n,s=this._getCoord(e.x),r=this._getCoord(e.y),o=this._grid,a=o[r]=o[r]||{},h=a[s]=a[s]||[];for(delete this._objectPoint[L.Util.stamp(t)],i=0,n=h.length;n>i;i++)if(h[i]===t)return h.splice(i,1),1===n&&delete a[s],!0},eachObject:function(t,e){var i,n,s,r,o,a,h,_=this._grid;for(i in _){o=_[i];for(n in o)for(a=o[n],s=0,r=a.length;r>s;s++)h=t.call(e,a[s]),h&&(s--,r--)}},getNearObject:function(t){var e,i,n,s,r,o,a,h,_=this._getCoord(t.x),u=this._getCoord(t.y),l=this._objectPoint,d=this._sqCellSize,p=null;for(e=u-1;u+1>=e;e++)if(s=this._grid[e])for(i=_-1;_+1>=i;i++)if(r=s[i])for(n=0,o=r.length;o>n;n++)a=r[n],h=this._sqDist(l[L.Util.stamp(a)],t),d>h&&(d=h,p=a);return p},_getCoord:function(t){return Math.floor(t/this._cellSize)},_sqDist:function(t,e){var i=e.x-t.x,n=e.y-t.y;return i*i+n*n}},function(){L.QuickHull={getDistant:function(t,e){var i=e[1].lat-e[0].lat,n=e[0].lng-e[1].lng;return n*(t.lat-e[0].lat)+i*(t.lng-e[0].lng)},findMostDistantPointFromBaseLine:function(t,e){var i,n,s,r=0,o=null,a=[];for(i=e.length-1;i>=0;i--)n=e[i],s=this.getDistant(n,t),s>0&&(a.push(n),s>r&&(r=s,o=n));return{maxPoint:o,newPoints:a}},buildConvexHull:function(t,e){var i=[],n=this.findMostDistantPointFromBaseLine(t,e);return n.maxPoint?(i=i.concat(this.buildConvexHull([t[0],n.maxPoint],n.newPoints)),i=i.concat(this.buildConvexHull([n.maxPoint,t[1]],n.newPoints))):[t[0]]},getConvexHull:function(t){var e,i=!1,n=!1,s=null,r=null;for(e=t.length-1;e>=0;e--){var o=t[e];(i===!1||o.lat>i)&&(s=o,i=o.lat),(n===!1||o.lat<n)&&(r=o,n=o.lat)}var a=[].concat(this.buildConvexHull([r,s],t),this.buildConvexHull([s,r],t));return a}}}(),L.MarkerCluster.include({getConvexHull:function(){var t,e,i=this.getAllChildMarkers(),n=[];for(e=i.length-1;e>=0;e--)t=i[e].getLatLng(),n.push(t);return L.QuickHull.getConvexHull(n)}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var t,e=this.getAllChildMarkers(),i=this._group,n=i._map,s=n.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,e.length>=this._circleSpiralSwitchover?t=this._generatePointsSpiral(e.length,s):(s.y+=10,t=this._generatePointsCircle(e.length,s)),this._animationSpiderfy(e,t)}},unspiderfy:function(t){this._group._inZoomAnimation||(this._animationUnspiderfy(t),this._group._spiderfied=null)},_generatePointsCircle:function(t,e){var i,n,s=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+t),r=s/this._2PI,o=this._2PI/t,a=[];for(a.length=t,i=t-1;i>=0;i--)n=this._circleStartAngle+i*o,a[i]=new L.Point(e.x+r*Math.cos(n),e.y+r*Math.sin(n))._round();return a},_generatePointsSpiral:function(t,e){var i,n=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,s=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,r=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,o=0,a=[];for(a.length=t,i=t-1;i>=0;i--)o+=s/n+5e-4*i,a[i]=new L.Point(e.x+n*Math.cos(o),e.y+n*Math.sin(o))._round(),n+=this._2PI*r/o;return a},_noanimationUnspiderfy:function(){var t,e,i=this._group,n=i._map,s=i._featureGroup,r=this.getAllChildMarkers();for(this.setOpacity(1),e=r.length-1;e>=0;e--)t=r[e],s.removeLayer(t),t._preSpiderfyLatlng&&(t.setLatLng(t._preSpiderfyLatlng),delete t._preSpiderfyLatlng),t.setZIndexOffset&&t.setZIndexOffset(0),t._spiderLeg&&(n.removeLayer(t._spiderLeg),delete t._spiderLeg);i._spiderfied=null}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{SVG_ANIMATION:function(){return e.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(t,i){var n,s,r,o,a=this,h=this._group,_=h._map,u=h._featureGroup,l=_.latLngToLayerPoint(this._latlng);for(n=t.length-1;n>=0;n--)s=t[n],s.setOpacity?(s.setZIndexOffset(1e6),s.setOpacity(0),u.addLayer(s),s._setPos(l)):u.addLayer(s);h._forceLayout(),h._animationStart();var d=L.Path.SVG?0:.3,p=L.Path.SVG_NS;for(n=t.length-1;n>=0;n--)if(o=_.layerPointToLatLng(i[n]),s=t[n],s._preSpiderfyLatlng=s._latlng,s.setLatLng(o),s.setOpacity&&s.setOpacity(1),r=new L.Polyline([a._latlng,o],{weight:1.5,color:"#222",opacity:d}),_.addLayer(r),s._spiderLeg=r,L.Path.SVG&&this.SVG_ANIMATION){var c=r._path.getTotalLength();r._path.setAttribute("stroke-dasharray",c+","+c);var f=e.createElementNS(p,"animate");f.setAttribute("attributeName","stroke-dashoffset"),f.setAttribute("begin","indefinite"),f.setAttribute("from",c),f.setAttribute("to",0),f.setAttribute("dur",.25),r._path.appendChild(f),f.beginElement(),f=e.createElementNS(p,"animate"),f.setAttribute("attributeName","stroke-opacity"),f.setAttribute("attributeName","stroke-opacity"),f.setAttribute("begin","indefinite"),f.setAttribute("from",0),f.setAttribute("to",.5),f.setAttribute("dur",.25),r._path.appendChild(f),f.beginElement()}if(a.setOpacity(.3),L.Path.SVG)for(this._group._forceLayout(),n=t.length-1;n>=0;n--)s=t[n]._spiderLeg,s.options.opacity=.5,s._path.setAttribute("stroke-opacity",.5);setTimeout(function(){h._animationEnd(),h.fire("spiderfied")},200)},_animationUnspiderfy:function(t){var e,i,n,s=this._group,r=s._map,o=s._featureGroup,a=t?r._latLngToNewLayerPoint(this._latlng,t.zoom,t.center):r.latLngToLayerPoint(this._latlng),h=this.getAllChildMarkers(),_=L.Path.SVG&&this.SVG_ANIMATION;for(s._animationStart(),this.setOpacity(1),i=h.length-1;i>=0;i--)e=h[i],e._preSpiderfyLatlng&&(e.setLatLng(e._preSpiderfyLatlng),delete e._preSpiderfyLatlng,e.setOpacity?(e._setPos(a),e.setOpacity(0)):o.removeLayer(e),_&&(n=e._spiderLeg._path.childNodes[0],n.setAttribute("to",n.getAttribute("from")),n.setAttribute("from",0),n.beginElement(),n=e._spiderLeg._path.childNodes[1],n.setAttribute("from",.5),n.setAttribute("to",0),n.setAttribute("stroke-opacity",0),n.beginElement(),e._spiderLeg._path.setAttribute("stroke-opacity",0)));setTimeout(function(){var t=0;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&t++;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&(e.setOpacity&&(e.setOpacity(1),e.setZIndexOffset(0)),t>1&&o.removeLayer(e),r.removeLayer(e._spiderLeg),delete e._spiderLeg);s._animationEnd()},200)}}:{_animationSpiderfy:function(t,e){var i,n,s,r,o=this._group,a=o._map,h=o._featureGroup;for(i=t.length-1;i>=0;i--)r=a.layerPointToLatLng(e[i]),n=t[i],n._preSpiderfyLatlng=n._latlng,n.setLatLng(r),n.setZIndexOffset&&n.setZIndexOffset(1e6),h.addLayer(n),s=new L.Polyline([this._latlng,r],{weight:1.5,color:"#222"}),a.addLayer(s),n._spiderLeg=s;this.setOpacity(.3),o.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation&&this._map.on("zoomstart",this._unspiderfyZoomStart,this),this._map.on("zoomend",this._noanimationUnspiderfy,this),L.Path.SVG&&!L.Browser.touch&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy()},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(t){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(t))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(t){this._spiderfied&&this._spiderfied.unspiderfy(t)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(t){t._spiderLeg&&(this._featureGroup.removeLayer(t),t.setOpacity(1),t.setZIndexOffset(0),this._map.removeLayer(t._spiderLeg),delete t._spiderLeg)}})}(window,document);
}).call(global, module, undefined, undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"leaflet":3}],9:[function(require,module,exports){
module.exports = {
		Thematic: require('thematic'),
		modules: {
			'IModule': require('imodule'),
			'Dasymetric': require('thematic-dot-choropleth'),
			'Choropleth': require('thematic-choropleth'),
			'Dot': require('thematic-dot'),
			'Heatmap': require('thematic-heatmap'),
			'Isarithmic': require('thematic-dot-choropleth')
		}, 
		converters: require('converters'),
		aggregators: {
			average: require('average-aggregator'),
			separateValues: require('separate-values-aggregator')
		},
		utils: {
			PromisePure: require('promise-sync')
		}
	};
},{"average-aggregator":16,"converters":17,"imodule":14,"promise-sync":18,"separate-values-aggregator":19,"thematic":15,"thematic-choropleth":10,"thematic-dot":12,"thematic-dot-choropleth":11,"thematic-heatmap":13}],10:[function(require,module,exports){
var _ = require('underscore');
_ = window._ || _;
var L = require('leaflet');
L = window.L || L;

var IModule = require('imodule');

var defaults = {
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	}
}

function Choropleth(opts) {
	var opts = _.defaults(opts || {}, defaults);

	var dataLayer;

	this.show = function() {
		this.statusChanged('loading');
		var map = this.map;
		this.data.then(function(data) {

			dataLayer = L.geoJson(data, {
				style: function(feature) {
					// TODO parameterize other options
					var value = feature.properties[opts.field];
					return {color: this.scale(value), weight: 1, opacity: 0.7, fillOpacity: 0.5};
				}.bind(this),
				onEachFeature: function(feature, layer) {
					var value = typeof opts.popupText === 'function' ? opts.popupText(feature) : opts.popupText;
					if (value) {
						layer.bindPopup(value);
					}
				}
			}).addTo(map);
			this.statusChanged('ready');
		}.bind(this));

		return this;
	};

	this.remove = function() {
		this.map.removeLayer(dataLayer);
	}
}

Choropleth.prototype = IModule;

module.exports = Choropleth;
},{"imodule":14,"leaflet":3,"underscore":4}],11:[function(require,module,exports){
var _ = require('underscore');
_ = window._ || _;
var L = require('leaflet');
L = window.L || L;

var IModule = require('imodule');

function DotChoropleth(opts) {
	this.layers = [];

	this.setData = function(data, field) {
		IModule.setData.call(this, data);
		this.field = field;
		return this;
	};

	this.show = function() {
		var map = this.map;
		this.statusChanged('loading');
		this.data.then(function(results) {
			var start = new Date().getTime();
			var dots = results.features;

			// assume step is identical for all data
			var latStep = getStep(dots, 'lat');
			var lngStep = getStep(dots, 'lng');

			// remove old layers
			_.each(this.layers, function(it) { map.removeLayer(it); });

			_.map(dots, function(dot) {
				var northWest = L.latLng(
						dot.geometry.coordinates[1] - latStep / 2,
						dot.geometry.coordinates[0] - lngStep / 2);
				var southEast = L.latLng(
						dot.geometry.coordinates[1] + latStep / 2,
						dot.geometry.coordinates[0] + lngStep / 2);
				var coords = L.latLngBounds(northWest,southEast);

				var value = dot.properties[this.field];
				var color = this.scale(value);

				var rect = L.rectangle(coords.pad(0.01), {color: color, opacity: 0, fillOpacity: 0.5, weight: 1})
								.bindPopup('Average travel time: ' + value.toFixed(2) + ' min')
								.addTo(map);
				this.layers.push(rect);
			}.bind(this));

			console.log('render took', new Date().getTime() - start, 'ms');
			this.statusChanged('ready');
			
		}.bind(this));

		return this;
	}
}

DotChoropleth.prototype = IModule;

function getStep(data, type) {
	if (type == 'lat') {
		var index = 1;
		var isSorted = true;
	} else {
		var index = 0;
		var isSorted = false;
	}

	var values = _.chain(data).map(function(it) { return it.geometry.coordinates[index]; }).uniq(isSorted).value();
	return Math.abs((_.last(values) - _.first(values)) / values.length);
}

module.exports = DotChoropleth;
},{"imodule":14,"leaflet":3,"underscore":4}],12:[function(require,module,exports){
var _ = require('underscore');
_ = window._ || _;

var L = require('leaflet');
L = window.L || L;

var IModule = require('imodule');
var MarkerCluster = require('leaflet-markercluster');
require('../../lib/MarkerCluster.css');
require('../../lib/MarkerCluster.Default.css');

var defaults = {
	type: 'dot', // 
	proportionalProperty: undefined,
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	},
	cluster: true,
	maxClusterRadius: 50, 
	showCoverageOnHover: false
}

function Dot(opts) {

	var opts = _.defaults(opts || {}, defaults);

	var clusterOpts = _.omit(opts, 'popupText', 'cluster');

	var markers = opts.cluster ? new L.MarkerClusterGroup(clusterOpts) : L.layerGroup();

	var getMarker = function(point, props) {
		var marker;
		var popupText = typeof opts.popupText === 'function' ? opts.popupText(props) : opts.popupText;

		if (opts.type === 'dot') {
			marker = L.marker(point);	
		} else {
			var radius = this.scale ? this.scale(props.properties[opts.proportionalProperty]) : props.properties[opts.proportionalProperty];
			marker = L.circle(point, radius, {weight: 1});
		}

		if (popupText) {
			marker.bindPopup(popupText);
		}
		return marker;
	}.bind(this);

	this.show = function() {

		var map = this.map;
		if (!map.hasLayer(markers)) {
			markers.addTo(map);
		}
		this.statusChanged('loading');
		this.data.then(function(data) {
			markers.clearLayers();
			var latlngs = _.map(data.features, function(poi) {
				var point = L.latLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]);
				var marker = getMarker(point, poi);

				markers.addLayer(marker)
			});
			this.statusChanged('ready');
		}.bind(this));

		return this;
	};

	this.remove = function() {
		this.map.removeLayer(markers);
	}
}

Dot.prototype = IModule;

module.exports = Dot;
},{"../../lib/MarkerCluster.Default.css":5,"../../lib/MarkerCluster.css":6,"imodule":14,"leaflet":3,"leaflet-markercluster":8,"underscore":4}],13:[function(require,module,exports){
var _ = require('underscore');
_ = window._ || _;
var L = require('leaflet');
L = window.L || L;


var HeatmapOverlay = require('leaflet-heatmap');
var IModule = require('imodule');

var defaultConfig = {
	// radius should be small ONLY if scaleRadius is true (or small radius is intended)
	// if scaleRadius is false it will be the constant radius used in pixels
	"radius": 0.012,
	"maxOpacity": .6, 
	// scales the radius based on map zoom
	"scaleRadius": true, 
	// if set to false the heatmap uses the global maximum for colorization
	// if activated: uses the data maximum within the current map boundaries 
	//   (there will always be a red spot with useLocalExtremas true)
	"useLocalExtrema": true,
	// which field name in your data represents the latitude - default "lat"
	latField: 'lat',
	// which field name in your data represents the longitude - default "lng"
	lngField: 'lng',
	// which field name in your data represents the data value - default "value"
	valueField: 'value'
};

function Heatmap(config) {
	var config = _.defaults(config || {}, defaultConfig);
	this.layer = undefined;
	this.setData = function(rawData) { // TODO parameterize normalization
		rawData.then(function(data) {
			var features = data.features;
			var average = _.reduce(features, function(memo, it){ return memo + it.properties.time; }, 0) / features.length;

			var data = _.map(features, function(it) {
				var max = 50;
				var value = max - Math.min(it.properties.time, max);

				return {lat: it.geometry.coordinates[1], lng: it.geometry.coordinates[0], value: value, every: it.properties.every};
			});
			var max = _.max(data, function(it) { return it.time; });

			this.layer.setData({
				max: max.time,
				data: data
			});
		}.bind(this));
		return this;
	};
	this.show = function() {
		if (this.layer) {
			this.map.removeLayer(this.layer);
		}

		this.layer = new HeatmapOverlay(config);
		this.map.addLayer(this.layer);
	};
}

Heatmap.prototype = IModule;

module.exports = Heatmap;
},{"imodule":14,"leaflet":3,"leaflet-heatmap":7,"underscore":4}],14:[function(require,module,exports){
var statuses = ['ready', 'loading', 'error'];

var IModule = {
	isThematicModule: true,
	status: 'ready', // by default, status is ready (the case of getting data synchronously)
	scale: function(value) {
		return value; // identity scale as default
	},
	setScale: function(scale) {
		this.scale = scale;
		return this;
	},
	setData: function(data) {
		this.data = data;

		// handle rejected promises
		if (this.data && typeof this.data.then === 'function') {
			this.data.then(null, function(error) {
				console.warn('error fetching data', arguments);
				this.statusChanged('error');
			}.bind(this));
		}

		return this;
	},
	addTo: function(id, thematic) {
		if (typeof this.show !== 'function') {
			throw new Error("Thematic modules must have method show for displaying the data.");
		}

		this.id = id;
		this.map = thematic.map;
		this.thematic = thematic;
		this.show();
		return this;
	},
	remove: function() {
		throw new Error('Module has not implemented remove method - can\'t remove it');
	},
	statusChanged: function(status) {
		if (statuses.indexOf(status) === -1) {
			console.warn('Unsupported status string', status);
		}
		this.status = status;
		this.thematic.moduleStatusChanged(this.id);
	}
};


module.exports = IModule;
},{}],15:[function(require,module,exports){
var L = require('leaflet');
L = window.L || L;

var _ = require('underscore');
_ = window._ || _;
//require('../../../node_modules/leaflet/dist/leaflet.css');

polyfillPromises();

var defaults = {
    center: [60.199324, 24.941025],
    zoom: 10,
    maxZoom: 18,
    attribution: 'Maps by OpenStreetMap',
    tms: false,
    tileUrl: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    imagePath: 'images/leaflet/',
    trackViewport: false,
    appCache: 'confirm' // confirm, auto, false
};

function init(el, opts) {

    if (!el) {
        throw new Error('Error initializing Thematic - the element is not a DOM element');
    }

    addClass(el, 'thematic-map');

    if (typeof el === 'string') {
        el = document.getElementById(el);
    }

    addInfoPanels(this, el);

    opts = _.defaults(opts || {}, defaults);

    L.Icon.Default.imagePath = opts.imagePath;

    var tileOpts = _.omit(opts, 'center', 'zoom', 'tileUrl', 'imagePath', 'trackViewport');

    this.map = L.map(el).setView(opts.center, opts.zoom);
    L.tileLayer(opts.tileUrl, tileOpts).addTo(this.map);

    if (opts.trackViewport) {
        trackViewport(this, this.map);
    }

    if (opts.appCache === 'confirm') {
        reloadOnUpdate(true);
    } else if (opts.appCache == 'auto') {
        reloadOnUpdate(false);
    }

    var modules = [];
    
    // public methods ---------------------

    this.addModule = function(id, module) {
        if (!module || !module.isThematicModule || typeof module.addTo !== 'function') {
            throw new Error('module must be a Thematic.js module.');
        }
        module.addTo(id, this);
        modules.push(module);
        this.moduleStatusChanged(id);
        return module; // allow chaining
    };

    this.removeModule = function(id) {
        // TODO
        var module = _.find(modules, function(it) { return it.id === id; });
        var i = modules.indexOf(module);
        modules.splice(i, 1);

        module.remove();
    };

    this.getModules = function() {
        return _.clone(modules);
    }

    this.moduleStatusChanged = function(id) {
        _.each(this.info, function(it) {
            it.condition(modules) ? removeClass(it.el, 'hide') : addClass(it.el, 'hide'); 
        });
    };
}

// TODO: this may be better done manually when using this library
function polyfillPromises() {
    if (!('Promise' in window) && 'ES6Promise' in window) {
        window.Promise = ES6Promise.Promise;
    }
}

function reloadOnUpdate(confirmReload) {
    if (window.applicationCache) {
      applicationCache.addEventListener('updateready', function() {
        if (!confirmReload || confirm('An update is available. Reload now?')) {
          window.location.reload();
        }
      });
    }
}

function trackViewport(thematic, map) {
    function setHash(center, zoom) {
        var hash = '#' + center.lat + ',' + center.lng + '/' + zoom;
        document.location.hash = hash;
    }

    function updateLocation() {
        setHash(map.getCenter(), map.getZoom());
    }

    function parseLocation(hash) {
        var re = /([0-9\.]+),([0-9\.]+)\/([0-9]+)/;
        var parts = hash.match(re)
        if (parts) {
            return {center: new L.LatLng(parts[1], parts[2]), zoom: parts[3]};
        } else {
            return null;
        }
        
    }

    var location = parseLocation(document.location.hash.substring(1));
    if (location) {
        map.setView(location.center, location.zoom);
    }

    map.on('moveend', updateLocation);
    map.on('zoomend', updateLocation)
}

function addInfoPanels(thematic, el) {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'loading-indicator';
    var spinnerImg = document.createElement('img');
    spinnerImg.src = "/images/loading-spin.svg";
    spinnerDiv.appendChild(spinnerImg);
    el.appendChild(spinnerDiv);

    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message hide';
    var messageDiv = document.createElement('div');
    messageDiv.className = 'error-text';
    messageDiv.textContent = 'Error loading content.';
    errorDiv.appendChild(messageDiv);
    el.appendChild(errorDiv);

    thematic.info = [
        {
            condition: function(modules) { 
                return _.some(modules, function(it) { return it.status === 'loading'; });
            },
            el: spinnerDiv
        },
        {
            condition: function(modules) {
                return _.some(modules, function(it) { return it.status === 'error'; });
            },
            el: errorDiv
        }
    ];
}

function removeClass(el, className) {
    el.className = _.filter(el.className.split(' '), function(it) { return it !== className }).join(' ');
}

function addClass(el, className) {
    var classes = el.className.split(' ');
    classes.push(className);
    el.className = classes.join(' ');
}


module.exports = init;
},{"leaflet":3,"underscore":4}],16:[function(require,module,exports){
var _ = require('underscore');
_ = window._ || _;

function getImportance(props) {
	return typeof props.importance === 'number' ? props.importance : 1;
}

function getAverage(values, field) {
	var total = _.reduce(values, function(memo, it) { return memo + getImportance(it); }, 0);
	return _.reduce(values, function(memo, it) { return memo + it[field] * getImportance(it); }, 0) / total;
}

function aggregate(data, field) {
	var start = new Date().getTime();
	var dots = _.chain(data).map(function(it) { return it.features; }).flatten().groupBy(function(it) { return it.geometry.coordinates; }).value();
	var aggregate = _.map(dots, function(group) {
		var props = {};

		props[field] = getAverage(_.map(group, function(it) { return it.properties; }), field);

		return {
			geometry: group[0].geometry,
			properties: props
		};
	});

	console.log('aggregate took', new Date().getTime() - start, 'ms');

	return {
		features: aggregate,
		type: "FeatureCollection"
	};
}

module.exports = aggregate;
},{"underscore":4}],17:[function(require,module,exports){
var _ = require('underscore', '_');
_ = window._ || _;

var converters = {
	/**
	 * Converts from "flat" JSON format to GeoJSON point FeatureCollection used by Thematic.js.
	 * Flat input format is a custom format which consists of array of JSON objects. JSON 
	 * objects contain "latitude" and "longitude" properties and, optionally, other properties.
	 * Input format example:
	 * [
	 *		{
	 *			storeId: "2102",
	 *			name: "Helsinki keskusta Arkadia",
	 *			url: "/myymalat/2102/",
	 * 			latitude: 60.170814,
	 *			longitude: 24.934792,
	 * 			address: "Salomonkatu 1",
	 *			postalCode: "00100",
	 *			locality: "HELSINKI"
	 *		},
	 * 		...
	 * ]
	 */
	flatToGeoJSON: function(flatArray) {
		return {
			type: "FeatureCollection",
			features: _.map(flatArray, function(point) { 
				return {
					geometry: {coordinates: [point.longitude, point.latitude]},
					properties: _.omit(point, 'latitude', 'longitude')
				};
			})
		};
	}
};

module.exports = converters;
},{"underscore":4}],18:[function(require,module,exports){
var PromisePure = function(data) {
	return new Promise(function(resolve, reject) { resolve(data); });
};

module.exports = PromisePure;
},{}],19:[function(require,module,exports){
var _ = require('underscore');
/**
 * Combines GeoJSON data such as Country borders with other data such as population density for each country.
 * 
 *
 */
function aggregate(idField, valueField) {
	return function(geojson, extras) {
		var withExtras = _.extend({}, geojson);

		_.each(withExtras.features, function(it) {
			it.properties[valueField] = extras[it.properties[idField]];
		});

		return withExtras;
	}
}


module.exports = aggregate;
},{"underscore":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC90aGVtYXRpYy9nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvbGVhZmxldC9kaXN0L2xlYWZsZXQtc3JjLmpzIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsInNyYy9qYXZhc2NyaXB0L2xpYi9NYXJrZXJDbHVzdGVyLkRlZmF1bHQuY3NzIiwic3JjL2phdmFzY3JpcHQvbGliL01hcmtlckNsdXN0ZXIuY3NzIiwic3JjL2phdmFzY3JpcHQvbGliL2xlYWZsZXQtaGVhdG1hcC5qcyIsInNyYy9qYXZhc2NyaXB0L2xpYi9sZWFmbGV0Lm1hcmtlcmNsdXN0ZXIuanMiLCJzcmMvamF2YXNjcmlwdC90aGVtYXRpYy9pbmRleC5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL21vZHVsZXMvY2hvcm9wbGV0aC5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL21vZHVsZXMvZG90LWNob3JvcGxldGguanMiLCJzcmMvamF2YXNjcmlwdC90aGVtYXRpYy9tb2R1bGVzL2RvdC5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL21vZHVsZXMvaGVhdG1hcC5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL21vZHVsZXMvaW1vZHVsZS5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL3RoZW1hdGljLmpzIiwic3JjL2phdmFzY3JpcHQvdGhlbWF0aWMvdXRpbHMvYXZlcmFnZS1hZ2dyZWdhdG9yLmpzIiwic3JjL2phdmFzY3JpcHQvdGhlbWF0aWMvdXRpbHMvY29udmVydGVycy5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL3V0aWxzL3Byb21pc2Utc3luYy5qcyIsInNyYy9qYXZhc2NyaXB0L3RoZW1hdGljL3V0aWxzL3NlcGFyYXRlLXZhbHVlcy1hZ2dyZWdhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdjRDQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiOyhmdW5jdGlvbigpIHtcblx0d2luZG93LnRoZW1hdGljID0gcmVxdWlyZSgnaW5kZXgnKTtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIGRvYy5jcmVhdGVTdHlsZVNoZWV0KCkuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBzdHlsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gIFxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG4gICAgXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7IFxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieVVybCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAoZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQodXJsKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG4gIFxuICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7IFxuICB9XG59O1xuIiwiLypcbiBMZWFmbGV0LCBhIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgbW9iaWxlLWZyaWVuZGx5IGludGVyYWN0aXZlIG1hcHMuIGh0dHA6Ly9sZWFmbGV0anMuY29tXG4gKGMpIDIwMTAtMjAxMywgVmxhZGltaXIgQWdhZm9ua2luXG4gKGMpIDIwMTAtMjAxMSwgQ2xvdWRNYWRlXG4qL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcclxudmFyIG9sZEwgPSB3aW5kb3cuTCxcclxuICAgIEwgPSB7fTtcclxuXHJcbkwudmVyc2lvbiA9ICcwLjcuMic7XHJcblxyXG4vLyBkZWZpbmUgTGVhZmxldCBmb3IgTm9kZSBtb2R1bGUgcGF0dGVybiBsb2FkZXJzLCBpbmNsdWRpbmcgQnJvd3NlcmlmeVxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cdG1vZHVsZS5leHBvcnRzID0gTDtcclxuXHJcbi8vIGRlZmluZSBMZWFmbGV0IGFzIGFuIEFNRCBtb2R1bGVcclxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuXHRkZWZpbmUoTCk7XHJcbn1cclxuXHJcbi8vIGRlZmluZSBMZWFmbGV0IGFzIGEgZ2xvYmFsIEwgdmFyaWFibGUsIHNhdmluZyB0aGUgb3JpZ2luYWwgTCB0byByZXN0b3JlIGxhdGVyIGlmIG5lZWRlZFxyXG5cclxuTC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdHdpbmRvdy5MID0gb2xkTDtcclxuXHRyZXR1cm4gdGhpcztcclxufTtcclxuXHJcbndpbmRvdy5MID0gTDtcclxuXG5cbi8qXHJcbiAqIEwuVXRpbCBjb250YWlucyB2YXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zIHVzZWQgdGhyb3VnaG91dCBMZWFmbGV0IGNvZGUuXHJcbiAqL1xyXG5cclxuTC5VdGlsID0ge1xyXG5cdGV4dGVuZDogZnVuY3Rpb24gKGRlc3QpIHsgLy8gKE9iamVjdFssIE9iamVjdCwgLi4uXSkgLT5cclxuXHRcdHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuXHRcdCAgICBpLCBqLCBsZW4sIHNyYztcclxuXHJcblx0XHRmb3IgKGogPSAwLCBsZW4gPSBzb3VyY2VzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XHJcblx0XHRcdHNyYyA9IHNvdXJjZXNbal0gfHwge307XHJcblx0XHRcdGZvciAoaSBpbiBzcmMpIHtcclxuXHRcdFx0XHRpZiAoc3JjLmhhc093blByb3BlcnR5KGkpKSB7XHJcblx0XHRcdFx0XHRkZXN0W2ldID0gc3JjW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlc3Q7XHJcblx0fSxcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKGZuLCBvYmopIHsgLy8gKEZ1bmN0aW9uLCBPYmplY3QpIC0+IEZ1bmN0aW9uXHJcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IG51bGw7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gZm4uYXBwbHkob2JqLCBhcmdzIHx8IGFyZ3VtZW50cyk7XHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdHN0YW1wOiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxhc3RJZCA9IDAsXHJcblx0XHQgICAga2V5ID0gJ19sZWFmbGV0X2lkJztcclxuXHRcdHJldHVybiBmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRcdG9ialtrZXldID0gb2JqW2tleV0gfHwgKytsYXN0SWQ7XHJcblx0XHRcdHJldHVybiBvYmpba2V5XTtcclxuXHRcdH07XHJcblx0fSgpKSxcclxuXHJcblx0aW52b2tlRWFjaDogZnVuY3Rpb24gKG9iaiwgbWV0aG9kLCBjb250ZXh0KSB7XHJcblx0XHR2YXIgaSwgYXJncztcclxuXHJcblx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcclxuXHRcdFx0YXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XHJcblxyXG5cdFx0XHRmb3IgKGkgaW4gb2JqKSB7XHJcblx0XHRcdFx0bWV0aG9kLmFwcGx5KGNvbnRleHQsIFtpLCBvYmpbaV1dLmNvbmNhdChhcmdzKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdGxpbWl0RXhlY0J5SW50ZXJ2YWw6IGZ1bmN0aW9uIChmbiwgdGltZSwgY29udGV4dCkge1xyXG5cdFx0dmFyIGxvY2ssIGV4ZWNPblVubG9jaztcclxuXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gd3JhcHBlckZuKCkge1xyXG5cdFx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuXHJcblx0XHRcdGlmIChsb2NrKSB7XHJcblx0XHRcdFx0ZXhlY09uVW5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxvY2sgPSB0cnVlO1xyXG5cclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bG9jayA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRpZiAoZXhlY09uVW5sb2NrKSB7XHJcblx0XHRcdFx0XHR3cmFwcGVyRm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcblx0XHRcdFx0XHRleGVjT25VbmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHRpbWUpO1xyXG5cclxuXHRcdFx0Zm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGZhbHNlRm46IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRmb3JtYXROdW06IGZ1bmN0aW9uIChudW0sIGRpZ2l0cykge1xyXG5cdFx0dmFyIHBvdyA9IE1hdGgucG93KDEwLCBkaWdpdHMgfHwgNSk7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChudW0gKiBwb3cpIC8gcG93O1xyXG5cdH0sXHJcblxyXG5cdHRyaW06IGZ1bmN0aW9uIChzdHIpIHtcclxuXHRcdHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xyXG5cdH0sXHJcblxyXG5cdHNwbGl0V29yZHM6IGZ1bmN0aW9uIChzdHIpIHtcclxuXHRcdHJldHVybiBMLlV0aWwudHJpbShzdHIpLnNwbGl0KC9cXHMrLyk7XHJcblx0fSxcclxuXHJcblx0c2V0T3B0aW9uczogZnVuY3Rpb24gKG9iaiwgb3B0aW9ucykge1xyXG5cdFx0b2JqLm9wdGlvbnMgPSBMLmV4dGVuZCh7fSwgb2JqLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cdFx0cmV0dXJuIG9iai5vcHRpb25zO1xyXG5cdH0sXHJcblxyXG5cdGdldFBhcmFtU3RyaW5nOiBmdW5jdGlvbiAob2JqLCBleGlzdGluZ1VybCwgdXBwZXJjYXNlKSB7XHJcblx0XHR2YXIgcGFyYW1zID0gW107XHJcblx0XHRmb3IgKHZhciBpIGluIG9iaikge1xyXG5cdFx0XHRwYXJhbXMucHVzaChlbmNvZGVVUklDb21wb25lbnQodXBwZXJjYXNlID8gaS50b1VwcGVyQ2FzZSgpIDogaSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2ldKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKCghZXhpc3RpbmdVcmwgfHwgZXhpc3RpbmdVcmwuaW5kZXhPZignPycpID09PSAtMSkgPyAnPycgOiAnJicpICsgcGFyYW1zLmpvaW4oJyYnKTtcclxuXHR9LFxyXG5cdHRlbXBsYXRlOiBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL1xceyAqKFtcXHdfXSspICpcXH0vZywgZnVuY3Rpb24gKHN0ciwga2V5KSB7XHJcblx0XHRcdHZhciB2YWx1ZSA9IGRhdGFba2V5XTtcclxuXHRcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbHVlIHByb3ZpZGVkIGZvciB2YXJpYWJsZSAnICsgc3RyKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlKGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0cmV0dXJuIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XHJcblx0fSxcclxuXHJcblx0ZW1wdHlJbWFnZVVybDogJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUQvQUN3QUFBQUFBUUFCQUFBQ0FEcz0nXHJcbn07XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuXHQvLyBpbnNwaXJlZCBieSBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRQcmVmaXhlZChuYW1lKSB7XHJcblx0XHR2YXIgaSwgZm4sXHJcblx0XHQgICAgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdtb3onLCAnbycsICdtcyddO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGggJiYgIWZuOyBpKyspIHtcclxuXHRcdFx0Zm4gPSB3aW5kb3dbcHJlZml4ZXNbaV0gKyBuYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZm47XHJcblx0fVxyXG5cclxuXHR2YXIgbGFzdFRpbWUgPSAwO1xyXG5cclxuXHRmdW5jdGlvbiB0aW1lb3V0RGVmZXIoZm4pIHtcclxuXHRcdHZhciB0aW1lID0gK25ldyBEYXRlKCksXHJcblx0XHQgICAgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKHRpbWUgLSBsYXN0VGltZSkpO1xyXG5cclxuXHRcdGxhc3RUaW1lID0gdGltZSArIHRpbWVUb0NhbGw7XHJcblx0XHRyZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZm4sIHRpbWVUb0NhbGwpO1xyXG5cdH1cclxuXHJcblx0dmFyIHJlcXVlc3RGbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHQgICAgICAgIGdldFByZWZpeGVkKCdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKSB8fCB0aW1lb3V0RGVmZXI7XHJcblxyXG5cdHZhciBjYW5jZWxGbiA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG5cdCAgICAgICAgZ2V0UHJlZml4ZWQoJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJykgfHxcclxuXHQgICAgICAgIGdldFByZWZpeGVkKCdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKSB8fFxyXG5cdCAgICAgICAgZnVuY3Rpb24gKGlkKSB7IHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpOyB9O1xyXG5cclxuXHJcblx0TC5VdGlsLnJlcXVlc3RBbmltRnJhbWUgPSBmdW5jdGlvbiAoZm4sIGNvbnRleHQsIGltbWVkaWF0ZSwgZWxlbWVudCkge1xyXG5cdFx0Zm4gPSBMLmJpbmQoZm4sIGNvbnRleHQpO1xyXG5cclxuXHRcdGlmIChpbW1lZGlhdGUgJiYgcmVxdWVzdEZuID09PSB0aW1lb3V0RGVmZXIpIHtcclxuXHRcdFx0Zm4oKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiByZXF1ZXN0Rm4uY2FsbCh3aW5kb3csIGZuLCBlbGVtZW50KTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lID0gZnVuY3Rpb24gKGlkKSB7XHJcblx0XHRpZiAoaWQpIHtcclxuXHRcdFx0Y2FuY2VsRm4uY2FsbCh3aW5kb3csIGlkKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxufSgpKTtcclxuXHJcbi8vIHNob3J0Y3V0cyBmb3IgbW9zdCB1c2VkIHV0aWxpdHkgZnVuY3Rpb25zXHJcbkwuZXh0ZW5kID0gTC5VdGlsLmV4dGVuZDtcclxuTC5iaW5kID0gTC5VdGlsLmJpbmQ7XHJcbkwuc3RhbXAgPSBMLlV0aWwuc3RhbXA7XHJcbkwuc2V0T3B0aW9ucyA9IEwuVXRpbC5zZXRPcHRpb25zO1xyXG5cblxuLypcclxuICogTC5DbGFzcyBwb3dlcnMgdGhlIE9PUCBmYWNpbGl0aWVzIG9mIHRoZSBsaWJyYXJ5LlxyXG4gKiBUaGFua3MgdG8gSm9obiBSZXNpZyBhbmQgRGVhbiBFZHdhcmRzIGZvciBpbnNwaXJhdGlvbiFcclxuICovXHJcblxyXG5MLkNsYXNzID0gZnVuY3Rpb24gKCkge307XHJcblxyXG5MLkNsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cclxuXHQvLyBleHRlbmRlZCBjbGFzcyB3aXRoIHRoZSBuZXcgcHJvdG90eXBlXHJcblx0dmFyIE5ld0NsYXNzID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIGNhbGwgdGhlIGNvbnN0cnVjdG9yXHJcblx0XHRpZiAodGhpcy5pbml0aWFsaXplKSB7XHJcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNhbGwgYWxsIGNvbnN0cnVjdG9yIGhvb2tzXHJcblx0XHRpZiAodGhpcy5faW5pdEhvb2tzKSB7XHJcblx0XHRcdHRoaXMuY2FsbEluaXRIb29rcygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIGluc3RhbnRpYXRlIGNsYXNzIHdpdGhvdXQgY2FsbGluZyBjb25zdHJ1Y3RvclxyXG5cdHZhciBGID0gZnVuY3Rpb24gKCkge307XHJcblx0Ri5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcclxuXHJcblx0dmFyIHByb3RvID0gbmV3IEYoKTtcclxuXHRwcm90by5jb25zdHJ1Y3RvciA9IE5ld0NsYXNzO1xyXG5cclxuXHROZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcclxuXHJcblx0Ly9pbmhlcml0IHBhcmVudCdzIHN0YXRpY3NcclxuXHRmb3IgKHZhciBpIGluIHRoaXMpIHtcclxuXHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KGkpICYmIGkgIT09ICdwcm90b3R5cGUnKSB7XHJcblx0XHRcdE5ld0NsYXNzW2ldID0gdGhpc1tpXTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIG1peCBzdGF0aWMgcHJvcGVydGllcyBpbnRvIHRoZSBjbGFzc1xyXG5cdGlmIChwcm9wcy5zdGF0aWNzKSB7XHJcblx0XHRMLmV4dGVuZChOZXdDbGFzcywgcHJvcHMuc3RhdGljcyk7XHJcblx0XHRkZWxldGUgcHJvcHMuc3RhdGljcztcclxuXHR9XHJcblxyXG5cdC8vIG1peCBpbmNsdWRlcyBpbnRvIHRoZSBwcm90b3R5cGVcclxuXHRpZiAocHJvcHMuaW5jbHVkZXMpIHtcclxuXHRcdEwuVXRpbC5leHRlbmQuYXBwbHkobnVsbCwgW3Byb3RvXS5jb25jYXQocHJvcHMuaW5jbHVkZXMpKTtcclxuXHRcdGRlbGV0ZSBwcm9wcy5pbmNsdWRlcztcclxuXHR9XHJcblxyXG5cdC8vIG1lcmdlIG9wdGlvbnNcclxuXHRpZiAocHJvcHMub3B0aW9ucyAmJiBwcm90by5vcHRpb25zKSB7XHJcblx0XHRwcm9wcy5vcHRpb25zID0gTC5leHRlbmQoe30sIHByb3RvLm9wdGlvbnMsIHByb3BzLm9wdGlvbnMpO1xyXG5cdH1cclxuXHJcblx0Ly8gbWl4IGdpdmVuIHByb3BlcnRpZXMgaW50byB0aGUgcHJvdG90eXBlXHJcblx0TC5leHRlbmQocHJvdG8sIHByb3BzKTtcclxuXHJcblx0cHJvdG8uX2luaXRIb29rcyA9IFtdO1xyXG5cclxuXHR2YXIgcGFyZW50ID0gdGhpcztcclxuXHQvLyBqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZVxyXG5cdE5ld0NsYXNzLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XHJcblxyXG5cdC8vIGFkZCBtZXRob2QgZm9yIGNhbGxpbmcgYWxsIGhvb2tzXHJcblx0cHJvdG8uY2FsbEluaXRIb29rcyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5faW5pdEhvb2tzQ2FsbGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmIChwYXJlbnQucHJvdG90eXBlLmNhbGxJbml0SG9va3MpIHtcclxuXHRcdFx0cGFyZW50LnByb3RvdHlwZS5jYWxsSW5pdEhvb2tzLmNhbGwodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faW5pdEhvb2tzQ2FsbGVkID0gdHJ1ZTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gcHJvdG8uX2luaXRIb29rcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRwcm90by5faW5pdEhvb2tzW2ldLmNhbGwodGhpcyk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0cmV0dXJuIE5ld0NsYXNzO1xyXG59O1xyXG5cclxuXHJcbi8vIG1ldGhvZCBmb3IgYWRkaW5nIHByb3BlcnRpZXMgdG8gcHJvdG90eXBlXHJcbkwuQ2xhc3MuaW5jbHVkZSA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cdEwuZXh0ZW5kKHRoaXMucHJvdG90eXBlLCBwcm9wcyk7XHJcbn07XHJcblxyXG4vLyBtZXJnZSBuZXcgZGVmYXVsdCBvcHRpb25zIHRvIHRoZSBDbGFzc1xyXG5MLkNsYXNzLm1lcmdlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0TC5leHRlbmQodGhpcy5wcm90b3R5cGUub3B0aW9ucywgb3B0aW9ucyk7XHJcbn07XHJcblxyXG4vLyBhZGQgYSBjb25zdHJ1Y3RvciBob29rXHJcbkwuQ2xhc3MuYWRkSW5pdEhvb2sgPSBmdW5jdGlvbiAoZm4pIHsgLy8gKEZ1bmN0aW9uKSB8fCAoU3RyaW5nLCBhcmdzLi4uKVxyXG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcblx0dmFyIGluaXQgPSB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgPyBmbiA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXNbZm5dLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMucHJvdG90eXBlLl9pbml0SG9va3MgPSB0aGlzLnByb3RvdHlwZS5faW5pdEhvb2tzIHx8IFtdO1xyXG5cdHRoaXMucHJvdG90eXBlLl9pbml0SG9va3MucHVzaChpbml0KTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuTWl4aW4uRXZlbnRzIGlzIHVzZWQgdG8gYWRkIGN1c3RvbSBldmVudHMgZnVuY3Rpb25hbGl0eSB0byBMZWFmbGV0IGNsYXNzZXMuXHJcbiAqL1xyXG5cclxudmFyIGV2ZW50c0tleSA9ICdfbGVhZmxldF9ldmVudHMnO1xyXG5cclxuTC5NaXhpbiA9IHt9O1xyXG5cclxuTC5NaXhpbi5FdmVudHMgPSB7XHJcblxyXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlcywgZm4sIGNvbnRleHQpIHsgLy8gKFN0cmluZywgRnVuY3Rpb25bLCBPYmplY3RdKSBvciAoT2JqZWN0WywgT2JqZWN0XSlcclxuXHJcblx0XHQvLyB0eXBlcyBjYW4gYmUgYSBtYXAgb2YgdHlwZXMvaGFuZGxlcnNcclxuXHRcdGlmIChMLlV0aWwuaW52b2tlRWFjaCh0eXBlcywgdGhpcy5hZGRFdmVudExpc3RlbmVyLCB0aGlzLCBmbiwgY29udGV4dCkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldID0gdGhpc1tldmVudHNLZXldIHx8IHt9LFxyXG5cdFx0ICAgIGNvbnRleHRJZCA9IGNvbnRleHQgJiYgY29udGV4dCAhPT0gdGhpcyAmJiBMLnN0YW1wKGNvbnRleHQpLFxyXG5cdFx0ICAgIGksIGxlbiwgZXZlbnQsIHR5cGUsIGluZGV4S2V5LCBpbmRleExlbktleSwgdHlwZUluZGV4O1xyXG5cclxuXHRcdC8vIHR5cGVzIGNhbiBiZSBhIHN0cmluZyBvZiBzcGFjZS1zZXBhcmF0ZWQgd29yZHNcclxuXHRcdHR5cGVzID0gTC5VdGlsLnNwbGl0V29yZHModHlwZXMpO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHR5cGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGV2ZW50ID0ge1xyXG5cdFx0XHRcdGFjdGlvbjogZm4sXHJcblx0XHRcdFx0Y29udGV4dDogY29udGV4dCB8fCB0aGlzXHJcblx0XHRcdH07XHJcblx0XHRcdHR5cGUgPSB0eXBlc1tpXTtcclxuXHJcblx0XHRcdGlmIChjb250ZXh0SWQpIHtcclxuXHRcdFx0XHQvLyBzdG9yZSBsaXN0ZW5lcnMgb2YgYSBwYXJ0aWN1bGFyIGNvbnRleHQgaW4gYSBzZXBhcmF0ZSBoYXNoIChpZiBpdCBoYXMgYW4gaWQpXHJcblx0XHRcdFx0Ly8gZ2l2ZXMgYSBtYWpvciBwZXJmb3JtYW5jZSBib29zdCB3aGVuIHJlbW92aW5nIHRob3VzYW5kcyBvZiBtYXAgbGF5ZXJzXHJcblxyXG5cdFx0XHRcdGluZGV4S2V5ID0gdHlwZSArICdfaWR4JztcclxuXHRcdFx0XHRpbmRleExlbktleSA9IGluZGV4S2V5ICsgJ19sZW4nO1xyXG5cclxuXHRcdFx0XHR0eXBlSW5kZXggPSBldmVudHNbaW5kZXhLZXldID0gZXZlbnRzW2luZGV4S2V5XSB8fCB7fTtcclxuXHJcblx0XHRcdFx0aWYgKCF0eXBlSW5kZXhbY29udGV4dElkXSkge1xyXG5cdFx0XHRcdFx0dHlwZUluZGV4W2NvbnRleHRJZF0gPSBbXTtcclxuXHJcblx0XHRcdFx0XHQvLyBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGUgaW5kZXggdG8gcXVpY2tseSBjaGVjayBpZiBpdCdzIGVtcHR5XHJcblx0XHRcdFx0XHRldmVudHNbaW5kZXhMZW5LZXldID0gKGV2ZW50c1tpbmRleExlbktleV0gfHwgMCkgKyAxO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dHlwZUluZGV4W2NvbnRleHRJZF0ucHVzaChldmVudCk7XHJcblxyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRldmVudHNbdHlwZV0gPSBldmVudHNbdHlwZV0gfHwgW107XHJcblx0XHRcdFx0ZXZlbnRzW3R5cGVdLnB1c2goZXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0aGFzRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICh0eXBlKSB7IC8vIChTdHJpbmcpIC0+IEJvb2xlYW5cclxuXHRcdHZhciBldmVudHMgPSB0aGlzW2V2ZW50c0tleV07XHJcblx0XHRyZXR1cm4gISFldmVudHMgJiYgKCh0eXBlIGluIGV2ZW50cyAmJiBldmVudHNbdHlwZV0ubGVuZ3RoID4gMCkgfHxcclxuXHRcdCAgICAgICAgICAgICAgICAgICAgKHR5cGUgKyAnX2lkeCcgaW4gZXZlbnRzICYmIGV2ZW50c1t0eXBlICsgJ19pZHhfbGVuJ10gPiAwKSk7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKHR5cGVzLCBmbiwgY29udGV4dCkgeyAvLyAoW1N0cmluZywgRnVuY3Rpb24sIE9iamVjdF0pIG9yIChPYmplY3RbLCBPYmplY3RdKVxyXG5cclxuXHRcdGlmICghdGhpc1tldmVudHNLZXldKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdHlwZXMpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xlYXJBbGxFdmVudExpc3RlbmVycygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChMLlV0aWwuaW52b2tlRWFjaCh0eXBlcywgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyLCB0aGlzLCBmbiwgY29udGV4dCkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldLFxyXG5cdFx0ICAgIGNvbnRleHRJZCA9IGNvbnRleHQgJiYgY29udGV4dCAhPT0gdGhpcyAmJiBMLnN0YW1wKGNvbnRleHQpLFxyXG5cdFx0ICAgIGksIGxlbiwgdHlwZSwgbGlzdGVuZXJzLCBqLCBpbmRleEtleSwgaW5kZXhMZW5LZXksIHR5cGVJbmRleCwgcmVtb3ZlZDtcclxuXHJcblx0XHR0eXBlcyA9IEwuVXRpbC5zcGxpdFdvcmRzKHR5cGVzKTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0eXBlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR0eXBlID0gdHlwZXNbaV07XHJcblx0XHRcdGluZGV4S2V5ID0gdHlwZSArICdfaWR4JztcclxuXHRcdFx0aW5kZXhMZW5LZXkgPSBpbmRleEtleSArICdfbGVuJztcclxuXHJcblx0XHRcdHR5cGVJbmRleCA9IGV2ZW50c1tpbmRleEtleV07XHJcblxyXG5cdFx0XHRpZiAoIWZuKSB7XHJcblx0XHRcdFx0Ly8gY2xlYXIgYWxsIGxpc3RlbmVycyBmb3IgYSB0eXBlIGlmIGZ1bmN0aW9uIGlzbid0IHNwZWNpZmllZFxyXG5cdFx0XHRcdGRlbGV0ZSBldmVudHNbdHlwZV07XHJcblx0XHRcdFx0ZGVsZXRlIGV2ZW50c1tpbmRleEtleV07XHJcblx0XHRcdFx0ZGVsZXRlIGV2ZW50c1tpbmRleExlbktleV07XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxpc3RlbmVycyA9IGNvbnRleHRJZCAmJiB0eXBlSW5kZXggPyB0eXBlSW5kZXhbY29udGV4dElkXSA6IGV2ZW50c1t0eXBlXTtcclxuXHJcblx0XHRcdFx0aWYgKGxpc3RlbmVycykge1xyXG5cdFx0XHRcdFx0Zm9yIChqID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcblx0XHRcdFx0XHRcdGlmICgobGlzdGVuZXJzW2pdLmFjdGlvbiA9PT0gZm4pICYmICghY29udGV4dCB8fCAobGlzdGVuZXJzW2pdLmNvbnRleHQgPT09IGNvbnRleHQpKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlbW92ZWQgPSBsaXN0ZW5lcnMuc3BsaWNlKGosIDEpO1xyXG5cdFx0XHRcdFx0XHRcdC8vIHNldCB0aGUgb2xkIGFjdGlvbiB0byBhIG5vLW9wLCBiZWNhdXNlIGl0IGlzIHBvc3NpYmxlXHJcblx0XHRcdFx0XHRcdFx0Ly8gdGhhdCB0aGUgbGlzdGVuZXIgaXMgYmVpbmcgaXRlcmF0ZWQgb3ZlciBhcyBwYXJ0IG9mIGEgZGlzcGF0Y2hcclxuXHRcdFx0XHRcdFx0XHRyZW1vdmVkWzBdLmFjdGlvbiA9IEwuVXRpbC5mYWxzZUZuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKGNvbnRleHQgJiYgdHlwZUluZGV4ICYmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSkge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdHlwZUluZGV4W2NvbnRleHRJZF07XHJcblx0XHRcdFx0XHRcdGV2ZW50c1tpbmRleExlbktleV0tLTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRjbGVhckFsbEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRkZWxldGUgdGhpc1tldmVudHNLZXldO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0ZmlyZUV2ZW50OiBmdW5jdGlvbiAodHlwZSwgZGF0YSkgeyAvLyAoU3RyaW5nWywgT2JqZWN0XSlcclxuXHRcdGlmICghdGhpcy5oYXNFdmVudExpc3RlbmVycyh0eXBlKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZXZlbnQgPSBMLlV0aWwuZXh0ZW5kKHt9LCBkYXRhLCB7IHR5cGU6IHR5cGUsIHRhcmdldDogdGhpcyB9KTtcclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldLFxyXG5cdFx0ICAgIGxpc3RlbmVycywgaSwgbGVuLCB0eXBlSW5kZXgsIGNvbnRleHRJZDtcclxuXHJcblx0XHRpZiAoZXZlbnRzW3R5cGVdKSB7XHJcblx0XHRcdC8vIG1ha2Ugc3VyZSBhZGRpbmcvcmVtb3ZpbmcgbGlzdGVuZXJzIGluc2lkZSBvdGhlciBsaXN0ZW5lcnMgd29uJ3QgY2F1c2UgaW5maW5pdGUgbG9vcFxyXG5cdFx0XHRsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV0uc2xpY2UoKTtcclxuXHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGxpc3RlbmVyc1tpXS5hY3Rpb24uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgZXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZmlyZSBldmVudCBmb3IgdGhlIGNvbnRleHQtaW5kZXhlZCBsaXN0ZW5lcnMgYXMgd2VsbFxyXG5cdFx0dHlwZUluZGV4ID0gZXZlbnRzW3R5cGUgKyAnX2lkeCddO1xyXG5cclxuXHRcdGZvciAoY29udGV4dElkIGluIHR5cGVJbmRleCkge1xyXG5cdFx0XHRsaXN0ZW5lcnMgPSB0eXBlSW5kZXhbY29udGV4dElkXS5zbGljZSgpO1xyXG5cclxuXHRcdFx0aWYgKGxpc3RlbmVycykge1xyXG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0bGlzdGVuZXJzW2ldLmFjdGlvbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBldmVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkT25lVGltZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlcywgZm4sIGNvbnRleHQpIHtcclxuXHJcblx0XHRpZiAoTC5VdGlsLmludm9rZUVhY2godHlwZXMsIHRoaXMuYWRkT25lVGltZUV2ZW50TGlzdGVuZXIsIHRoaXMsIGZuLCBjb250ZXh0KSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBoYW5kbGVyID0gTC5iaW5kKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZXMsIGZuLCBjb250ZXh0KVxyXG5cdFx0XHQgICAgLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZXMsIGhhbmRsZXIsIGNvbnRleHQpO1xyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXNcclxuXHRcdCAgICAuYWRkRXZlbnRMaXN0ZW5lcih0eXBlcywgZm4sIGNvbnRleHQpXHJcblx0XHQgICAgLmFkZEV2ZW50TGlzdGVuZXIodHlwZXMsIGhhbmRsZXIsIGNvbnRleHQpO1xyXG5cdH1cclxufTtcclxuXHJcbkwuTWl4aW4uRXZlbnRzLm9uID0gTC5NaXhpbi5FdmVudHMuYWRkRXZlbnRMaXN0ZW5lcjtcclxuTC5NaXhpbi5FdmVudHMub2ZmID0gTC5NaXhpbi5FdmVudHMucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuTC5NaXhpbi5FdmVudHMub25jZSA9IEwuTWl4aW4uRXZlbnRzLmFkZE9uZVRpbWVFdmVudExpc3RlbmVyO1xyXG5MLk1peGluLkV2ZW50cy5maXJlID0gTC5NaXhpbi5FdmVudHMuZmlyZUV2ZW50O1xyXG5cblxuLypcclxuICogTC5Ccm93c2VyIGhhbmRsZXMgZGlmZmVyZW50IGJyb3dzZXIgYW5kIGZlYXR1cmUgZGV0ZWN0aW9ucyBmb3IgaW50ZXJuYWwgTGVhZmxldCB1c2UuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHJcblx0dmFyIGllID0gJ0FjdGl2ZVhPYmplY3QnIGluIHdpbmRvdyxcclxuXHRcdGllbHQ5ID0gaWUgJiYgIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIsXHJcblxyXG5cdCAgICAvLyB0ZXJyaWJsZSBicm93c2VyIGRldGVjdGlvbiB0byB3b3JrIGFyb3VuZCBTYWZhcmkgLyBpT1MgLyBBbmRyb2lkIGJyb3dzZXIgYnVnc1xyXG5cdCAgICB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxcclxuXHQgICAgd2Via2l0ID0gdWEuaW5kZXhPZignd2Via2l0JykgIT09IC0xLFxyXG5cdCAgICBjaHJvbWUgPSB1YS5pbmRleE9mKCdjaHJvbWUnKSAhPT0gLTEsXHJcblx0ICAgIHBoYW50b21qcyA9IHVhLmluZGV4T2YoJ3BoYW50b20nKSAhPT0gLTEsXHJcblx0ICAgIGFuZHJvaWQgPSB1YS5pbmRleE9mKCdhbmRyb2lkJykgIT09IC0xLFxyXG5cdCAgICBhbmRyb2lkMjMgPSB1YS5zZWFyY2goJ2FuZHJvaWQgWzIzXScpICE9PSAtMSxcclxuXHRcdGdlY2tvID0gdWEuaW5kZXhPZignZ2Vja28nKSAhPT0gLTEsXHJcblxyXG5cdCAgICBtb2JpbGUgPSB0eXBlb2Ygb3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCArICcnLFxyXG5cdCAgICBtc1BvaW50ZXIgPSB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCAmJlxyXG5cdCAgICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzICYmICF3aW5kb3cuUG9pbnRlckV2ZW50LFxyXG5cdFx0cG9pbnRlciA9ICh3aW5kb3cuUG9pbnRlckV2ZW50ICYmIHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgJiYgd2luZG93Lm5hdmlnYXRvci5tYXhUb3VjaFBvaW50cykgfHxcclxuXHRcdFx0XHQgIG1zUG9pbnRlcixcclxuXHQgICAgcmV0aW5hID0gKCdkZXZpY2VQaXhlbFJhdGlvJyBpbiB3aW5kb3cgJiYgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPiAxKSB8fFxyXG5cdCAgICAgICAgICAgICAoJ21hdGNoTWVkaWEnIGluIHdpbmRvdyAmJiB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi1yZXNvbHV0aW9uOjE0NGRwaSknKSAmJlxyXG5cdCAgICAgICAgICAgICAgd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4tcmVzb2x1dGlvbjoxNDRkcGkpJykubWF0Y2hlcyksXHJcblxyXG5cdCAgICBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcblx0ICAgIGllM2QgPSBpZSAmJiAoJ3RyYW5zaXRpb24nIGluIGRvYy5zdHlsZSksXHJcblx0ICAgIHdlYmtpdDNkID0gKCdXZWJLaXRDU1NNYXRyaXgnIGluIHdpbmRvdykgJiYgKCdtMTEnIGluIG5ldyB3aW5kb3cuV2ViS2l0Q1NTTWF0cml4KCkpICYmICFhbmRyb2lkMjMsXHJcblx0ICAgIGdlY2tvM2QgPSAnTW96UGVyc3BlY3RpdmUnIGluIGRvYy5zdHlsZSxcclxuXHQgICAgb3BlcmEzZCA9ICdPVHJhbnNpdGlvbicgaW4gZG9jLnN0eWxlLFxyXG5cdCAgICBhbnkzZCA9ICF3aW5kb3cuTF9ESVNBQkxFXzNEICYmIChpZTNkIHx8IHdlYmtpdDNkIHx8IGdlY2tvM2QgfHwgb3BlcmEzZCkgJiYgIXBoYW50b21qcztcclxuXHJcblxyXG5cdC8vIFBoYW50b21KUyBoYXMgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBidXQgZG9lc24ndCBhY3R1YWxseSBzdXBwb3J0IHRvdWNoLlxyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvcHVsbC8xNDM0I2lzc3VlY29tbWVudC0xMzg0MzE1MVxyXG5cclxuXHR2YXIgdG91Y2ggPSAhd2luZG93LkxfTk9fVE9VQ0ggJiYgIXBoYW50b21qcyAmJiAoZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBzdGFydE5hbWUgPSAnb250b3VjaHN0YXJ0JztcclxuXHJcblx0XHQvLyBJRTEwKyAoV2Ugc2ltdWxhdGUgdGhlc2UgaW50byB0b3VjaCogZXZlbnRzIGluIEwuRG9tRXZlbnQgYW5kIEwuRG9tRXZlbnQuUG9pbnRlcikgb3IgV2ViS2l0LCBldGMuXHJcblx0XHRpZiAocG9pbnRlciB8fCAoc3RhcnROYW1lIGluIGRvYykpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZWZveC9HZWNrb1xyXG5cdFx0dmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0ICAgIHN1cHBvcnRlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICghZGl2LnNldEF0dHJpYnV0ZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkaXYuc2V0QXR0cmlidXRlKHN0YXJ0TmFtZSwgJ3JldHVybjsnKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIGRpdltzdGFydE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHN1cHBvcnRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGl2LnJlbW92ZUF0dHJpYnV0ZShzdGFydE5hbWUpO1xyXG5cdFx0ZGl2ID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gc3VwcG9ydGVkO1xyXG5cdH0oKSk7XHJcblxyXG5cclxuXHRMLkJyb3dzZXIgPSB7XHJcblx0XHRpZTogaWUsXHJcblx0XHRpZWx0OTogaWVsdDksXHJcblx0XHR3ZWJraXQ6IHdlYmtpdCxcclxuXHRcdGdlY2tvOiBnZWNrbyAmJiAhd2Via2l0ICYmICF3aW5kb3cub3BlcmEgJiYgIWllLFxyXG5cclxuXHRcdGFuZHJvaWQ6IGFuZHJvaWQsXHJcblx0XHRhbmRyb2lkMjM6IGFuZHJvaWQyMyxcclxuXHJcblx0XHRjaHJvbWU6IGNocm9tZSxcclxuXHJcblx0XHRpZTNkOiBpZTNkLFxyXG5cdFx0d2Via2l0M2Q6IHdlYmtpdDNkLFxyXG5cdFx0Z2Vja28zZDogZ2Vja28zZCxcclxuXHRcdG9wZXJhM2Q6IG9wZXJhM2QsXHJcblx0XHRhbnkzZDogYW55M2QsXHJcblxyXG5cdFx0bW9iaWxlOiBtb2JpbGUsXHJcblx0XHRtb2JpbGVXZWJraXQ6IG1vYmlsZSAmJiB3ZWJraXQsXHJcblx0XHRtb2JpbGVXZWJraXQzZDogbW9iaWxlICYmIHdlYmtpdDNkLFxyXG5cdFx0bW9iaWxlT3BlcmE6IG1vYmlsZSAmJiB3aW5kb3cub3BlcmEsXHJcblxyXG5cdFx0dG91Y2g6IHRvdWNoLFxyXG5cdFx0bXNQb2ludGVyOiBtc1BvaW50ZXIsXHJcblx0XHRwb2ludGVyOiBwb2ludGVyLFxyXG5cclxuXHRcdHJldGluYTogcmV0aW5hXHJcblx0fTtcclxuXHJcbn0oKSk7XHJcblxuXG4vKlxyXG4gKiBMLlBvaW50IHJlcHJlc2VudHMgYSBwb2ludCB3aXRoIHggYW5kIHkgY29vcmRpbmF0ZXMuXHJcbiAqL1xyXG5cclxuTC5Qb2ludCA9IGZ1bmN0aW9uICgvKk51bWJlciovIHgsIC8qTnVtYmVyKi8geSwgLypCb29sZWFuKi8gcm91bmQpIHtcclxuXHR0aGlzLnggPSAocm91bmQgPyBNYXRoLnJvdW5kKHgpIDogeCk7XHJcblx0dGhpcy55ID0gKHJvdW5kID8gTWF0aC5yb3VuZCh5KSA6IHkpO1xyXG59O1xyXG5cclxuTC5Qb2ludC5wcm90b3R5cGUgPSB7XHJcblxyXG5cdGNsb25lOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQodGhpcy54LCB0aGlzLnkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIG5vbi1kZXN0cnVjdGl2ZSwgcmV0dXJucyBhIG5ldyBwb2ludFxyXG5cdGFkZDogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9hZGQoTC5wb2ludChwb2ludCkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIGRlc3RydWN0aXZlLCB1c2VkIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZSBpbiBzaXR1YXRpb25zIHdoZXJlIGl0J3Mgc2FmZSB0byBtb2RpZnkgZXhpc3RpbmcgcG9pbnRcclxuXHRfYWRkOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHRoaXMueCArPSBwb2ludC54O1xyXG5cdFx0dGhpcy55ICs9IHBvaW50Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzdWJ0cmFjdDogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWJ0cmFjdChMLnBvaW50KHBvaW50KSk7XHJcblx0fSxcclxuXHJcblx0X3N1YnRyYWN0OiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHRoaXMueCAtPSBwb2ludC54O1xyXG5cdFx0dGhpcy55IC09IHBvaW50Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRkaXZpZGVCeTogZnVuY3Rpb24gKG51bSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2aWRlQnkobnVtKTtcclxuXHR9LFxyXG5cclxuXHRfZGl2aWRlQnk6IGZ1bmN0aW9uIChudW0pIHtcclxuXHRcdHRoaXMueCAvPSBudW07XHJcblx0XHR0aGlzLnkgLz0gbnVtO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0bXVsdGlwbHlCeTogZnVuY3Rpb24gKG51bSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoKS5fbXVsdGlwbHlCeShudW0pO1xyXG5cdH0sXHJcblxyXG5cdF9tdWx0aXBseUJ5OiBmdW5jdGlvbiAobnVtKSB7XHJcblx0XHR0aGlzLnggKj0gbnVtO1xyXG5cdFx0dGhpcy55ICo9IG51bTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJvdW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3VuZCgpO1xyXG5cdH0sXHJcblxyXG5cdF9yb3VuZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xyXG5cdFx0dGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Zmxvb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNsb25lKCkuX2Zsb29yKCk7XHJcblx0fSxcclxuXHJcblx0X2Zsb29yOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMueCk7XHJcblx0XHR0aGlzLnkgPSBNYXRoLmZsb29yKHRoaXMueSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRkaXN0YW5jZVRvOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHBvaW50ID0gTC5wb2ludChwb2ludCk7XHJcblxyXG5cdFx0dmFyIHggPSBwb2ludC54IC0gdGhpcy54LFxyXG5cdFx0ICAgIHkgPSBwb2ludC55IC0gdGhpcy55O1xyXG5cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XHJcblx0fSxcclxuXHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHBvaW50ID0gTC5wb2ludChwb2ludCk7XHJcblxyXG5cdFx0cmV0dXJuIHBvaW50LnggPT09IHRoaXMueCAmJlxyXG5cdFx0ICAgICAgIHBvaW50LnkgPT09IHRoaXMueTtcclxuXHR9LFxyXG5cclxuXHRjb250YWluczogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRwb2ludCA9IEwucG9pbnQocG9pbnQpO1xyXG5cclxuXHRcdHJldHVybiBNYXRoLmFicyhwb2ludC54KSA8PSBNYXRoLmFicyh0aGlzLngpICYmXHJcblx0XHQgICAgICAgTWF0aC5hYnMocG9pbnQueSkgPD0gTWF0aC5hYnModGhpcy55KTtcclxuXHR9LFxyXG5cclxuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICdQb2ludCgnICtcclxuXHRcdCAgICAgICAgTC5VdGlsLmZvcm1hdE51bSh0aGlzLngpICsgJywgJyArXHJcblx0XHQgICAgICAgIEwuVXRpbC5mb3JtYXROdW0odGhpcy55KSArICcpJztcclxuXHR9XHJcbn07XHJcblxyXG5MLnBvaW50ID0gZnVuY3Rpb24gKHgsIHksIHJvdW5kKSB7XHJcblx0aWYgKHggaW5zdGFuY2VvZiBMLlBvaW50KSB7XHJcblx0XHRyZXR1cm4geDtcclxuXHR9XHJcblx0aWYgKEwuVXRpbC5pc0FycmF5KHgpKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoeFswXSwgeFsxXSk7XHJcblx0fVxyXG5cdGlmICh4ID09PSB1bmRlZmluZWQgfHwgeCA9PT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIHg7XHJcblx0fVxyXG5cdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5LCByb3VuZCk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkJvdW5kcyByZXByZXNlbnRzIGEgcmVjdGFuZ3VsYXIgYXJlYSBvbiB0aGUgc2NyZWVuIGluIHBpeGVsIGNvb3JkaW5hdGVzLlxyXG4gKi9cclxuXHJcbkwuQm91bmRzID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8oUG9pbnQsIFBvaW50KSBvciBQb2ludFtdXHJcblx0aWYgKCFhKSB7IHJldHVybjsgfVxyXG5cclxuXHR2YXIgcG9pbnRzID0gYiA/IFthLCBiXSA6IGE7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdHRoaXMuZXh0ZW5kKHBvaW50c1tpXSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5Cb3VuZHMucHJvdG90eXBlID0ge1xyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIHRvIGNvbnRhaW4gdGhlIGdpdmVuIHBvaW50XHJcblx0ZXh0ZW5kOiBmdW5jdGlvbiAocG9pbnQpIHsgLy8gKFBvaW50KVxyXG5cdFx0cG9pbnQgPSBMLnBvaW50KHBvaW50KTtcclxuXHJcblx0XHRpZiAoIXRoaXMubWluICYmICF0aGlzLm1heCkge1xyXG5cdFx0XHR0aGlzLm1pbiA9IHBvaW50LmNsb25lKCk7XHJcblx0XHRcdHRoaXMubWF4ID0gcG9pbnQuY2xvbmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubWluLnggPSBNYXRoLm1pbihwb2ludC54LCB0aGlzLm1pbi54KTtcclxuXHRcdFx0dGhpcy5tYXgueCA9IE1hdGgubWF4KHBvaW50LngsIHRoaXMubWF4LngpO1xyXG5cdFx0XHR0aGlzLm1pbi55ID0gTWF0aC5taW4ocG9pbnQueSwgdGhpcy5taW4ueSk7XHJcblx0XHRcdHRoaXMubWF4LnkgPSBNYXRoLm1heChwb2ludC55LCB0aGlzLm1heC55KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENlbnRlcjogZnVuY3Rpb24gKHJvdW5kKSB7IC8vIChCb29sZWFuKSAtPiBQb2ludFxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KFxyXG5cdFx0ICAgICAgICAodGhpcy5taW4ueCArIHRoaXMubWF4LngpIC8gMixcclxuXHRcdCAgICAgICAgKHRoaXMubWluLnkgKyB0aGlzLm1heC55KSAvIDIsIHJvdW5kKTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3R0b21MZWZ0OiBmdW5jdGlvbiAoKSB7IC8vIC0+IFBvaW50XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQodGhpcy5taW4ueCwgdGhpcy5tYXgueSk7XHJcblx0fSxcclxuXHJcblx0Z2V0VG9wUmlnaHQ6IGZ1bmN0aW9uICgpIHsgLy8gLT4gUG9pbnRcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh0aGlzLm1heC54LCB0aGlzLm1pbi55KTtcclxuXHR9LFxyXG5cclxuXHRnZXRTaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXguc3VidHJhY3QodGhpcy5taW4pO1xyXG5cdH0sXHJcblxyXG5cdGNvbnRhaW5zOiBmdW5jdGlvbiAob2JqKSB7IC8vIChCb3VuZHMpIG9yIChQb2ludCkgLT4gQm9vbGVhblxyXG5cdFx0dmFyIG1pbiwgbWF4O1xyXG5cclxuXHRcdGlmICh0eXBlb2Ygb2JqWzBdID09PSAnbnVtYmVyJyB8fCBvYmogaW5zdGFuY2VvZiBMLlBvaW50KSB7XHJcblx0XHRcdG9iaiA9IEwucG9pbnQob2JqKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9iaiA9IEwuYm91bmRzKG9iaik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIEwuQm91bmRzKSB7XHJcblx0XHRcdG1pbiA9IG9iai5taW47XHJcblx0XHRcdG1heCA9IG9iai5tYXg7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtaW4gPSBtYXggPSBvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIChtaW4ueCA+PSB0aGlzLm1pbi54KSAmJlxyXG5cdFx0ICAgICAgIChtYXgueCA8PSB0aGlzLm1heC54KSAmJlxyXG5cdFx0ICAgICAgIChtaW4ueSA+PSB0aGlzLm1pbi55KSAmJlxyXG5cdFx0ICAgICAgIChtYXgueSA8PSB0aGlzLm1heC55KTtcclxuXHR9LFxyXG5cclxuXHRpbnRlcnNlY3RzOiBmdW5jdGlvbiAoYm91bmRzKSB7IC8vIChCb3VuZHMpIC0+IEJvb2xlYW5cclxuXHRcdGJvdW5kcyA9IEwuYm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dmFyIG1pbiA9IHRoaXMubWluLFxyXG5cdFx0ICAgIG1heCA9IHRoaXMubWF4LFxyXG5cdFx0ICAgIG1pbjIgPSBib3VuZHMubWluLFxyXG5cdFx0ICAgIG1heDIgPSBib3VuZHMubWF4LFxyXG5cdFx0ICAgIHhJbnRlcnNlY3RzID0gKG1heDIueCA+PSBtaW4ueCkgJiYgKG1pbjIueCA8PSBtYXgueCksXHJcblx0XHQgICAgeUludGVyc2VjdHMgPSAobWF4Mi55ID49IG1pbi55KSAmJiAobWluMi55IDw9IG1heC55KTtcclxuXHJcblx0XHRyZXR1cm4geEludGVyc2VjdHMgJiYgeUludGVyc2VjdHM7XHJcblx0fSxcclxuXHJcblx0aXNWYWxpZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMubWluICYmIHRoaXMubWF4KTtcclxuXHR9XHJcbn07XHJcblxyXG5MLmJvdW5kcyA9IGZ1bmN0aW9uIChhLCBiKSB7IC8vIChCb3VuZHMpIG9yIChQb2ludCwgUG9pbnQpIG9yIChQb2ludFtdKVxyXG5cdGlmICghYSB8fCBhIGluc3RhbmNlb2YgTC5Cb3VuZHMpIHtcclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHRyZXR1cm4gbmV3IEwuQm91bmRzKGEsIGIpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5UcmFuc2Zvcm1hdGlvbiBpcyBhbiB1dGlsaXR5IGNsYXNzIHRvIHBlcmZvcm0gc2ltcGxlIHBvaW50IHRyYW5zZm9ybWF0aW9ucyB0aHJvdWdoIGEgMmQtbWF0cml4LlxyXG4gKi9cclxuXHJcbkwuVHJhbnNmb3JtYXRpb24gPSBmdW5jdGlvbiAoYSwgYiwgYywgZCkge1xyXG5cdHRoaXMuX2EgPSBhO1xyXG5cdHRoaXMuX2IgPSBiO1xyXG5cdHRoaXMuX2MgPSBjO1xyXG5cdHRoaXMuX2QgPSBkO1xyXG59O1xyXG5cclxuTC5UcmFuc2Zvcm1hdGlvbi5wcm90b3R5cGUgPSB7XHJcblx0dHJhbnNmb3JtOiBmdW5jdGlvbiAocG9pbnQsIHNjYWxlKSB7IC8vIChQb2ludCwgTnVtYmVyKSAtPiBQb2ludFxyXG5cdFx0cmV0dXJuIHRoaXMuX3RyYW5zZm9ybShwb2ludC5jbG9uZSgpLCBzY2FsZSk7XHJcblx0fSxcclxuXHJcblx0Ly8gZGVzdHJ1Y3RpdmUgdHJhbnNmb3JtIChmYXN0ZXIpXHJcblx0X3RyYW5zZm9ybTogZnVuY3Rpb24gKHBvaW50LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxO1xyXG5cdFx0cG9pbnQueCA9IHNjYWxlICogKHRoaXMuX2EgKiBwb2ludC54ICsgdGhpcy5fYik7XHJcblx0XHRwb2ludC55ID0gc2NhbGUgKiAodGhpcy5fYyAqIHBvaW50LnkgKyB0aGlzLl9kKTtcclxuXHRcdHJldHVybiBwb2ludDtcclxuXHR9LFxyXG5cclxuXHR1bnRyYW5zZm9ybTogZnVuY3Rpb24gKHBvaW50LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxO1xyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KFxyXG5cdFx0ICAgICAgICAocG9pbnQueCAvIHNjYWxlIC0gdGhpcy5fYikgLyB0aGlzLl9hLFxyXG5cdFx0ICAgICAgICAocG9pbnQueSAvIHNjYWxlIC0gdGhpcy5fZCkgLyB0aGlzLl9jKTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkRvbVV0aWwgY29udGFpbnMgdmFyaW91cyB1dGlsaXR5IGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoIERPTS5cclxuICovXHJcblxyXG5MLkRvbVV0aWwgPSB7XHJcblx0Z2V0OiBmdW5jdGlvbiAoaWQpIHtcclxuXHRcdHJldHVybiAodHlwZW9mIGlkID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSA6IGlkKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTdHlsZTogZnVuY3Rpb24gKGVsLCBzdHlsZSkge1xyXG5cclxuXHRcdHZhciB2YWx1ZSA9IGVsLnN0eWxlW3N0eWxlXTtcclxuXHJcblx0XHRpZiAoIXZhbHVlICYmIGVsLmN1cnJlbnRTdHlsZSkge1xyXG5cdFx0XHR2YWx1ZSA9IGVsLmN1cnJlbnRTdHlsZVtzdHlsZV07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCghdmFsdWUgfHwgdmFsdWUgPT09ICdhdXRvJykgJiYgZG9jdW1lbnQuZGVmYXVsdFZpZXcpIHtcclxuXHRcdFx0dmFyIGNzcyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xyXG5cdFx0XHR2YWx1ZSA9IGNzcyA/IGNzc1tzdHlsZV0gOiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nID8gbnVsbCA6IHZhbHVlO1xyXG5cdH0sXHJcblxyXG5cdGdldFZpZXdwb3J0T2Zmc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG5cclxuXHRcdHZhciB0b3AgPSAwLFxyXG5cdFx0ICAgIGxlZnQgPSAwLFxyXG5cdFx0ICAgIGVsID0gZWxlbWVudCxcclxuXHRcdCAgICBkb2NCb2R5ID0gZG9jdW1lbnQuYm9keSxcclxuXHRcdCAgICBkb2NFbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuXHRcdCAgICBwb3M7XHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHR0b3AgICs9IGVsLm9mZnNldFRvcCAgfHwgMDtcclxuXHRcdFx0bGVmdCArPSBlbC5vZmZzZXRMZWZ0IHx8IDA7XHJcblxyXG5cdFx0XHQvL2FkZCBib3JkZXJzXHJcblx0XHRcdHRvcCArPSBwYXJzZUludChMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdib3JkZXJUb3BXaWR0aCcpLCAxMCkgfHwgMDtcclxuXHRcdFx0bGVmdCArPSBwYXJzZUludChMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdib3JkZXJMZWZ0V2lkdGgnKSwgMTApIHx8IDA7XHJcblxyXG5cdFx0XHRwb3MgPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdwb3NpdGlvbicpO1xyXG5cclxuXHRcdFx0aWYgKGVsLm9mZnNldFBhcmVudCA9PT0gZG9jQm9keSAmJiBwb3MgPT09ICdhYnNvbHV0ZScpIHsgYnJlYWs7IH1cclxuXHJcblx0XHRcdGlmIChwb3MgPT09ICdmaXhlZCcpIHtcclxuXHRcdFx0XHR0b3AgICs9IGRvY0JvZHkuc2Nyb2xsVG9wICB8fCBkb2NFbC5zY3JvbGxUb3AgIHx8IDA7XHJcblx0XHRcdFx0bGVmdCArPSBkb2NCb2R5LnNjcm9sbExlZnQgfHwgZG9jRWwuc2Nyb2xsTGVmdCB8fCAwO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAocG9zID09PSAncmVsYXRpdmUnICYmICFlbC5vZmZzZXRMZWZ0KSB7XHJcblx0XHRcdFx0dmFyIHdpZHRoID0gTC5Eb21VdGlsLmdldFN0eWxlKGVsLCAnd2lkdGgnKSxcclxuXHRcdFx0XHQgICAgbWF4V2lkdGggPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdtYXgtd2lkdGgnKSxcclxuXHRcdFx0XHQgICAgciA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggIT09ICdub25lJyB8fCBtYXhXaWR0aCAhPT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0XHRsZWZ0ICs9IHIubGVmdCArIGVsLmNsaWVudExlZnQ7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvL2NhbGN1bGF0ZSBmdWxsIHkgb2Zmc2V0IHNpbmNlIHdlJ3JlIGJyZWFraW5nIG91dCBvZiB0aGUgbG9vcFxyXG5cdFx0XHRcdHRvcCArPSByLnRvcCArIChkb2NCb2R5LnNjcm9sbFRvcCAgfHwgZG9jRWwuc2Nyb2xsVG9wICB8fCAwKTtcclxuXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGVsID0gZWwub2Zmc2V0UGFyZW50O1xyXG5cclxuXHRcdH0gd2hpbGUgKGVsKTtcclxuXHJcblx0XHRlbCA9IGVsZW1lbnQ7XHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHRpZiAoZWwgPT09IGRvY0JvZHkpIHsgYnJlYWs7IH1cclxuXHJcblx0XHRcdHRvcCAgLT0gZWwuc2Nyb2xsVG9wICB8fCAwO1xyXG5cdFx0XHRsZWZ0IC09IGVsLnNjcm9sbExlZnQgfHwgMDtcclxuXHJcblx0XHRcdGVsID0gZWwucGFyZW50Tm9kZTtcclxuXHRcdH0gd2hpbGUgKGVsKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGVmdCwgdG9wKTtcclxuXHR9LFxyXG5cclxuXHRkb2N1bWVudElzTHRyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIUwuRG9tVXRpbC5fZG9jSXNMdHJDYWNoZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLl9kb2NJc0x0ckNhY2hlZCA9IHRydWU7XHJcblx0XHRcdEwuRG9tVXRpbC5fZG9jSXNMdHIgPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZG9jdW1lbnQuYm9keSwgJ2RpcmVjdGlvbicpID09PSAnbHRyJztcclxuXHRcdH1cclxuXHRcdHJldHVybiBMLkRvbVV0aWwuX2RvY0lzTHRyO1xyXG5cdH0sXHJcblxyXG5cdGNyZWF0ZTogZnVuY3Rpb24gKHRhZ05hbWUsIGNsYXNzTmFtZSwgY29udGFpbmVyKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcclxuXHRcdGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuXHJcblx0XHRpZiAoY29udGFpbmVyKSB7XHJcblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cdGhhc0NsYXNzOiBmdW5jdGlvbiAoZWwsIG5hbWUpIHtcclxuXHRcdGlmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRyZXR1cm4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGNsYXNzTmFtZSA9IEwuRG9tVXRpbC5fZ2V0Q2xhc3MoZWwpO1xyXG5cdFx0cmV0dXJuIGNsYXNzTmFtZS5sZW5ndGggPiAwICYmIG5ldyBSZWdFeHAoJyhefFxcXFxzKScgKyBuYW1lICsgJyhcXFxcc3wkKScpLnRlc3QoY2xhc3NOYW1lKTtcclxuXHR9LFxyXG5cclxuXHRhZGRDbGFzczogZnVuY3Rpb24gKGVsLCBuYW1lKSB7XHJcblx0XHRpZiAoZWwuY2xhc3NMaXN0ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dmFyIGNsYXNzZXMgPSBMLlV0aWwuc3BsaXRXb3JkcyhuYW1lKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXNbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCFMLkRvbVV0aWwuaGFzQ2xhc3MoZWwsIG5hbWUpKSB7XHJcblx0XHRcdHZhciBjbGFzc05hbWUgPSBMLkRvbVV0aWwuX2dldENsYXNzKGVsKTtcclxuXHRcdFx0TC5Eb21VdGlsLl9zZXRDbGFzcyhlbCwgKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSArICcgJyA6ICcnKSArIG5hbWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWwsIG5hbWUpIHtcclxuXHRcdGlmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLl9zZXRDbGFzcyhlbCwgTC5VdGlsLnRyaW0oKCcgJyArIEwuRG9tVXRpbC5fZ2V0Q2xhc3MoZWwpICsgJyAnKS5yZXBsYWNlKCcgJyArIG5hbWUgKyAnICcsICcgJykpKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfc2V0Q2xhc3M6IGZ1bmN0aW9uIChlbCwgbmFtZSkge1xyXG5cdFx0aWYgKGVsLmNsYXNzTmFtZS5iYXNlVmFsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lID0gbmFtZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGluIGNhc2Ugb2YgU1ZHIGVsZW1lbnRcclxuXHRcdFx0ZWwuY2xhc3NOYW1lLmJhc2VWYWwgPSBuYW1lO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRDbGFzczogZnVuY3Rpb24gKGVsKSB7XHJcblx0XHRyZXR1cm4gZWwuY2xhc3NOYW1lLmJhc2VWYWwgPT09IHVuZGVmaW5lZCA/IGVsLmNsYXNzTmFtZSA6IGVsLmNsYXNzTmFtZS5iYXNlVmFsO1xyXG5cdH0sXHJcblxyXG5cdHNldE9wYWNpdHk6IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcclxuXHJcblx0XHRpZiAoJ29wYWNpdHknIGluIGVsLnN0eWxlKSB7XHJcblx0XHRcdGVsLnN0eWxlLm9wYWNpdHkgPSB2YWx1ZTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKCdmaWx0ZXInIGluIGVsLnN0eWxlKSB7XHJcblxyXG5cdFx0XHR2YXIgZmlsdGVyID0gZmFsc2UsXHJcblx0XHRcdCAgICBmaWx0ZXJOYW1lID0gJ0RYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhJztcclxuXHJcblx0XHRcdC8vIGZpbHRlcnMgY29sbGVjdGlvbiB0aHJvd3MgYW4gZXJyb3IgaWYgd2UgdHJ5IHRvIHJldHJpZXZlIGEgZmlsdGVyIHRoYXQgZG9lc24ndCBleGlzdFxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGZpbHRlciA9IGVsLmZpbHRlcnMuaXRlbShmaWx0ZXJOYW1lKTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdC8vIGRvbid0IHNldCBvcGFjaXR5IHRvIDEgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5IHNldCBhbiBvcGFjaXR5LFxyXG5cdFx0XHRcdC8vIGl0IGlzbid0IG5lZWRlZCBhbmQgYnJlYWtzIHRyYW5zcGFyZW50IHBuZ3MuXHJcblx0XHRcdFx0aWYgKHZhbHVlID09PSAxKSB7IHJldHVybjsgfVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiAxMDApO1xyXG5cclxuXHRcdFx0aWYgKGZpbHRlcikge1xyXG5cdFx0XHRcdGZpbHRlci5FbmFibGVkID0gKHZhbHVlICE9PSAxMDApO1xyXG5cdFx0XHRcdGZpbHRlci5PcGFjaXR5ID0gdmFsdWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZWwuc3R5bGUuZmlsdGVyICs9ICcgcHJvZ2lkOicgKyBmaWx0ZXJOYW1lICsgJyhvcGFjaXR5PScgKyB2YWx1ZSArICcpJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHRlc3RQcm9wOiBmdW5jdGlvbiAocHJvcHMpIHtcclxuXHJcblx0XHR2YXIgc3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAocHJvcHNbaV0gaW4gc3R5bGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJvcHNbaV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRnZXRUcmFuc2xhdGVTdHJpbmc6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0Ly8gb24gV2ViS2l0IGJyb3dzZXJzIChDaHJvbWUvU2FmYXJpL2lPUyBTYWZhcmkvQW5kcm9pZCkgdXNpbmcgdHJhbnNsYXRlM2QgaW5zdGVhZCBvZiB0cmFuc2xhdGVcclxuXHRcdC8vIG1ha2VzIGFuaW1hdGlvbiBzbW9vdGhlciBhcyBpdCBlbnN1cmVzIEhXIGFjY2VsIGlzIHVzZWQuIEZpcmVmb3ggMTMgZG9lc24ndCBjYXJlXHJcblx0XHQvLyAoc2FtZSBzcGVlZCBlaXRoZXIgd2F5KSwgT3BlcmEgMTIgZG9lc24ndCBzdXBwb3J0IHRyYW5zbGF0ZTNkXHJcblxyXG5cdFx0dmFyIGlzM2QgPSBMLkJyb3dzZXIud2Via2l0M2QsXHJcblx0XHQgICAgb3BlbiA9ICd0cmFuc2xhdGUnICsgKGlzM2QgPyAnM2QnIDogJycpICsgJygnLFxyXG5cdFx0ICAgIGNsb3NlID0gKGlzM2QgPyAnLDAnIDogJycpICsgJyknO1xyXG5cclxuXHRcdHJldHVybiBvcGVuICsgcG9pbnQueCArICdweCwnICsgcG9pbnQueSArICdweCcgKyBjbG9zZTtcclxuXHR9LFxyXG5cclxuXHRnZXRTY2FsZVN0cmluZzogZnVuY3Rpb24gKHNjYWxlLCBvcmlnaW4pIHtcclxuXHJcblx0XHR2YXIgcHJlVHJhbnNsYXRlU3RyID0gTC5Eb21VdGlsLmdldFRyYW5zbGF0ZVN0cmluZyhvcmlnaW4uYWRkKG9yaWdpbi5tdWx0aXBseUJ5KC0xICogc2NhbGUpKSksXHJcblx0XHQgICAgc2NhbGVTdHIgPSAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblxyXG5cdFx0cmV0dXJuIHByZVRyYW5zbGF0ZVN0ciArIHNjYWxlU3RyO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvc2l0aW9uOiBmdW5jdGlvbiAoZWwsIHBvaW50LCBkaXNhYmxlM0QpIHsgLy8gKEhUTUxFbGVtZW50LCBQb2ludFssIEJvb2xlYW5dKVxyXG5cclxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXHJcblx0XHRlbC5fbGVhZmxldF9wb3MgPSBwb2ludDtcclxuXHJcblx0XHRpZiAoIWRpc2FibGUzRCAmJiBMLkJyb3dzZXIuYW55M2QpIHtcclxuXHRcdFx0ZWwuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPSAgTC5Eb21VdGlsLmdldFRyYW5zbGF0ZVN0cmluZyhwb2ludCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gcG9pbnQueCArICdweCc7XHJcblx0XHRcdGVsLnN0eWxlLnRvcCA9IHBvaW50LnkgKyAncHgnO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoZWwpIHtcclxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIG9ubHkgdXNlZCBmb3IgZWxlbWVudHMgcHJldmlvdXNseSBwb3NpdGlvbmVkIHVzaW5nIHNldFBvc2l0aW9uLFxyXG5cdFx0Ly8gc28gaXQncyBzYWZlIHRvIGNhY2hlIHRoZSBwb3NpdGlvbiBmb3IgcGVyZm9ybWFuY2VcclxuXHJcblx0XHQvLyBqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZVxyXG5cdFx0cmV0dXJuIGVsLl9sZWFmbGV0X3BvcztcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLy8gcHJlZml4IHN0eWxlIHByb3BlcnR5IG5hbWVzXHJcblxyXG5MLkRvbVV0aWwuVFJBTlNGT1JNID0gTC5Eb21VdGlsLnRlc3RQcm9wKFxyXG4gICAgICAgIFsndHJhbnNmb3JtJywgJ1dlYmtpdFRyYW5zZm9ybScsICdPVHJhbnNmb3JtJywgJ01velRyYW5zZm9ybScsICdtc1RyYW5zZm9ybSddKTtcclxuXHJcbi8vIHdlYmtpdFRyYW5zaXRpb24gY29tZXMgZmlyc3QgYmVjYXVzZSBzb21lIGJyb3dzZXIgdmVyc2lvbnMgdGhhdCBkcm9wIHZlbmRvciBwcmVmaXggZG9uJ3QgZG9cclxuLy8gdGhlIHNhbWUgZm9yIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50LCBpbiBwYXJ0aWN1bGFyIHRoZSBBbmRyb2lkIDQuMSBzdG9jayBicm93c2VyXHJcblxyXG5MLkRvbVV0aWwuVFJBTlNJVElPTiA9IEwuRG9tVXRpbC50ZXN0UHJvcChcclxuICAgICAgICBbJ3dlYmtpdFRyYW5zaXRpb24nLCAndHJhbnNpdGlvbicsICdPVHJhbnNpdGlvbicsICdNb3pUcmFuc2l0aW9uJywgJ21zVHJhbnNpdGlvbiddKTtcclxuXHJcbkwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCA9XHJcbiAgICAgICAgTC5Eb21VdGlsLlRSQU5TSVRJT04gPT09ICd3ZWJraXRUcmFuc2l0aW9uJyB8fCBMLkRvbVV0aWwuVFJBTlNJVElPTiA9PT0gJ09UcmFuc2l0aW9uJyA/XHJcbiAgICAgICAgTC5Eb21VdGlsLlRSQU5TSVRJT04gKyAnRW5kJyA6ICd0cmFuc2l0aW9uZW5kJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoJ29uc2VsZWN0c3RhcnQnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgTC5leHRlbmQoTC5Eb21VdGlsLCB7XHJcbiAgICAgICAgICAgIGRpc2FibGVUZXh0U2VsZWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50Lm9uKHdpbmRvdywgJ3NlbGVjdHN0YXJ0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBlbmFibGVUZXh0U2VsZWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50Lm9mZih3aW5kb3csICdzZWxlY3RzdGFydCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB1c2VyU2VsZWN0UHJvcGVydHkgPSBMLkRvbVV0aWwudGVzdFByb3AoXHJcbiAgICAgICAgICAgIFsndXNlclNlbGVjdCcsICdXZWJraXRVc2VyU2VsZWN0JywgJ09Vc2VyU2VsZWN0JywgJ01velVzZXJTZWxlY3QnLCAnbXNVc2VyU2VsZWN0J10pO1xyXG5cclxuICAgICAgICBMLmV4dGVuZChMLkRvbVV0aWwsIHtcclxuICAgICAgICAgICAgZGlzYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyU2VsZWN0UHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXNlclNlbGVjdCA9IHN0eWxlW3VzZXJTZWxlY3RQcm9wZXJ0eV07XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVbdXNlclNlbGVjdFByb3BlcnR5XSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGVuYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyU2VsZWN0UHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGVbdXNlclNlbGVjdFByb3BlcnR5XSA9IHRoaXMuX3VzZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3VzZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0TC5leHRlbmQoTC5Eb21VdGlsLCB7XHJcblx0XHRkaXNhYmxlSW1hZ2VEcmFnOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQub24od2luZG93LCAnZHJhZ3N0YXJ0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGVuYWJsZUltYWdlRHJhZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9mZih3aW5kb3csICdkcmFnc3RhcnQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcclxuXHRcdH1cclxuXHR9KTtcclxufSkoKTtcclxuXG5cbi8qXHJcbiAqIEwuTGF0TG5nIHJlcHJlc2VudHMgYSBnZW9ncmFwaGljYWwgcG9pbnQgd2l0aCBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGNvb3JkaW5hdGVzLlxyXG4gKi9cclxuXHJcbkwuTGF0TG5nID0gZnVuY3Rpb24gKGxhdCwgbG5nLCBhbHQpIHsgLy8gKE51bWJlciwgTnVtYmVyLCBOdW1iZXIpXHJcblx0bGF0ID0gcGFyc2VGbG9hdChsYXQpO1xyXG5cdGxuZyA9IHBhcnNlRmxvYXQobG5nKTtcclxuXHJcblx0aWYgKGlzTmFOKGxhdCkgfHwgaXNOYU4obG5nKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIExhdExuZyBvYmplY3Q6ICgnICsgbGF0ICsgJywgJyArIGxuZyArICcpJyk7XHJcblx0fVxyXG5cclxuXHR0aGlzLmxhdCA9IGxhdDtcclxuXHR0aGlzLmxuZyA9IGxuZztcclxuXHJcblx0aWYgKGFsdCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHR0aGlzLmFsdCA9IHBhcnNlRmxvYXQoYWx0KTtcclxuXHR9XHJcbn07XHJcblxyXG5MLmV4dGVuZChMLkxhdExuZywge1xyXG5cdERFR19UT19SQUQ6IE1hdGguUEkgLyAxODAsXHJcblx0UkFEX1RPX0RFRzogMTgwIC8gTWF0aC5QSSxcclxuXHRNQVhfTUFSR0lOOiAxLjBFLTkgLy8gbWF4IG1hcmdpbiBvZiBlcnJvciBmb3IgdGhlIFwiZXF1YWxzXCIgY2hlY2tcclxufSk7XHJcblxyXG5MLkxhdExuZy5wcm90b3R5cGUgPSB7XHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAob2JqKSB7IC8vIChMYXRMbmcpIC0+IEJvb2xlYW5cclxuXHRcdGlmICghb2JqKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdG9iaiA9IEwubGF0TG5nKG9iaik7XHJcblxyXG5cdFx0dmFyIG1hcmdpbiA9IE1hdGgubWF4KFxyXG5cdFx0ICAgICAgICBNYXRoLmFicyh0aGlzLmxhdCAtIG9iai5sYXQpLFxyXG5cdFx0ICAgICAgICBNYXRoLmFicyh0aGlzLmxuZyAtIG9iai5sbmcpKTtcclxuXHJcblx0XHRyZXR1cm4gbWFyZ2luIDw9IEwuTGF0TG5nLk1BWF9NQVJHSU47XHJcblx0fSxcclxuXHJcblx0dG9TdHJpbmc6IGZ1bmN0aW9uIChwcmVjaXNpb24pIHsgLy8gKE51bWJlcikgLT4gU3RyaW5nXHJcblx0XHRyZXR1cm4gJ0xhdExuZygnICtcclxuXHRcdCAgICAgICAgTC5VdGlsLmZvcm1hdE51bSh0aGlzLmxhdCwgcHJlY2lzaW9uKSArICcsICcgK1xyXG5cdFx0ICAgICAgICBMLlV0aWwuZm9ybWF0TnVtKHRoaXMubG5nLCBwcmVjaXNpb24pICsgJyknO1xyXG5cdH0sXHJcblxyXG5cdC8vIEhhdmVyc2luZSBkaXN0YW5jZSBmb3JtdWxhLCBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXZlcnNpbmVfZm9ybXVsYVxyXG5cdC8vIFRPRE8gbW92ZSB0byBwcm9qZWN0aW9uIGNvZGUsIExhdExuZyBzaG91bGRuJ3Qga25vdyBhYm91dCBFYXJ0aFxyXG5cdGRpc3RhbmNlVG86IGZ1bmN0aW9uIChvdGhlcikgeyAvLyAoTGF0TG5nKSAtPiBOdW1iZXJcclxuXHRcdG90aGVyID0gTC5sYXRMbmcob3RoZXIpO1xyXG5cclxuXHRcdHZhciBSID0gNjM3ODEzNywgLy8gZWFydGggcmFkaXVzIGluIG1ldGVyc1xyXG5cdFx0ICAgIGQyciA9IEwuTGF0TG5nLkRFR19UT19SQUQsXHJcblx0XHQgICAgZExhdCA9IChvdGhlci5sYXQgLSB0aGlzLmxhdCkgKiBkMnIsXHJcblx0XHQgICAgZExvbiA9IChvdGhlci5sbmcgLSB0aGlzLmxuZykgKiBkMnIsXHJcblx0XHQgICAgbGF0MSA9IHRoaXMubGF0ICogZDJyLFxyXG5cdFx0ICAgIGxhdDIgPSBvdGhlci5sYXQgKiBkMnIsXHJcblx0XHQgICAgc2luMSA9IE1hdGguc2luKGRMYXQgLyAyKSxcclxuXHRcdCAgICBzaW4yID0gTWF0aC5zaW4oZExvbiAvIDIpO1xyXG5cclxuXHRcdHZhciBhID0gc2luMSAqIHNpbjEgKyBzaW4yICogc2luMiAqIE1hdGguY29zKGxhdDEpICogTWF0aC5jb3MobGF0Mik7XHJcblxyXG5cdFx0cmV0dXJuIFIgKiAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xyXG5cdH0sXHJcblxyXG5cdHdyYXA6IGZ1bmN0aW9uIChhLCBiKSB7IC8vIChOdW1iZXIsIE51bWJlcikgLT4gTGF0TG5nXHJcblx0XHR2YXIgbG5nID0gdGhpcy5sbmc7XHJcblxyXG5cdFx0YSA9IGEgfHwgLTE4MDtcclxuXHRcdGIgPSBiIHx8ICAxODA7XHJcblxyXG5cdFx0bG5nID0gKGxuZyArIGIpICUgKGIgLSBhKSArIChsbmcgPCBhIHx8IGxuZyA9PT0gYiA/IGIgOiBhKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKHRoaXMubGF0LCBsbmcpO1xyXG5cdH1cclxufTtcclxuXHJcbkwubGF0TG5nID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8gKExhdExuZykgb3IgKFtOdW1iZXIsIE51bWJlcl0pIG9yIChOdW1iZXIsIE51bWJlcilcclxuXHRpZiAoYSBpbnN0YW5jZW9mIEwuTGF0TG5nKSB7XHJcblx0XHRyZXR1cm4gYTtcclxuXHR9XHJcblx0aWYgKEwuVXRpbC5pc0FycmF5KGEpKSB7XHJcblx0XHRpZiAodHlwZW9mIGFbMF0gPT09ICdudW1iZXInIHx8IHR5cGVvZiBhWzBdID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGFbMF0sIGFbMV0sIGFbMl0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmIChhID09PSB1bmRlZmluZWQgfHwgYSA9PT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cdGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcgJiYgJ2xhdCcgaW4gYSkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhhLmxhdCwgJ2xuZycgaW4gYSA/IGEubG5nIDogYS5sb24pO1xyXG5cdH1cclxuXHRpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0cmV0dXJuIG5ldyBMLkxhdExuZyhhLCBiKTtcclxufTtcclxuXHJcblxuXG4vKlxyXG4gKiBMLkxhdExuZ0JvdW5kcyByZXByZXNlbnRzIGEgcmVjdGFuZ3VsYXIgYXJlYSBvbiB0aGUgbWFwIGluIGdlb2dyYXBoaWNhbCBjb29yZGluYXRlcy5cclxuICovXHJcblxyXG5MLkxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uIChzb3V0aFdlc3QsIG5vcnRoRWFzdCkgeyAvLyAoTGF0TG5nLCBMYXRMbmcpIG9yIChMYXRMbmdbXSlcclxuXHRpZiAoIXNvdXRoV2VzdCkgeyByZXR1cm47IH1cclxuXHJcblx0dmFyIGxhdGxuZ3MgPSBub3J0aEVhc3QgPyBbc291dGhXZXN0LCBub3J0aEVhc3RdIDogc291dGhXZXN0O1xyXG5cclxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gbGF0bG5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0dGhpcy5leHRlbmQobGF0bG5nc1tpXSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5MYXRMbmdCb3VuZHMucHJvdG90eXBlID0ge1xyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIHRvIGNvbnRhaW4gdGhlIGdpdmVuIHBvaW50IG9yIGJvdW5kc1xyXG5cdGV4dGVuZDogZnVuY3Rpb24gKG9iaikgeyAvLyAoTGF0TG5nKSBvciAoTGF0TG5nQm91bmRzKVxyXG5cdFx0aWYgKCFvYmopIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgbGF0TG5nID0gTC5sYXRMbmcob2JqKTtcclxuXHRcdGlmIChsYXRMbmcgIT09IG51bGwpIHtcclxuXHRcdFx0b2JqID0gbGF0TG5nO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b2JqID0gTC5sYXRMbmdCb3VuZHMob2JqKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob2JqIGluc3RhbmNlb2YgTC5MYXRMbmcpIHtcclxuXHRcdFx0aWYgKCF0aGlzLl9zb3V0aFdlc3QgJiYgIXRoaXMuX25vcnRoRWFzdCkge1xyXG5cdFx0XHRcdHRoaXMuX3NvdXRoV2VzdCA9IG5ldyBMLkxhdExuZyhvYmoubGF0LCBvYmoubG5nKTtcclxuXHRcdFx0XHR0aGlzLl9ub3J0aEVhc3QgPSBuZXcgTC5MYXRMbmcob2JqLmxhdCwgb2JqLmxuZyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fc291dGhXZXN0LmxhdCA9IE1hdGgubWluKG9iai5sYXQsIHRoaXMuX3NvdXRoV2VzdC5sYXQpO1xyXG5cdFx0XHRcdHRoaXMuX3NvdXRoV2VzdC5sbmcgPSBNYXRoLm1pbihvYmoubG5nLCB0aGlzLl9zb3V0aFdlc3QubG5nKTtcclxuXHJcblx0XHRcdFx0dGhpcy5fbm9ydGhFYXN0LmxhdCA9IE1hdGgubWF4KG9iai5sYXQsIHRoaXMuX25vcnRoRWFzdC5sYXQpO1xyXG5cdFx0XHRcdHRoaXMuX25vcnRoRWFzdC5sbmcgPSBNYXRoLm1heChvYmoubG5nLCB0aGlzLl9ub3J0aEVhc3QubG5nKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMLkxhdExuZ0JvdW5kcykge1xyXG5cdFx0XHR0aGlzLmV4dGVuZChvYmouX3NvdXRoV2VzdCk7XHJcblx0XHRcdHRoaXMuZXh0ZW5kKG9iai5fbm9ydGhFYXN0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIGJ5IGEgcGVyY2VudGFnZVxyXG5cdHBhZDogZnVuY3Rpb24gKGJ1ZmZlclJhdGlvKSB7IC8vIChOdW1iZXIpIC0+IExhdExuZ0JvdW5kc1xyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIGhlaWdodEJ1ZmZlciA9IE1hdGguYWJzKHN3LmxhdCAtIG5lLmxhdCkgKiBidWZmZXJSYXRpbyxcclxuXHRcdCAgICB3aWR0aEJ1ZmZlciA9IE1hdGguYWJzKHN3LmxuZyAtIG5lLmxuZykgKiBidWZmZXJSYXRpbztcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKFxyXG5cdFx0ICAgICAgICBuZXcgTC5MYXRMbmcoc3cubGF0IC0gaGVpZ2h0QnVmZmVyLCBzdy5sbmcgLSB3aWR0aEJ1ZmZlciksXHJcblx0XHQgICAgICAgIG5ldyBMLkxhdExuZyhuZS5sYXQgKyBoZWlnaHRCdWZmZXIsIG5lLmxuZyArIHdpZHRoQnVmZmVyKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0Q2VudGVyOiBmdW5jdGlvbiAoKSB7IC8vIC0+IExhdExuZ1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhcclxuXHRcdCAgICAgICAgKHRoaXMuX3NvdXRoV2VzdC5sYXQgKyB0aGlzLl9ub3J0aEVhc3QubGF0KSAvIDIsXHJcblx0XHQgICAgICAgICh0aGlzLl9zb3V0aFdlc3QubG5nICsgdGhpcy5fbm9ydGhFYXN0LmxuZykgLyAyKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTb3V0aFdlc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3Q7XHJcblx0fSxcclxuXHJcblx0Z2V0Tm9ydGhFYXN0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbm9ydGhFYXN0O1xyXG5cdH0sXHJcblxyXG5cdGdldE5vcnRoV2VzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyh0aGlzLmdldE5vcnRoKCksIHRoaXMuZ2V0V2VzdCgpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTb3V0aEVhc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcodGhpcy5nZXRTb3V0aCgpLCB0aGlzLmdldEVhc3QoKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0V2VzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NvdXRoV2VzdC5sbmc7XHJcblx0fSxcclxuXHJcblx0Z2V0U291dGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3QubGF0O1xyXG5cdH0sXHJcblxyXG5cdGdldEVhc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9ub3J0aEVhc3QubG5nO1xyXG5cdH0sXHJcblxyXG5cdGdldE5vcnRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbm9ydGhFYXN0LmxhdDtcclxuXHR9LFxyXG5cclxuXHRjb250YWluczogZnVuY3Rpb24gKG9iaikgeyAvLyAoTGF0TG5nQm91bmRzKSBvciAoTGF0TG5nKSAtPiBCb29sZWFuXHJcblx0XHRpZiAodHlwZW9mIG9ialswXSA9PT0gJ251bWJlcicgfHwgb2JqIGluc3RhbmNlb2YgTC5MYXRMbmcpIHtcclxuXHRcdFx0b2JqID0gTC5sYXRMbmcob2JqKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9iaiA9IEwubGF0TG5nQm91bmRzKG9iaik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIHN3MiwgbmUyO1xyXG5cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBMLkxhdExuZ0JvdW5kcykge1xyXG5cdFx0XHRzdzIgPSBvYmouZ2V0U291dGhXZXN0KCk7XHJcblx0XHRcdG5lMiA9IG9iai5nZXROb3J0aEVhc3QoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHN3MiA9IG5lMiA9IG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gKHN3Mi5sYXQgPj0gc3cubGF0KSAmJiAobmUyLmxhdCA8PSBuZS5sYXQpICYmXHJcblx0XHQgICAgICAgKHN3Mi5sbmcgPj0gc3cubG5nKSAmJiAobmUyLmxuZyA8PSBuZS5sbmcpO1xyXG5cdH0sXHJcblxyXG5cdGludGVyc2VjdHM6IGZ1bmN0aW9uIChib3VuZHMpIHsgLy8gKExhdExuZ0JvdW5kcylcclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIHN3MiA9IGJvdW5kcy5nZXRTb3V0aFdlc3QoKSxcclxuXHRcdCAgICBuZTIgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCksXHJcblxyXG5cdFx0ICAgIGxhdEludGVyc2VjdHMgPSAobmUyLmxhdCA+PSBzdy5sYXQpICYmIChzdzIubGF0IDw9IG5lLmxhdCksXHJcblx0XHQgICAgbG5nSW50ZXJzZWN0cyA9IChuZTIubG5nID49IHN3LmxuZykgJiYgKHN3Mi5sbmcgPD0gbmUubG5nKTtcclxuXHJcblx0XHRyZXR1cm4gbGF0SW50ZXJzZWN0cyAmJiBsbmdJbnRlcnNlY3RzO1xyXG5cdH0sXHJcblxyXG5cdHRvQkJveFN0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIFt0aGlzLmdldFdlc3QoKSwgdGhpcy5nZXRTb3V0aCgpLCB0aGlzLmdldEVhc3QoKSwgdGhpcy5nZXROb3J0aCgpXS5qb2luKCcsJyk7XHJcblx0fSxcclxuXHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAoYm91bmRzKSB7IC8vIChMYXRMbmdCb3VuZHMpXHJcblx0XHRpZiAoIWJvdW5kcykgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcblx0XHRib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3QuZXF1YWxzKGJvdW5kcy5nZXRTb3V0aFdlc3QoKSkgJiZcclxuXHRcdCAgICAgICB0aGlzLl9ub3J0aEVhc3QuZXF1YWxzKGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XHJcblx0fSxcclxuXHJcblx0aXNWYWxpZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMuX3NvdXRoV2VzdCAmJiB0aGlzLl9ub3J0aEVhc3QpO1xyXG5cdH1cclxufTtcclxuXHJcbi8vVE9ETyBJbnRlcm5hdGlvbmFsIGRhdGUgbGluZT9cclxuXHJcbkwubGF0TG5nQm91bmRzID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8gKExhdExuZ0JvdW5kcykgb3IgKExhdExuZywgTGF0TG5nKVxyXG5cdGlmICghYSB8fCBhIGluc3RhbmNlb2YgTC5MYXRMbmdCb3VuZHMpIHtcclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKGEsIGIpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5Qcm9qZWN0aW9uIGNvbnRhaW5zIHZhcmlvdXMgZ2VvZ3JhcGhpY2FsIHByb2plY3Rpb25zIHVzZWQgYnkgQ1JTIGNsYXNzZXMuXHJcbiAqL1xyXG5cclxuTC5Qcm9qZWN0aW9uID0ge307XHJcblxuXG4vKlxyXG4gKiBTcGhlcmljYWwgTWVyY2F0b3IgaXMgdGhlIG1vc3QgcG9wdWxhciBtYXAgcHJvamVjdGlvbiwgdXNlZCBieSBFUFNHOjM4NTcgQ1JTIHVzZWQgYnkgZGVmYXVsdC5cclxuICovXHJcblxyXG5MLlByb2plY3Rpb24uU3BoZXJpY2FsTWVyY2F0b3IgPSB7XHJcblx0TUFYX0xBVElUVURFOiA4NS4wNTExMjg3Nzk4LFxyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpIC0+IFBvaW50XHJcblx0XHR2YXIgZCA9IEwuTGF0TG5nLkRFR19UT19SQUQsXHJcblx0XHQgICAgbWF4ID0gdGhpcy5NQVhfTEFUSVRVREUsXHJcblx0XHQgICAgbGF0ID0gTWF0aC5tYXgoTWF0aC5taW4obWF4LCBsYXRsbmcubGF0KSwgLW1heCksXHJcblx0XHQgICAgeCA9IGxhdGxuZy5sbmcgKiBkLFxyXG5cdFx0ICAgIHkgPSBsYXQgKiBkO1xyXG5cclxuXHRcdHkgPSBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSAvIDQpICsgKHkgLyAyKSkpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5KTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQsIEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dmFyIGQgPSBMLkxhdExuZy5SQURfVE9fREVHLFxyXG5cdFx0ICAgIGxuZyA9IHBvaW50LnggKiBkLFxyXG5cdFx0ICAgIGxhdCA9ICgyICogTWF0aC5hdGFuKE1hdGguZXhwKHBvaW50LnkpKSAtIChNYXRoLlBJIC8gMikpICogZDtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGxhdCwgbG5nKTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBTaW1wbGUgZXF1aXJlY3Rhbmd1bGFyIChQbGF0ZSBDYXJyZWUpIHByb2plY3Rpb24sIHVzZWQgYnkgQ1JTIGxpa2UgRVBTRzo0MzI2IGFuZCBTaW1wbGUuXHJcbiAqL1xyXG5cclxuTC5Qcm9qZWN0aW9uLkxvbkxhdCA9IHtcclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGF0bG5nLmxuZywgbGF0bG5nLmxhdCk7XHJcblx0fSxcclxuXHJcblx0dW5wcm9qZWN0OiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcocG9pbnQueSwgcG9pbnQueCk7XHJcblx0fVxyXG59O1xyXG5cblxuLypcclxuICogTC5DUlMgaXMgYSBiYXNlIG9iamVjdCBmb3IgYWxsIGRlZmluZWQgQ1JTIChDb29yZGluYXRlIFJlZmVyZW5jZSBTeXN0ZW1zKSBpbiBMZWFmbGV0LlxyXG4gKi9cclxuXHJcbkwuQ1JTID0ge1xyXG5cdGxhdExuZ1RvUG9pbnQ6IGZ1bmN0aW9uIChsYXRsbmcsIHpvb20pIHsgLy8gKExhdExuZywgTnVtYmVyKSAtPiBQb2ludFxyXG5cdFx0dmFyIHByb2plY3RlZFBvaW50ID0gdGhpcy5wcm9qZWN0aW9uLnByb2plY3QobGF0bG5nKSxcclxuXHRcdCAgICBzY2FsZSA9IHRoaXMuc2NhbGUoem9vbSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb24uX3RyYW5zZm9ybShwcm9qZWN0ZWRQb2ludCwgc2NhbGUpO1xyXG5cdH0sXHJcblxyXG5cdHBvaW50VG9MYXRMbmc6IGZ1bmN0aW9uIChwb2ludCwgem9vbSkgeyAvLyAoUG9pbnQsIE51bWJlclssIEJvb2xlYW5dKSAtPiBMYXRMbmdcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuc2NhbGUoem9vbSksXHJcblx0XHQgICAgdW50cmFuc2Zvcm1lZFBvaW50ID0gdGhpcy50cmFuc2Zvcm1hdGlvbi51bnRyYW5zZm9ybShwb2ludCwgc2NhbGUpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnByb2plY3Rpb24udW5wcm9qZWN0KHVudHJhbnNmb3JtZWRQb2ludCk7XHJcblx0fSxcclxuXHJcblx0cHJvamVjdDogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0cmV0dXJuIHRoaXMucHJvamVjdGlvbi5wcm9qZWN0KGxhdGxuZyk7XHJcblx0fSxcclxuXHJcblx0c2NhbGU6IGZ1bmN0aW9uICh6b29tKSB7XHJcblx0XHRyZXR1cm4gMjU2ICogTWF0aC5wb3coMiwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0Z2V0U2l6ZTogZnVuY3Rpb24gKHpvb20pIHtcclxuXHRcdHZhciBzID0gdGhpcy5zY2FsZSh6b29tKTtcclxuXHRcdHJldHVybiBMLnBvaW50KHMsIHMpO1xyXG5cdH1cclxufTtcclxuXG5cbi8qXG4gKiBBIHNpbXBsZSBDUlMgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZmxhdCBub24tRWFydGggbWFwcyBsaWtlIHBhbm9yYW1hcyBvciBnYW1lIG1hcHMuXG4gKi9cblxuTC5DUlMuU2ltcGxlID0gTC5leHRlbmQoe30sIEwuQ1JTLCB7XG5cdHByb2plY3Rpb246IEwuUHJvamVjdGlvbi5Mb25MYXQsXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigxLCAwLCAtMSwgMCksXG5cblx0c2NhbGU6IGZ1bmN0aW9uICh6b29tKSB7XG5cdFx0cmV0dXJuIE1hdGgucG93KDIsIHpvb20pO1xuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBMLkNSUy5FUFNHMzg1NyAoU3BoZXJpY2FsIE1lcmNhdG9yKSBpcyB0aGUgbW9zdCBjb21tb24gQ1JTIGZvciB3ZWIgbWFwcGluZ1xyXG4gKiBhbmQgaXMgdXNlZCBieSBMZWFmbGV0IGJ5IGRlZmF1bHQuXHJcbiAqL1xyXG5cclxuTC5DUlMuRVBTRzM4NTcgPSBMLmV4dGVuZCh7fSwgTC5DUlMsIHtcclxuXHRjb2RlOiAnRVBTRzozODU3JyxcclxuXHJcblx0cHJvamVjdGlvbjogTC5Qcm9qZWN0aW9uLlNwaGVyaWNhbE1lcmNhdG9yLFxyXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigwLjUgLyBNYXRoLlBJLCAwLjUsIC0wLjUgLyBNYXRoLlBJLCAwLjUpLFxyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpIC0+IFBvaW50XHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSB0aGlzLnByb2plY3Rpb24ucHJvamVjdChsYXRsbmcpLFxyXG5cdFx0ICAgIGVhcnRoUmFkaXVzID0gNjM3ODEzNztcclxuXHRcdHJldHVybiBwcm9qZWN0ZWRQb2ludC5tdWx0aXBseUJ5KGVhcnRoUmFkaXVzKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5DUlMuRVBTRzkwMDkxMyA9IEwuZXh0ZW5kKHt9LCBMLkNSUy5FUFNHMzg1Nywge1xyXG5cdGNvZGU6ICdFUFNHOjkwMDkxMydcclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLkNSUy5FUFNHNDMyNiBpcyBhIENSUyBwb3B1bGFyIGFtb25nIGFkdmFuY2VkIEdJUyBzcGVjaWFsaXN0cy5cclxuICovXHJcblxyXG5MLkNSUy5FUFNHNDMyNiA9IEwuZXh0ZW5kKHt9LCBMLkNSUywge1xyXG5cdGNvZGU6ICdFUFNHOjQzMjYnLFxyXG5cclxuXHRwcm9qZWN0aW9uOiBMLlByb2plY3Rpb24uTG9uTGF0LFxyXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigxIC8gMzYwLCAwLjUsIC0xIC8gMzYwLCAwLjUpXHJcbn0pO1xyXG5cblxuLypcclxuICogTC5NYXAgaXMgdGhlIGNlbnRyYWwgY2xhc3Mgb2YgdGhlIEFQSSAtIGl0IGlzIHVzZWQgdG8gY3JlYXRlIGEgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFwID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGNyczogTC5DUlMuRVBTRzM4NTcsXHJcblxyXG5cdFx0LypcclxuXHRcdGNlbnRlcjogTGF0TG5nLFxyXG5cdFx0em9vbTogTnVtYmVyLFxyXG5cdFx0bGF5ZXJzOiBBcnJheSxcclxuXHRcdCovXHJcblxyXG5cdFx0ZmFkZUFuaW1hdGlvbjogTC5Eb21VdGlsLlRSQU5TSVRJT04gJiYgIUwuQnJvd3Nlci5hbmRyb2lkMjMsXHJcblx0XHR0cmFja1Jlc2l6ZTogdHJ1ZSxcclxuXHRcdG1hcmtlclpvb21BbmltYXRpb246IEwuRG9tVXRpbC5UUkFOU0lUSU9OICYmIEwuQnJvd3Nlci5hbnkzZFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChpZCwgb3B0aW9ucykgeyAvLyAoSFRNTEVsZW1lbnQgb3IgU3RyaW5nLCBPYmplY3QpXHJcblx0XHRvcHRpb25zID0gTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHJcblx0XHR0aGlzLl9pbml0Q29udGFpbmVyKGlkKTtcclxuXHRcdHRoaXMuX2luaXRMYXlvdXQoKTtcclxuXHJcblx0XHQvLyBoYWNrIGZvciBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2lzc3Vlcy8xOTgwXHJcblx0XHR0aGlzLl9vblJlc2l6ZSA9IEwuYmluZCh0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLm1heEJvdW5kcykge1xyXG5cdFx0XHR0aGlzLnNldE1heEJvdW5kcyhvcHRpb25zLm1heEJvdW5kcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2VudGVyICYmIG9wdGlvbnMuem9vbSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuc2V0VmlldyhMLmxhdExuZyhvcHRpb25zLmNlbnRlciksIG9wdGlvbnMuem9vbSwge3Jlc2V0OiB0cnVlfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faGFuZGxlcnMgPSBbXTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHRcdHRoaXMuX3pvb21Cb3VuZExheWVycyA9IHt9O1xyXG5cdFx0dGhpcy5fdGlsZUxheWVyc051bSA9IDA7XHJcblxyXG5cdFx0dGhpcy5jYWxsSW5pdEhvb2tzKCk7XHJcblxyXG5cdFx0dGhpcy5fYWRkTGF5ZXJzKG9wdGlvbnMubGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gcHVibGljIG1ldGhvZHMgdGhhdCBtb2RpZnkgbWFwIHN0YXRlXHJcblxyXG5cdC8vIHJlcGxhY2VkIGJ5IGFuaW1hdGlvbi1wb3dlcmVkIGltcGxlbWVudGF0aW9uIGluIE1hcC5QYW5BbmltYXRpb24uanNcclxuXHRzZXRWaWV3OiBmdW5jdGlvbiAoY2VudGVyLCB6b29tKSB7XHJcblx0XHR6b29tID0gem9vbSA9PT0gdW5kZWZpbmVkID8gdGhpcy5nZXRab29tKCkgOiB6b29tO1xyXG5cdFx0dGhpcy5fcmVzZXRWaWV3KEwubGF0TG5nKGNlbnRlciksIHRoaXMuX2xpbWl0Wm9vbSh6b29tKSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRab29tOiBmdW5jdGlvbiAoem9vbSwgb3B0aW9ucykge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fem9vbSA9IHRoaXMuX2xpbWl0Wm9vbSh6b29tKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KHRoaXMuZ2V0Q2VudGVyKCksIHpvb20sIHt6b29tOiBvcHRpb25zfSk7XHJcblx0fSxcclxuXHJcblx0em9vbUluOiBmdW5jdGlvbiAoZGVsdGEsIG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiB0aGlzLnNldFpvb20odGhpcy5fem9vbSArIChkZWx0YSB8fCAxKSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0em9vbU91dDogZnVuY3Rpb24gKGRlbHRhLCBvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZXRab29tKHRoaXMuX3pvb20gLSAoZGVsdGEgfHwgMSksIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdHNldFpvb21Bcm91bmQ6IGZ1bmN0aW9uIChsYXRsbmcsIHpvb20sIG9wdGlvbnMpIHtcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuZ2V0Wm9vbVNjYWxlKHpvb20pLFxyXG5cdFx0ICAgIHZpZXdIYWxmID0gdGhpcy5nZXRTaXplKCkuZGl2aWRlQnkoMiksXHJcblx0XHQgICAgY29udGFpbmVyUG9pbnQgPSBsYXRsbmcgaW5zdGFuY2VvZiBMLlBvaW50ID8gbGF0bG5nIDogdGhpcy5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxhdGxuZyksXHJcblxyXG5cdFx0ICAgIGNlbnRlck9mZnNldCA9IGNvbnRhaW5lclBvaW50LnN1YnRyYWN0KHZpZXdIYWxmKS5tdWx0aXBseUJ5KDEgLSAxIC8gc2NhbGUpLFxyXG5cdFx0ICAgIG5ld0NlbnRlciA9IHRoaXMuY29udGFpbmVyUG9pbnRUb0xhdExuZyh2aWV3SGFsZi5hZGQoY2VudGVyT2Zmc2V0KSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuc2V0VmlldyhuZXdDZW50ZXIsIHpvb20sIHt6b29tOiBvcHRpb25zfSk7XHJcblx0fSxcclxuXHJcblx0Zml0Qm91bmRzOiBmdW5jdGlvbiAoYm91bmRzLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblx0XHRib3VuZHMgPSBib3VuZHMuZ2V0Qm91bmRzID8gYm91bmRzLmdldEJvdW5kcygpIDogTC5sYXRMbmdCb3VuZHMoYm91bmRzKTtcclxuXHJcblx0XHR2YXIgcGFkZGluZ1RMID0gTC5wb2ludChvcHRpb25zLnBhZGRpbmdUb3BMZWZ0IHx8IG9wdGlvbnMucGFkZGluZyB8fCBbMCwgMF0pLFxyXG5cdFx0ICAgIHBhZGRpbmdCUiA9IEwucG9pbnQob3B0aW9ucy5wYWRkaW5nQm90dG9tUmlnaHQgfHwgb3B0aW9ucy5wYWRkaW5nIHx8IFswLCAwXSksXHJcblxyXG5cdFx0ICAgIHpvb20gPSB0aGlzLmdldEJvdW5kc1pvb20oYm91bmRzLCBmYWxzZSwgcGFkZGluZ1RMLmFkZChwYWRkaW5nQlIpKSxcclxuXHRcdCAgICBwYWRkaW5nT2Zmc2V0ID0gcGFkZGluZ0JSLnN1YnRyYWN0KHBhZGRpbmdUTCkuZGl2aWRlQnkoMiksXHJcblxyXG5cdFx0ICAgIHN3UG9pbnQgPSB0aGlzLnByb2plY3QoYm91bmRzLmdldFNvdXRoV2VzdCgpLCB6b29tKSxcclxuXHRcdCAgICBuZVBvaW50ID0gdGhpcy5wcm9qZWN0KGJvdW5kcy5nZXROb3J0aEVhc3QoKSwgem9vbSksXHJcblx0XHQgICAgY2VudGVyID0gdGhpcy51bnByb2plY3Qoc3dQb2ludC5hZGQobmVQb2ludCkuZGl2aWRlQnkoMikuYWRkKHBhZGRpbmdPZmZzZXQpLCB6b29tKTtcclxuXHJcblx0XHR6b29tID0gb3B0aW9ucyAmJiBvcHRpb25zLm1heFpvb20gPyBNYXRoLm1pbihvcHRpb25zLm1heFpvb20sIHpvb20pIDogem9vbTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KGNlbnRlciwgem9vbSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0Zml0V29ybGQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5maXRCb3VuZHMoW1stOTAsIC0xODBdLCBbOTAsIDE4MF1dLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRwYW5UbzogZnVuY3Rpb24gKGNlbnRlciwgb3B0aW9ucykgeyAvLyAoTGF0TG5nKVxyXG5cdFx0cmV0dXJuIHRoaXMuc2V0VmlldyhjZW50ZXIsIHRoaXMuX3pvb20sIHtwYW46IG9wdGlvbnN9KTtcclxuXHR9LFxyXG5cclxuXHRwYW5CeTogZnVuY3Rpb24gKG9mZnNldCkgeyAvLyAoUG9pbnQpXHJcblx0XHQvLyByZXBsYWNlZCB3aXRoIGFuaW1hdGVkIHBhbkJ5IGluIE1hcC5QYW5BbmltYXRpb24uanNcclxuXHRcdHRoaXMuZmlyZSgnbW92ZXN0YXJ0Jyk7XHJcblxyXG5cdFx0dGhpcy5fcmF3UGFuQnkoTC5wb2ludChvZmZzZXQpKTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ21vdmUnKTtcclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ21vdmVlbmQnKTtcclxuXHR9LFxyXG5cclxuXHRzZXRNYXhCb3VuZHM6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zLm1heEJvdW5kcyA9IGJvdW5kcztcclxuXHJcblx0XHRpZiAoIWJvdW5kcykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vZmYoJ21vdmVlbmQnLCB0aGlzLl9wYW5JbnNpZGVNYXhCb3VuZHMsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fcGFuSW5zaWRlTWF4Qm91bmRzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl9wYW5JbnNpZGVNYXhCb3VuZHMsIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdHBhbkluc2lkZUJvdW5kczogZnVuY3Rpb24gKGJvdW5kcywgb3B0aW9ucykge1xyXG5cdFx0dmFyIGNlbnRlciA9IHRoaXMuZ2V0Q2VudGVyKCksXHJcblx0XHRcdG5ld0NlbnRlciA9IHRoaXMuX2xpbWl0Q2VudGVyKGNlbnRlciwgdGhpcy5fem9vbSwgYm91bmRzKTtcclxuXHJcblx0XHRpZiAoY2VudGVyLmVxdWFscyhuZXdDZW50ZXIpKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMucGFuVG8obmV3Q2VudGVyLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRhZGRMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHQvLyBUT0RPIG1ldGhvZCBpcyB0b28gYmlnLCByZWZhY3RvclxyXG5cclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9sYXllcnNbaWRdKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cclxuXHRcdC8vIFRPRE8gZ2V0TWF4Wm9vbSwgZ2V0TWluWm9vbSBpbiBJTGF5ZXIgKGluc3RlYWQgb2Ygb3B0aW9ucylcclxuXHRcdGlmIChsYXllci5vcHRpb25zICYmICghaXNOYU4obGF5ZXIub3B0aW9ucy5tYXhab29tKSB8fCAhaXNOYU4obGF5ZXIub3B0aW9ucy5taW5ab29tKSkpIHtcclxuXHRcdFx0dGhpcy5fem9vbUJvdW5kTGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cdFx0XHR0aGlzLl91cGRhdGVab29tTGV2ZWxzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVE9ETyBsb29rcyB1Z2x5LCByZWZhY3RvciEhIVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuVGlsZUxheWVyICYmIChsYXllciBpbnN0YW5jZW9mIEwuVGlsZUxheWVyKSkge1xyXG5cdFx0XHR0aGlzLl90aWxlTGF5ZXJzTnVtKys7XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQrKztcclxuXHRcdFx0bGF5ZXIub24oJ2xvYWQnLCB0aGlzLl9vblRpbGVMYXllckxvYWQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fbGF5ZXJBZGQobGF5ZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdGlmICghdGhpcy5fbGF5ZXJzW2lkXSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0bGF5ZXIub25SZW1vdmUodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVsZXRlIHRoaXMuX2xheWVyc1tpZF07XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xheWVycmVtb3ZlJywge2xheWVyOiBsYXllcn0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl96b29tQm91bmRMYXllcnNbaWRdKSB7XHJcblx0XHRcdGRlbGV0ZSB0aGlzLl96b29tQm91bmRMYXllcnNbaWRdO1xyXG5cdFx0XHR0aGlzLl91cGRhdGVab29tTGV2ZWxzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVE9ETyBsb29rcyB1Z2x5LCByZWZhY3RvclxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuVGlsZUxheWVyICYmIChsYXllciBpbnN0YW5jZW9mIEwuVGlsZUxheWVyKSkge1xyXG5cdFx0XHR0aGlzLl90aWxlTGF5ZXJzTnVtLS07XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQtLTtcclxuXHRcdFx0bGF5ZXIub2ZmKCdsb2FkJywgdGhpcy5fb25UaWxlTGF5ZXJMb2FkLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRoYXNMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIWxheWVyKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdHJldHVybiAoTC5zdGFtcChsYXllcikgaW4gdGhpcy5fbGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHRlYWNoTGF5ZXI6IGZ1bmN0aW9uIChtZXRob2QsIGNvbnRleHQpIHtcclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdG1ldGhvZC5jYWxsKGNvbnRleHQsIHRoaXMuX2xheWVyc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRpbnZhbGlkYXRlU2l6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdGlmICghdGhpcy5fbG9hZGVkKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0b3B0aW9ucyA9IEwuZXh0ZW5kKHtcclxuXHRcdFx0YW5pbWF0ZTogZmFsc2UsXHJcblx0XHRcdHBhbjogdHJ1ZVxyXG5cdFx0fSwgb3B0aW9ucyA9PT0gdHJ1ZSA/IHthbmltYXRlOiB0cnVlfSA6IG9wdGlvbnMpO1xyXG5cclxuXHRcdHZhciBvbGRTaXplID0gdGhpcy5nZXRTaXplKCk7XHJcblx0XHR0aGlzLl9zaXplQ2hhbmdlZCA9IHRydWU7XHJcblx0XHR0aGlzLl9pbml0aWFsQ2VudGVyID0gbnVsbDtcclxuXHJcblx0XHR2YXIgbmV3U2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpLFxyXG5cdFx0ICAgIG9sZENlbnRlciA9IG9sZFNpemUuZGl2aWRlQnkoMikucm91bmQoKSxcclxuXHRcdCAgICBuZXdDZW50ZXIgPSBuZXdTaXplLmRpdmlkZUJ5KDIpLnJvdW5kKCksXHJcblx0XHQgICAgb2Zmc2V0ID0gb2xkQ2VudGVyLnN1YnRyYWN0KG5ld0NlbnRlcik7XHJcblxyXG5cdFx0aWYgKCFvZmZzZXQueCAmJiAhb2Zmc2V0LnkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5hbmltYXRlICYmIG9wdGlvbnMucGFuKSB7XHJcblx0XHRcdHRoaXMucGFuQnkob2Zmc2V0KTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAob3B0aW9ucy5wYW4pIHtcclxuXHRcdFx0XHR0aGlzLl9yYXdQYW5CeShvZmZzZXQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdmUnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmRlYm91bmNlTW92ZWVuZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9zaXplVGltZXIpO1xyXG5cdFx0XHRcdHRoaXMuX3NpemVUaW1lciA9IHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuZmlyZSwgdGhpcywgJ21vdmVlbmQnKSwgMjAwKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmZpcmUoJ21vdmVlbmQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ3Jlc2l6ZScsIHtcclxuXHRcdFx0b2xkU2l6ZTogb2xkU2l6ZSxcclxuXHRcdFx0bmV3U2l6ZTogbmV3U2l6ZVxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8gVE9ETyBoYW5kbGVyLmFkZFRvXHJcblx0YWRkSGFuZGxlcjogZnVuY3Rpb24gKG5hbWUsIEhhbmRsZXJDbGFzcykge1xyXG5cdFx0aWYgKCFIYW5kbGVyQ2xhc3MpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgaGFuZGxlciA9IHRoaXNbbmFtZV0gPSBuZXcgSGFuZGxlckNsYXNzKHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuX2hhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9uc1tuYW1lXSkge1xyXG5cdFx0XHRoYW5kbGVyLmVuYWJsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ3VubG9hZCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2luaXRFdmVudHMoJ29mZicpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vIHRocm93cyBlcnJvciBpbiBJRTYtOFxyXG5cdFx0XHRkZWxldGUgdGhpcy5fY29udGFpbmVyLl9sZWFmbGV0O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHR0aGlzLl9jb250YWluZXIuX2xlYWZsZXQgPSB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY2xlYXJQYW5lcygpO1xyXG5cdFx0aWYgKHRoaXMuX2NsZWFyQ29udHJvbFBvcykge1xyXG5cdFx0XHR0aGlzLl9jbGVhckNvbnRyb2xQb3MoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jbGVhckhhbmRsZXJzKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblxyXG5cdC8vIHB1YmxpYyBtZXRob2RzIGZvciBnZXR0aW5nIG1hcCBzdGF0ZVxyXG5cclxuXHRnZXRDZW50ZXI6IGZ1bmN0aW9uICgpIHsgLy8gKEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dGhpcy5fY2hlY2tJZkxvYWRlZCgpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9pbml0aWFsQ2VudGVyICYmICF0aGlzLl9tb3ZlZCgpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbml0aWFsQ2VudGVyO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJQb2ludFRvTGF0TG5nKHRoaXMuX2dldENlbnRlckxheWVyUG9pbnQoKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0Wm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvb207XHJcblx0fSxcclxuXHJcblx0Z2V0Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgYm91bmRzID0gdGhpcy5nZXRQaXhlbEJvdW5kcygpLFxyXG5cdFx0ICAgIHN3ID0gdGhpcy51bnByb2plY3QoYm91bmRzLmdldEJvdHRvbUxlZnQoKSksXHJcblx0XHQgICAgbmUgPSB0aGlzLnVucHJvamVjdChib3VuZHMuZ2V0VG9wUmlnaHQoKSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZ0JvdW5kcyhzdywgbmUpO1xyXG5cdH0sXHJcblxyXG5cdGdldE1pblpvb206IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWluWm9vbSA9PT0gdW5kZWZpbmVkID9cclxuXHRcdFx0KHRoaXMuX2xheWVyc01pblpvb20gPT09IHVuZGVmaW5lZCA/IDAgOiB0aGlzLl9sYXllcnNNaW5ab29tKSA6XHJcblx0XHRcdHRoaXMub3B0aW9ucy5taW5ab29tO1xyXG5cdH0sXHJcblxyXG5cdGdldE1heFpvb206IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWF4Wm9vbSA9PT0gdW5kZWZpbmVkID9cclxuXHRcdFx0KHRoaXMuX2xheWVyc01heFpvb20gPT09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogdGhpcy5fbGF5ZXJzTWF4Wm9vbSkgOlxyXG5cdFx0XHR0aGlzLm9wdGlvbnMubWF4Wm9vbTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHNab29tOiBmdW5jdGlvbiAoYm91bmRzLCBpbnNpZGUsIHBhZGRpbmcpIHsgLy8gKExhdExuZ0JvdW5kc1ssIEJvb2xlYW4sIFBvaW50XSkgLT4gTnVtYmVyXHJcblx0XHRib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdHZhciB6b29tID0gdGhpcy5nZXRNaW5ab29tKCkgLSAoaW5zaWRlID8gMSA6IDApLFxyXG5cdFx0ICAgIG1heFpvb20gPSB0aGlzLmdldE1heFpvb20oKSxcclxuXHRcdCAgICBzaXplID0gdGhpcy5nZXRTaXplKCksXHJcblxyXG5cdFx0ICAgIG53ID0gYm91bmRzLmdldE5vcnRoV2VzdCgpLFxyXG5cdFx0ICAgIHNlID0gYm91bmRzLmdldFNvdXRoRWFzdCgpLFxyXG5cclxuXHRcdCAgICB6b29tTm90Rm91bmQgPSB0cnVlLFxyXG5cdFx0ICAgIGJvdW5kc1NpemU7XHJcblxyXG5cdFx0cGFkZGluZyA9IEwucG9pbnQocGFkZGluZyB8fCBbMCwgMF0pO1xyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0em9vbSsrO1xyXG5cdFx0XHRib3VuZHNTaXplID0gdGhpcy5wcm9qZWN0KHNlLCB6b29tKS5zdWJ0cmFjdCh0aGlzLnByb2plY3QobncsIHpvb20pKS5hZGQocGFkZGluZyk7XHJcblx0XHRcdHpvb21Ob3RGb3VuZCA9ICFpbnNpZGUgPyBzaXplLmNvbnRhaW5zKGJvdW5kc1NpemUpIDogYm91bmRzU2l6ZS54IDwgc2l6ZS54IHx8IGJvdW5kc1NpemUueSA8IHNpemUueTtcclxuXHJcblx0XHR9IHdoaWxlICh6b29tTm90Rm91bmQgJiYgem9vbSA8PSBtYXhab29tKTtcclxuXHJcblx0XHRpZiAoem9vbU5vdEZvdW5kICYmIGluc2lkZSkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW5zaWRlID8gem9vbSA6IHpvb20gLSAxO1xyXG5cdH0sXHJcblxyXG5cdGdldFNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fc2l6ZSB8fCB0aGlzLl9zaXplQ2hhbmdlZCkge1xyXG5cdFx0XHR0aGlzLl9zaXplID0gbmV3IEwuUG9pbnQoXHJcblx0XHRcdFx0dGhpcy5fY29udGFpbmVyLmNsaWVudFdpZHRoLFxyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lci5jbGllbnRIZWlnaHQpO1xyXG5cclxuXHRcdFx0dGhpcy5fc2l6ZUNoYW5nZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9zaXplLmNsb25lKCk7XHJcblx0fSxcclxuXHJcblx0Z2V0UGl4ZWxCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0b3BMZWZ0UG9pbnQgPSB0aGlzLl9nZXRUb3BMZWZ0UG9pbnQoKTtcclxuXHRcdHJldHVybiBuZXcgTC5Cb3VuZHModG9wTGVmdFBvaW50LCB0b3BMZWZ0UG9pbnQuYWRkKHRoaXMuZ2V0U2l6ZSgpKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0UGl4ZWxPcmlnaW46IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NoZWNrSWZMb2FkZWQoKTtcclxuXHRcdHJldHVybiB0aGlzLl9pbml0aWFsVG9wTGVmdFBvaW50O1xyXG5cdH0sXHJcblxyXG5cdGdldFBhbmVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFuZXM7XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBUT0RPIHJlcGxhY2Ugd2l0aCB1bml2ZXJzYWwgaW1wbGVtZW50YXRpb24gYWZ0ZXIgcmVmYWN0b3JpbmcgcHJvamVjdGlvbnNcclxuXHJcblx0Z2V0Wm9vbVNjYWxlOiBmdW5jdGlvbiAodG9ab29tKSB7XHJcblx0XHR2YXIgY3JzID0gdGhpcy5vcHRpb25zLmNycztcclxuXHRcdHJldHVybiBjcnMuc2NhbGUodG9ab29tKSAvIGNycy5zY2FsZSh0aGlzLl96b29tKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTY2FsZVpvb206IGZ1bmN0aW9uIChzY2FsZSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvb20gKyAoTWF0aC5sb2coc2NhbGUpIC8gTWF0aC5MTjIpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBjb252ZXJzaW9uIG1ldGhvZHNcclxuXHJcblx0cHJvamVjdDogZnVuY3Rpb24gKGxhdGxuZywgem9vbSkgeyAvLyAoTGF0TG5nWywgTnVtYmVyXSkgLT4gUG9pbnRcclxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLl96b29tIDogem9vbTtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuY3JzLmxhdExuZ1RvUG9pbnQoTC5sYXRMbmcobGF0bG5nKSwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0dW5wcm9qZWN0OiBmdW5jdGlvbiAocG9pbnQsIHpvb20pIHsgLy8gKFBvaW50WywgTnVtYmVyXSkgLT4gTGF0TG5nXHJcblx0XHR6b29tID0gem9vbSA9PT0gdW5kZWZpbmVkID8gdGhpcy5fem9vbSA6IHpvb207XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmNycy5wb2ludFRvTGF0TG5nKEwucG9pbnQocG9pbnQpLCB6b29tKTtcclxuXHR9LFxyXG5cclxuXHRsYXllclBvaW50VG9MYXRMbmc6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQpXHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSBMLnBvaW50KHBvaW50KS5hZGQodGhpcy5nZXRQaXhlbE9yaWdpbigpKTtcclxuXHRcdHJldHVybiB0aGlzLnVucHJvamVjdChwcm9qZWN0ZWRQb2ludCk7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nVG9MYXllclBvaW50OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpXHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSB0aGlzLnByb2plY3QoTC5sYXRMbmcobGF0bG5nKSkuX3JvdW5kKCk7XHJcblx0XHRyZXR1cm4gcHJvamVjdGVkUG9pbnQuX3N1YnRyYWN0KHRoaXMuZ2V0UGl4ZWxPcmlnaW4oKSk7XHJcblx0fSxcclxuXHJcblx0Y29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQpXHJcblx0XHRyZXR1cm4gTC5wb2ludChwb2ludCkuc3VidHJhY3QodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHR9LFxyXG5cclxuXHRsYXllclBvaW50VG9Db250YWluZXJQb2ludDogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludClcclxuXHRcdHJldHVybiBMLnBvaW50KHBvaW50KS5hZGQodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHR9LFxyXG5cclxuXHRjb250YWluZXJQb2ludFRvTGF0TG5nOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHZhciBsYXllclBvaW50ID0gdGhpcy5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChMLnBvaW50KHBvaW50KSk7XHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCk7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nVG9Db250YWluZXJQb2ludDogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJQb2ludFRvQ29udGFpbmVyUG9pbnQodGhpcy5sYXRMbmdUb0xheWVyUG9pbnQoTC5sYXRMbmcobGF0bG5nKSkpO1xyXG5cdH0sXHJcblxyXG5cdG1vdXNlRXZlbnRUb0NvbnRhaW5lclBvaW50OiBmdW5jdGlvbiAoZSkgeyAvLyAoTW91c2VFdmVudClcclxuXHRcdHJldHVybiBMLkRvbUV2ZW50LmdldE1vdXNlUG9zaXRpb24oZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHR9LFxyXG5cclxuXHRtb3VzZUV2ZW50VG9MYXllclBvaW50OiBmdW5jdGlvbiAoZSkgeyAvLyAoTW91c2VFdmVudClcclxuXHRcdHJldHVybiB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KHRoaXMubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSkpO1xyXG5cdH0sXHJcblxyXG5cdG1vdXNlRXZlbnRUb0xhdExuZzogZnVuY3Rpb24gKGUpIHsgLy8gKE1vdXNlRXZlbnQpXHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9MYXRMbmcodGhpcy5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpKTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gbWFwIGluaXRpYWxpemF0aW9uIG1ldGhvZHNcclxuXHJcblx0X2luaXRDb250YWluZXI6IGZ1bmN0aW9uIChpZCkge1xyXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5nZXQoaWQpO1xyXG5cclxuXHRcdGlmICghY29udGFpbmVyKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignTWFwIGNvbnRhaW5lciBub3QgZm91bmQuJyk7XHJcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci5fbGVhZmxldCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ01hcCBjb250YWluZXIgaXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHRjb250YWluZXIuX2xlYWZsZXQgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0TGF5b3V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsZWFmbGV0LWNvbnRhaW5lcicgK1xyXG5cdFx0XHQoTC5Ccm93c2VyLnRvdWNoID8gJyBsZWFmbGV0LXRvdWNoJyA6ICcnKSArXHJcblx0XHRcdChMLkJyb3dzZXIucmV0aW5hID8gJyBsZWFmbGV0LXJldGluYScgOiAnJykgK1xyXG5cdFx0XHQoTC5Ccm93c2VyLmllbHQ5ID8gJyBsZWFmbGV0LW9sZGllJyA6ICcnKSArXHJcblx0XHRcdCh0aGlzLm9wdGlvbnMuZmFkZUFuaW1hdGlvbiA/ICcgbGVhZmxldC1mYWRlLWFuaW0nIDogJycpKTtcclxuXHJcblx0XHR2YXIgcG9zaXRpb24gPSBMLkRvbVV0aWwuZ2V0U3R5bGUoY29udGFpbmVyLCAncG9zaXRpb24nKTtcclxuXHJcblx0XHRpZiAocG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgcG9zaXRpb24gIT09ICdyZWxhdGl2ZScgJiYgcG9zaXRpb24gIT09ICdmaXhlZCcpIHtcclxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbml0UGFuZXMoKTtcclxuXHJcblx0XHRpZiAodGhpcy5faW5pdENvbnRyb2xQb3MpIHtcclxuXHRcdFx0dGhpcy5faW5pdENvbnRyb2xQb3MoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfaW5pdFBhbmVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcGFuZXMgPSB0aGlzLl9wYW5lcyA9IHt9O1xyXG5cclxuXHRcdHRoaXMuX21hcFBhbmUgPSBwYW5lcy5tYXBQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1tYXAtcGFuZScsIHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0dGhpcy5fdGlsZVBhbmUgPSBwYW5lcy50aWxlUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtdGlsZS1wYW5lJywgdGhpcy5fbWFwUGFuZSk7XHJcblx0XHRwYW5lcy5vYmplY3RzUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtb2JqZWN0cy1wYW5lJywgdGhpcy5fbWFwUGFuZSk7XHJcblx0XHRwYW5lcy5zaGFkb3dQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1zaGFkb3ctcGFuZScpO1xyXG5cdFx0cGFuZXMub3ZlcmxheVBhbmUgPSB0aGlzLl9jcmVhdGVQYW5lKCdsZWFmbGV0LW92ZXJsYXktcGFuZScpO1xyXG5cdFx0cGFuZXMubWFya2VyUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtbWFya2VyLXBhbmUnKTtcclxuXHRcdHBhbmVzLnBvcHVwUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtcG9wdXAtcGFuZScpO1xyXG5cclxuXHRcdHZhciB6b29tSGlkZSA9ICcgbGVhZmxldC16b29tLWhpZGUnO1xyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLm1hcmtlclBhbmUsIHpvb21IaWRlKTtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLnNoYWRvd1BhbmUsIHpvb21IaWRlKTtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLnBvcHVwUGFuZSwgem9vbUhpZGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVQYW5lOiBmdW5jdGlvbiAoY2xhc3NOYW1lLCBjb250YWluZXIpIHtcclxuXHRcdHJldHVybiBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIGNvbnRhaW5lciB8fCB0aGlzLl9wYW5lcy5vYmplY3RzUGFuZSk7XHJcblx0fSxcclxuXHJcblx0X2NsZWFyUGFuZXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9tYXBQYW5lKTtcclxuXHR9LFxyXG5cclxuXHRfYWRkTGF5ZXJzOiBmdW5jdGlvbiAobGF5ZXJzKSB7XHJcblx0XHRsYXllcnMgPSBsYXllcnMgPyAoTC5VdGlsLmlzQXJyYXkobGF5ZXJzKSA/IGxheWVycyA6IFtsYXllcnNdKSA6IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dGhpcy5hZGRMYXllcihsYXllcnNbaV0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBwcml2YXRlIG1ldGhvZHMgdGhhdCBtb2RpZnkgbWFwIHN0YXRlXHJcblxyXG5cdF9yZXNldFZpZXc6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIHByZXNlcnZlTWFwT2Zmc2V0LCBhZnRlclpvb21BbmltKSB7XHJcblxyXG5cdFx0dmFyIHpvb21DaGFuZ2VkID0gKHRoaXMuX3pvb20gIT09IHpvb20pO1xyXG5cclxuXHRcdGlmICghYWZ0ZXJab29tQW5pbSkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdmVzdGFydCcpO1xyXG5cclxuXHRcdFx0aWYgKHpvb21DaGFuZ2VkKSB7XHJcblx0XHRcdFx0dGhpcy5maXJlKCd6b29tc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3pvb20gPSB6b29tO1xyXG5cdFx0dGhpcy5faW5pdGlhbENlbnRlciA9IGNlbnRlcjtcclxuXHJcblx0XHR0aGlzLl9pbml0aWFsVG9wTGVmdFBvaW50ID0gdGhpcy5fZ2V0TmV3VG9wTGVmdFBvaW50KGNlbnRlcik7XHJcblxyXG5cdFx0aWYgKCFwcmVzZXJ2ZU1hcE9mZnNldCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fbWFwUGFuZSwgbmV3IEwuUG9pbnQoMCwgMCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5faW5pdGlhbFRvcExlZnRQb2ludC5fYWRkKHRoaXMuX2dldE1hcFBhbmVQb3MoKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdGlsZUxheWVyc1RvTG9hZCA9IHRoaXMuX3RpbGVMYXllcnNOdW07XHJcblxyXG5cdFx0dmFyIGxvYWRpbmcgPSAhdGhpcy5fbG9hZGVkO1xyXG5cdFx0dGhpcy5fbG9hZGVkID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ3ZpZXdyZXNldCcsIHtoYXJkOiAhcHJlc2VydmVNYXBPZmZzZXR9KTtcclxuXHJcblx0XHRpZiAobG9hZGluZykge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xvYWQnKTtcclxuXHRcdFx0dGhpcy5lYWNoTGF5ZXIodGhpcy5fbGF5ZXJBZGQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbW92ZScpO1xyXG5cclxuXHRcdGlmICh6b29tQ2hhbmdlZCB8fCBhZnRlclpvb21BbmltKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnem9vbWVuZCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbW92ZWVuZCcsIHtoYXJkOiAhcHJlc2VydmVNYXBPZmZzZXR9KTtcclxuXHR9LFxyXG5cclxuXHRfcmF3UGFuQnk6IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lLCB0aGlzLl9nZXRNYXBQYW5lUG9zKCkuc3VidHJhY3Qob2Zmc2V0KSk7XHJcblx0fSxcclxuXHJcblx0X2dldFpvb21TcGFuOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRNYXhab29tKCkgLSB0aGlzLmdldE1pblpvb20oKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlWm9vbUxldmVsczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdG1pblpvb20gPSBJbmZpbml0eSxcclxuXHRcdFx0bWF4Wm9vbSA9IC1JbmZpbml0eSxcclxuXHRcdFx0b2xkWm9vbVNwYW4gPSB0aGlzLl9nZXRab29tU3BhbigpO1xyXG5cclxuXHRcdGZvciAoaSBpbiB0aGlzLl96b29tQm91bmRMYXllcnMpIHtcclxuXHRcdFx0dmFyIGxheWVyID0gdGhpcy5fem9vbUJvdW5kTGF5ZXJzW2ldO1xyXG5cdFx0XHRpZiAoIWlzTmFOKGxheWVyLm9wdGlvbnMubWluWm9vbSkpIHtcclxuXHRcdFx0XHRtaW5ab29tID0gTWF0aC5taW4obWluWm9vbSwgbGF5ZXIub3B0aW9ucy5taW5ab29tKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWlzTmFOKGxheWVyLm9wdGlvbnMubWF4Wm9vbSkpIHtcclxuXHRcdFx0XHRtYXhab29tID0gTWF0aC5tYXgobWF4Wm9vbSwgbGF5ZXIub3B0aW9ucy5tYXhab29tKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChpID09PSB1bmRlZmluZWQpIHsgLy8gd2UgaGF2ZSBubyB0aWxlbGF5ZXJzXHJcblx0XHRcdHRoaXMuX2xheWVyc01heFpvb20gPSB0aGlzLl9sYXllcnNNaW5ab29tID0gdW5kZWZpbmVkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fbGF5ZXJzTWF4Wm9vbSA9IG1heFpvb207XHJcblx0XHRcdHRoaXMuX2xheWVyc01pblpvb20gPSBtaW5ab29tO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvbGRab29tU3BhbiAhPT0gdGhpcy5fZ2V0Wm9vbVNwYW4oKSkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ3pvb21sZXZlbHNjaGFuZ2UnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcGFuSW5zaWRlTWF4Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLnBhbkluc2lkZUJvdW5kcyh0aGlzLm9wdGlvbnMubWF4Qm91bmRzKTtcclxuXHR9LFxyXG5cclxuXHRfY2hlY2tJZkxvYWRlZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdTZXQgbWFwIGNlbnRlciBhbmQgem9vbSBmaXJzdC4nKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBtYXAgZXZlbnRzXHJcblxyXG5cdF9pbml0RXZlbnRzOiBmdW5jdGlvbiAob25PZmYpIHtcclxuXHRcdGlmICghTC5Eb21FdmVudCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRvbk9mZiA9IG9uT2ZmIHx8ICdvbic7XHJcblxyXG5cdFx0TC5Eb21FdmVudFtvbk9mZl0odGhpcy5fY29udGFpbmVyLCAnY2xpY2snLCB0aGlzLl9vbk1vdXNlQ2xpY2ssIHRoaXMpO1xyXG5cclxuXHRcdHZhciBldmVudHMgPSBbJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlZW50ZXInLFxyXG5cdFx0ICAgICAgICAgICAgICAnbW91c2VsZWF2ZScsICdtb3VzZW1vdmUnLCAnY29udGV4dG1lbnUnXSxcclxuXHRcdCAgICBpLCBsZW47XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRbb25PZmZdKHRoaXMuX2NvbnRhaW5lciwgZXZlbnRzW2ldLCB0aGlzLl9maXJlTW91c2VFdmVudCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy50cmFja1Jlc2l6ZSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50W29uT2ZmXSh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX3Jlc2l6ZVJlcXVlc3QpO1xyXG5cdFx0dGhpcy5fcmVzaXplUmVxdWVzdCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKFxyXG5cdFx0ICAgICAgICBmdW5jdGlvbiAoKSB7IHRoaXMuaW52YWxpZGF0ZVNpemUoe2RlYm91bmNlTW92ZWVuZDogdHJ1ZX0pOyB9LCB0aGlzLCBmYWxzZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHR9LFxyXG5cclxuXHRfb25Nb3VzZUNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQgfHwgKCFlLl9zaW11bGF0ZWQgJiZcclxuXHRcdCAgICAgICAgKCh0aGlzLmRyYWdnaW5nICYmIHRoaXMuZHJhZ2dpbmcubW92ZWQoKSkgfHxcclxuXHRcdCAgICAgICAgICh0aGlzLmJveFpvb20gICYmIHRoaXMuYm94Wm9vbS5tb3ZlZCgpKSkpIHx8XHJcblx0XHQgICAgICAgICAgICBMLkRvbUV2ZW50Ll9za2lwcGVkKGUpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuZmlyZSgncHJlY2xpY2snKTtcclxuXHRcdHRoaXMuX2ZpcmVNb3VzZUV2ZW50KGUpO1xyXG5cdH0sXHJcblxyXG5cdF9maXJlTW91c2VFdmVudDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmICghdGhpcy5fbG9hZGVkIHx8IEwuRG9tRXZlbnQuX3NraXBwZWQoZSkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIHR5cGUgPSBlLnR5cGU7XHJcblxyXG5cdFx0dHlwZSA9ICh0eXBlID09PSAnbW91c2VlbnRlcicgPyAnbW91c2VvdmVyJyA6ICh0eXBlID09PSAnbW91c2VsZWF2ZScgPyAnbW91c2VvdXQnIDogdHlwZSkpO1xyXG5cclxuXHRcdGlmICghdGhpcy5oYXNFdmVudExpc3RlbmVycyh0eXBlKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ2NvbnRleHRtZW51Jykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjb250YWluZXJQb2ludCA9IHRoaXMubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSksXHJcblx0XHQgICAgbGF5ZXJQb2ludCA9IHRoaXMuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoY29udGFpbmVyUG9pbnQpLFxyXG5cdFx0ICAgIGxhdGxuZyA9IHRoaXMubGF5ZXJQb2ludFRvTGF0TG5nKGxheWVyUG9pbnQpO1xyXG5cclxuXHRcdHRoaXMuZmlyZSh0eXBlLCB7XHJcblx0XHRcdGxhdGxuZzogbGF0bG5nLFxyXG5cdFx0XHRsYXllclBvaW50OiBsYXllclBvaW50LFxyXG5cdFx0XHRjb250YWluZXJQb2ludDogY29udGFpbmVyUG9pbnQsXHJcblx0XHRcdG9yaWdpbmFsRXZlbnQ6IGVcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdF9vblRpbGVMYXllckxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQtLTtcclxuXHRcdGlmICh0aGlzLl90aWxlTGF5ZXJzTnVtICYmICF0aGlzLl90aWxlTGF5ZXJzVG9Mb2FkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgndGlsZWxheWVyc2xvYWQnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfY2xlYXJIYW5kbGVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX2hhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHRoaXMuX2hhbmRsZXJzW2ldLmRpc2FibGUoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHR3aGVuUmVhZHk6IGZ1bmN0aW9uIChjYWxsYmFjaywgY29udGV4dCkge1xyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHRjYWxsYmFjay5jYWxsKGNvbnRleHQgfHwgdGhpcywgdGhpcyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLm9uKCdsb2FkJywgY2FsbGJhY2ssIGNvbnRleHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X2xheWVyQWRkOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdGxheWVyLm9uQWRkKHRoaXMpO1xyXG5cdFx0dGhpcy5maXJlKCdsYXllcmFkZCcsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gcHJpdmF0ZSBtZXRob2RzIGZvciBnZXR0aW5nIG1hcCBzdGF0ZVxyXG5cclxuXHRfZ2V0TWFwUGFuZVBvczogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lKTtcclxuXHR9LFxyXG5cclxuXHRfbW92ZWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwb3MgPSB0aGlzLl9nZXRNYXBQYW5lUG9zKCk7XHJcblx0XHRyZXR1cm4gcG9zICYmICFwb3MuZXF1YWxzKFswLCAwXSk7XHJcblx0fSxcclxuXHJcblx0X2dldFRvcExlZnRQb2ludDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0UGl4ZWxPcmlnaW4oKS5zdWJ0cmFjdCh0aGlzLl9nZXRNYXBQYW5lUG9zKCkpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXROZXdUb3BMZWZ0UG9pbnQ6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20pIHtcclxuXHRcdHZhciB2aWV3SGFsZiA9IHRoaXMuZ2V0U2l6ZSgpLl9kaXZpZGVCeSgyKTtcclxuXHRcdC8vIFRPRE8gcm91bmQgb24gZGlzcGxheSwgbm90IGNhbGN1bGF0aW9uIHRvIGluY3JlYXNlIHByZWNpc2lvbj9cclxuXHRcdHJldHVybiB0aGlzLnByb2plY3QoY2VudGVyLCB6b29tKS5fc3VidHJhY3Qodmlld0hhbGYpLl9yb3VuZCgpO1xyXG5cdH0sXHJcblxyXG5cdF9sYXRMbmdUb05ld0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChsYXRsbmcsIG5ld1pvb20sIG5ld0NlbnRlcikge1xyXG5cdFx0dmFyIHRvcExlZnQgPSB0aGlzLl9nZXROZXdUb3BMZWZ0UG9pbnQobmV3Q2VudGVyLCBuZXdab29tKS5hZGQodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHRcdHJldHVybiB0aGlzLnByb2plY3QobGF0bG5nLCBuZXdab29tKS5fc3VidHJhY3QodG9wTGVmdCk7XHJcblx0fSxcclxuXHJcblx0Ly8gbGF5ZXIgcG9pbnQgb2YgdGhlIGN1cnJlbnQgY2VudGVyXHJcblx0X2dldENlbnRlckxheWVyUG9pbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KHRoaXMuZ2V0U2l6ZSgpLl9kaXZpZGVCeSgyKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gb2Zmc2V0IG9mIHRoZSBzcGVjaWZpZWQgcGxhY2UgdG8gdGhlIGN1cnJlbnQgY2VudGVyIGluIHBpeGVsc1xyXG5cdF9nZXRDZW50ZXJPZmZzZXQ6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHJldHVybiB0aGlzLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpLnN1YnRyYWN0KHRoaXMuX2dldENlbnRlckxheWVyUG9pbnQoKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gYWRqdXN0IGNlbnRlciBmb3IgdmlldyB0byBnZXQgaW5zaWRlIGJvdW5kc1xyXG5cdF9saW1pdENlbnRlcjogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgYm91bmRzKSB7XHJcblxyXG5cdFx0aWYgKCFib3VuZHMpIHsgcmV0dXJuIGNlbnRlcjsgfVxyXG5cclxuXHRcdHZhciBjZW50ZXJQb2ludCA9IHRoaXMucHJvamVjdChjZW50ZXIsIHpvb20pLFxyXG5cdFx0ICAgIHZpZXdIYWxmID0gdGhpcy5nZXRTaXplKCkuZGl2aWRlQnkoMiksXHJcblx0XHQgICAgdmlld0JvdW5kcyA9IG5ldyBMLkJvdW5kcyhjZW50ZXJQb2ludC5zdWJ0cmFjdCh2aWV3SGFsZiksIGNlbnRlclBvaW50LmFkZCh2aWV3SGFsZikpLFxyXG5cdFx0ICAgIG9mZnNldCA9IHRoaXMuX2dldEJvdW5kc09mZnNldCh2aWV3Qm91bmRzLCBib3VuZHMsIHpvb20pO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnVucHJvamVjdChjZW50ZXJQb2ludC5hZGQob2Zmc2V0KSwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0Ly8gYWRqdXN0IG9mZnNldCBmb3IgdmlldyB0byBnZXQgaW5zaWRlIGJvdW5kc1xyXG5cdF9saW1pdE9mZnNldDogZnVuY3Rpb24gKG9mZnNldCwgYm91bmRzKSB7XHJcblx0XHRpZiAoIWJvdW5kcykgeyByZXR1cm4gb2Zmc2V0OyB9XHJcblxyXG5cdFx0dmFyIHZpZXdCb3VuZHMgPSB0aGlzLmdldFBpeGVsQm91bmRzKCksXHJcblx0XHQgICAgbmV3Qm91bmRzID0gbmV3IEwuQm91bmRzKHZpZXdCb3VuZHMubWluLmFkZChvZmZzZXQpLCB2aWV3Qm91bmRzLm1heC5hZGQob2Zmc2V0KSk7XHJcblxyXG5cdFx0cmV0dXJuIG9mZnNldC5hZGQodGhpcy5fZ2V0Qm91bmRzT2Zmc2V0KG5ld0JvdW5kcywgYm91bmRzKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gcmV0dXJucyBvZmZzZXQgbmVlZGVkIGZvciBweEJvdW5kcyB0byBnZXQgaW5zaWRlIG1heEJvdW5kcyBhdCBhIHNwZWNpZmllZCB6b29tXHJcblx0X2dldEJvdW5kc09mZnNldDogZnVuY3Rpb24gKHB4Qm91bmRzLCBtYXhCb3VuZHMsIHpvb20pIHtcclxuXHRcdHZhciBud09mZnNldCA9IHRoaXMucHJvamVjdChtYXhCb3VuZHMuZ2V0Tm9ydGhXZXN0KCksIHpvb20pLnN1YnRyYWN0KHB4Qm91bmRzLm1pbiksXHJcblx0XHQgICAgc2VPZmZzZXQgPSB0aGlzLnByb2plY3QobWF4Qm91bmRzLmdldFNvdXRoRWFzdCgpLCB6b29tKS5zdWJ0cmFjdChweEJvdW5kcy5tYXgpLFxyXG5cclxuXHRcdCAgICBkeCA9IHRoaXMuX3JlYm91bmQobndPZmZzZXQueCwgLXNlT2Zmc2V0LngpLFxyXG5cdFx0ICAgIGR5ID0gdGhpcy5fcmVib3VuZChud09mZnNldC55LCAtc2VPZmZzZXQueSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KGR4LCBkeSk7XHJcblx0fSxcclxuXHJcblx0X3JlYm91bmQ6IGZ1bmN0aW9uIChsZWZ0LCByaWdodCkge1xyXG5cdFx0cmV0dXJuIGxlZnQgKyByaWdodCA+IDAgP1xyXG5cdFx0XHRNYXRoLnJvdW5kKGxlZnQgLSByaWdodCkgLyAyIDpcclxuXHRcdFx0TWF0aC5tYXgoMCwgTWF0aC5jZWlsKGxlZnQpKSAtIE1hdGgubWF4KDAsIE1hdGguZmxvb3IocmlnaHQpKTtcclxuXHR9LFxyXG5cclxuXHRfbGltaXRab29tOiBmdW5jdGlvbiAoem9vbSkge1xyXG5cdFx0dmFyIG1pbiA9IHRoaXMuZ2V0TWluWm9vbSgpLFxyXG5cdFx0ICAgIG1heCA9IHRoaXMuZ2V0TWF4Wm9vbSgpO1xyXG5cclxuXHRcdHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgem9vbSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLm1hcCA9IGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5NYXAoaWQsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTWVyY2F0b3IgcHJvamVjdGlvbiB0aGF0IHRha2VzIGludG8gYWNjb3VudCB0aGF0IHRoZSBFYXJ0aCBpcyBub3QgYSBwZXJmZWN0IHNwaGVyZS5cclxuICogTGVzcyBwb3B1bGFyIHRoYW4gc3BoZXJpY2FsIG1lcmNhdG9yOyB1c2VkIGJ5IHByb2plY3Rpb25zIGxpa2UgRVBTRzozMzk1LlxyXG4gKi9cclxuXHJcbkwuUHJvamVjdGlvbi5NZXJjYXRvciA9IHtcclxuXHRNQVhfTEFUSVRVREU6IDg1LjA4NDA1OTE1NTYsXHJcblxyXG5cdFJfTUlOT1I6IDYzNTY3NTIuMzE0MjQ1MTc5LFxyXG5cdFJfTUFKT1I6IDYzNzgxMzcsXHJcblxyXG5cdHByb2plY3Q6IGZ1bmN0aW9uIChsYXRsbmcpIHsgLy8gKExhdExuZykgLT4gUG9pbnRcclxuXHRcdHZhciBkID0gTC5MYXRMbmcuREVHX1RPX1JBRCxcclxuXHRcdCAgICBtYXggPSB0aGlzLk1BWF9MQVRJVFVERSxcclxuXHRcdCAgICBsYXQgPSBNYXRoLm1heChNYXRoLm1pbihtYXgsIGxhdGxuZy5sYXQpLCAtbWF4KSxcclxuXHRcdCAgICByID0gdGhpcy5SX01BSk9SLFxyXG5cdFx0ICAgIHIyID0gdGhpcy5SX01JTk9SLFxyXG5cdFx0ICAgIHggPSBsYXRsbmcubG5nICogZCAqIHIsXHJcblx0XHQgICAgeSA9IGxhdCAqIGQsXHJcblx0XHQgICAgdG1wID0gcjIgLyByLFxyXG5cdFx0ICAgIGVjY2VudCA9IE1hdGguc3FydCgxLjAgLSB0bXAgKiB0bXApLFxyXG5cdFx0ICAgIGNvbiA9IGVjY2VudCAqIE1hdGguc2luKHkpO1xyXG5cclxuXHRcdGNvbiA9IE1hdGgucG93KCgxIC0gY29uKSAvICgxICsgY29uKSwgZWNjZW50ICogMC41KTtcclxuXHJcblx0XHR2YXIgdHMgPSBNYXRoLnRhbigwLjUgKiAoKE1hdGguUEkgKiAwLjUpIC0geSkpIC8gY29uO1xyXG5cdFx0eSA9IC1yICogTWF0aC5sb2codHMpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5KTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQsIEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dmFyIGQgPSBMLkxhdExuZy5SQURfVE9fREVHLFxyXG5cdFx0ICAgIHIgPSB0aGlzLlJfTUFKT1IsXHJcblx0XHQgICAgcjIgPSB0aGlzLlJfTUlOT1IsXHJcblx0XHQgICAgbG5nID0gcG9pbnQueCAqIGQgLyByLFxyXG5cdFx0ICAgIHRtcCA9IHIyIC8gcixcclxuXHRcdCAgICBlY2NlbnQgPSBNYXRoLnNxcnQoMSAtICh0bXAgKiB0bXApKSxcclxuXHRcdCAgICB0cyA9IE1hdGguZXhwKC0gcG9pbnQueSAvIHIpLFxyXG5cdFx0ICAgIHBoaSA9IChNYXRoLlBJIC8gMikgLSAyICogTWF0aC5hdGFuKHRzKSxcclxuXHRcdCAgICBudW1JdGVyID0gMTUsXHJcblx0XHQgICAgdG9sID0gMWUtNyxcclxuXHRcdCAgICBpID0gbnVtSXRlcixcclxuXHRcdCAgICBkcGhpID0gMC4xLFxyXG5cdFx0ICAgIGNvbjtcclxuXHJcblx0XHR3aGlsZSAoKE1hdGguYWJzKGRwaGkpID4gdG9sKSAmJiAoLS1pID4gMCkpIHtcclxuXHRcdFx0Y29uID0gZWNjZW50ICogTWF0aC5zaW4ocGhpKTtcclxuXHRcdFx0ZHBoaSA9IChNYXRoLlBJIC8gMikgLSAyICogTWF0aC5hdGFuKHRzICpcclxuXHRcdFx0ICAgICAgICAgICAgTWF0aC5wb3coKDEuMCAtIGNvbikgLyAoMS4wICsgY29uKSwgMC41ICogZWNjZW50KSkgLSBwaGk7XHJcblx0XHRcdHBoaSArPSBkcGhpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcocGhpICogZCwgbG5nKTtcclxuXHR9XHJcbn07XHJcblxuXG5cclxuTC5DUlMuRVBTRzMzOTUgPSBMLmV4dGVuZCh7fSwgTC5DUlMsIHtcclxuXHRjb2RlOiAnRVBTRzozMzk1JyxcclxuXHJcblx0cHJvamVjdGlvbjogTC5Qcm9qZWN0aW9uLk1lcmNhdG9yLFxyXG5cclxuXHR0cmFuc2Zvcm1hdGlvbjogKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBtID0gTC5Qcm9qZWN0aW9uLk1lcmNhdG9yLFxyXG5cdFx0ICAgIHIgPSBtLlJfTUFKT1IsXHJcblx0XHQgICAgc2NhbGUgPSAwLjUgLyAoTWF0aC5QSSAqIHIpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5UcmFuc2Zvcm1hdGlvbihzY2FsZSwgMC41LCAtc2NhbGUsIDAuNSk7XHJcblx0fSgpKVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuVGlsZUxheWVyIGlzIHVzZWQgZm9yIHN0YW5kYXJkIHh5ei1udW1iZXJlZCB0aWxlIGxheWVycy5cclxuICovXHJcblxyXG5MLlRpbGVMYXllciA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdG1pblpvb206IDAsXHJcblx0XHRtYXhab29tOiAxOCxcclxuXHRcdHRpbGVTaXplOiAyNTYsXHJcblx0XHRzdWJkb21haW5zOiAnYWJjJyxcclxuXHRcdGVycm9yVGlsZVVybDogJycsXHJcblx0XHRhdHRyaWJ1dGlvbjogJycsXHJcblx0XHR6b29tT2Zmc2V0OiAwLFxyXG5cdFx0b3BhY2l0eTogMSxcclxuXHRcdC8qXHJcblx0XHRtYXhOYXRpdmVab29tOiBudWxsLFxyXG5cdFx0ekluZGV4OiBudWxsLFxyXG5cdFx0dG1zOiBmYWxzZSxcclxuXHRcdGNvbnRpbnVvdXNXb3JsZDogZmFsc2UsXHJcblx0XHRub1dyYXA6IGZhbHNlLFxyXG5cdFx0em9vbVJldmVyc2U6IGZhbHNlLFxyXG5cdFx0ZGV0ZWN0UmV0aW5hOiBmYWxzZSxcclxuXHRcdHJldXNlVGlsZXM6IGZhbHNlLFxyXG5cdFx0Ym91bmRzOiBmYWxzZSxcclxuXHRcdCovXHJcblx0XHR1bmxvYWRJbnZpc2libGVUaWxlczogTC5Ccm93c2VyLm1vYmlsZSxcclxuXHRcdHVwZGF0ZVdoZW5JZGxlOiBMLkJyb3dzZXIubW9iaWxlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG5cdFx0b3B0aW9ucyA9IEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHQvLyBkZXRlY3RpbmcgcmV0aW5hIGRpc3BsYXlzLCBhZGp1c3RpbmcgdGlsZVNpemUgYW5kIHpvb20gbGV2ZWxzXHJcblx0XHRpZiAob3B0aW9ucy5kZXRlY3RSZXRpbmEgJiYgTC5Ccm93c2VyLnJldGluYSAmJiBvcHRpb25zLm1heFpvb20gPiAwKSB7XHJcblxyXG5cdFx0XHRvcHRpb25zLnRpbGVTaXplID0gTWF0aC5mbG9vcihvcHRpb25zLnRpbGVTaXplIC8gMik7XHJcblx0XHRcdG9wdGlvbnMuem9vbU9mZnNldCsrO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMubWluWm9vbSA+IDApIHtcclxuXHRcdFx0XHRvcHRpb25zLm1pblpvb20tLTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLm9wdGlvbnMubWF4Wm9vbS0tO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvcHRpb25zLmJvdW5kcykge1xyXG5cdFx0XHRvcHRpb25zLmJvdW5kcyA9IEwubGF0TG5nQm91bmRzKG9wdGlvbnMuYm91bmRzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblxyXG5cdFx0dmFyIHN1YmRvbWFpbnMgPSB0aGlzLm9wdGlvbnMuc3ViZG9tYWlucztcclxuXHJcblx0XHRpZiAodHlwZW9mIHN1YmRvbWFpbnMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHRoaXMub3B0aW9ucy5zdWJkb21haW5zID0gc3ViZG9tYWlucy5zcGxpdCgnJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHRcdHRoaXMuX2FuaW1hdGVkID0gbWFwLl96b29tQW5pbWF0ZWQ7XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGEgY29udGFpbmVyIGRpdiBmb3IgdGlsZXNcclxuXHRcdHRoaXMuX2luaXRDb250YWluZXIoKTtcclxuXHJcblx0XHQvLyBzZXQgdXAgZXZlbnRzXHJcblx0XHRtYXAub24oe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5fcmVzZXQsXHJcblx0XHRcdCdtb3ZlZW5kJzogdGhpcy5fdXBkYXRlXHJcblx0XHR9LCB0aGlzKTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0bWFwLm9uKHtcclxuXHRcdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlWm9vbSxcclxuXHRcdFx0XHQnem9vbWVuZCc6IHRoaXMuX2VuZFpvb21BbmltXHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlKSB7XHJcblx0XHRcdHRoaXMuX2xpbWl0ZWRVcGRhdGUgPSBMLlV0aWwubGltaXRFeGVjQnlJbnRlcnZhbCh0aGlzLl91cGRhdGUsIDE1MCwgdGhpcyk7XHJcblx0XHRcdG1hcC5vbignbW92ZScsIHRoaXMuX2xpbWl0ZWRVcGRhdGUsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3Jlc2V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0bWFwLm9mZih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLl9yZXNldCxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVcclxuXHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRtYXAub2ZmKHtcclxuXHRcdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlWm9vbSxcclxuXHRcdFx0XHQnem9vbWVuZCc6IHRoaXMuX2VuZFpvb21BbmltXHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlKSB7XHJcblx0XHRcdG1hcC5vZmYoJ21vdmUnLCB0aGlzLl9saW1pdGVkVXBkYXRlLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHRcdFx0dGhpcy5fc2V0QXV0b1pJbmRleChwYW5lLCBNYXRoLm1heCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0JhY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHBhbmUuaW5zZXJ0QmVmb3JlKHRoaXMuX2NvbnRhaW5lciwgcGFuZS5maXJzdENoaWxkKTtcclxuXHRcdFx0dGhpcy5fc2V0QXV0b1pJbmRleChwYW5lLCBNYXRoLm1pbik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0QXR0cmlidXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuYXR0cmlidXRpb247XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cdHNldE9wYWNpdHk6IGZ1bmN0aW9uIChvcGFjaXR5KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMub3BhY2l0eSA9IG9wYWNpdHk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0WkluZGV4OiBmdW5jdGlvbiAoekluZGV4KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMuekluZGV4ID0gekluZGV4O1xyXG5cdFx0dGhpcy5fdXBkYXRlWkluZGV4KCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0VXJsOiBmdW5jdGlvbiAodXJsLCBub1JlZHJhdykge1xyXG5cdFx0dGhpcy5fdXJsID0gdXJsO1xyXG5cclxuXHRcdGlmICghbm9SZWRyYXcpIHtcclxuXHRcdFx0dGhpcy5yZWRyYXcoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZWRyYXc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fcmVzZXQoe2hhcmQ6IHRydWV9KTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlWkluZGV4OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyICYmIHRoaXMub3B0aW9ucy56SW5kZXggIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUuekluZGV4ID0gdGhpcy5vcHRpb25zLnpJbmRleDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfc2V0QXV0b1pJbmRleDogZnVuY3Rpb24gKHBhbmUsIGNvbXBhcmUpIHtcclxuXHJcblx0XHR2YXIgbGF5ZXJzID0gcGFuZS5jaGlsZHJlbixcclxuXHRcdCAgICBlZGdlWkluZGV4ID0gLWNvbXBhcmUoSW5maW5pdHksIC1JbmZpbml0eSksIC8vIC1JbmZpbml0eSBmb3IgbWF4LCBJbmZpbml0eSBmb3IgbWluXHJcblx0XHQgICAgekluZGV4LCBpLCBsZW47XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblxyXG5cdFx0XHRpZiAobGF5ZXJzW2ldICE9PSB0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0XHR6SW5kZXggPSBwYXJzZUludChsYXllcnNbaV0uc3R5bGUuekluZGV4LCAxMCk7XHJcblxyXG5cdFx0XHRcdGlmICghaXNOYU4oekluZGV4KSkge1xyXG5cdFx0XHRcdFx0ZWRnZVpJbmRleCA9IGNvbXBhcmUoZWRnZVpJbmRleCwgekluZGV4KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuekluZGV4ID0gdGhpcy5fY29udGFpbmVyLnN0eWxlLnpJbmRleCA9XHJcblx0XHQgICAgICAgIChpc0Zpbml0ZShlZGdlWkluZGV4KSA/IGVkZ2VaSW5kZXggOiAwKSArIGNvbXBhcmUoMSwgLTEpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaSxcclxuXHRcdCAgICB0aWxlcyA9IHRoaXMuX3RpbGVzO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIuaWVsdDkpIHtcclxuXHRcdFx0Zm9yIChpIGluIHRpbGVzKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGlsZXNbaV0sIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2luaXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbGF5ZXInKTtcclxuXHJcblx0XHRcdHRoaXMuX3VwZGF0ZVpJbmRleCgpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2FuaW1hdGVkKSB7XHJcblx0XHRcdFx0dmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LXRpbGUtY29udGFpbmVyJztcclxuXHJcblx0XHRcdFx0dGhpcy5fYmdCdWZmZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIHRoaXMuX2NvbnRhaW5lcik7XHJcblx0XHRcdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGlsZVBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub3BhY2l0eSA8IDEpIHtcclxuXHRcdFx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcmVzZXQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0dGhpcy5maXJlKCd0aWxldW5sb2FkJywge3RpbGU6IHRoaXMuX3RpbGVzW2tleV19KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlcyA9IHt9O1xyXG5cdFx0dGhpcy5fdGlsZXNUb0xvYWQgPSAwO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHR0aGlzLl91bnVzZWRUaWxlcyA9IFtdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3RpbGVDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2FuaW1hdGVkICYmIGUgJiYgZS5oYXJkKSB7XHJcblx0XHRcdHRoaXMuX2NsZWFyQmdCdWZmZXIoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbml0Q29udGFpbmVyKCk7XHJcblx0fSxcclxuXHJcblx0X2dldFRpbGVTaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpICsgdGhpcy5vcHRpb25zLnpvb21PZmZzZXQsXHJcblx0XHQgICAgem9vbU4gPSB0aGlzLm9wdGlvbnMubWF4TmF0aXZlWm9vbSxcclxuXHRcdCAgICB0aWxlU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcclxuXHJcblx0XHRpZiAoem9vbU4gJiYgem9vbSA+IHpvb21OKSB7XHJcblx0XHRcdHRpbGVTaXplID0gTWF0aC5yb3VuZChtYXAuZ2V0Wm9vbVNjYWxlKHpvb20pIC8gbWFwLmdldFpvb21TY2FsZSh6b29tTikgKiB0aWxlU2l6ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRpbGVTaXplO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoIXRoaXMuX21hcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGJvdW5kcyA9IG1hcC5nZXRQaXhlbEJvdW5kcygpLFxyXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gdGhpcy5fZ2V0VGlsZVNpemUoKTtcclxuXHJcblx0XHRpZiAoem9vbSA+IHRoaXMub3B0aW9ucy5tYXhab29tIHx8IHpvb20gPCB0aGlzLm9wdGlvbnMubWluWm9vbSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHRpbGVCb3VuZHMgPSBMLmJvdW5kcyhcclxuXHRcdCAgICAgICAgYm91bmRzLm1pbi5kaXZpZGVCeSh0aWxlU2l6ZSkuX2Zsb29yKCksXHJcblx0XHQgICAgICAgIGJvdW5kcy5tYXguZGl2aWRlQnkodGlsZVNpemUpLl9mbG9vcigpKTtcclxuXHJcblx0XHR0aGlzLl9hZGRUaWxlc0Zyb21DZW50ZXJPdXQodGlsZUJvdW5kcyk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy51bmxvYWRJbnZpc2libGVUaWxlcyB8fCB0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHR0aGlzLl9yZW1vdmVPdGhlclRpbGVzKHRpbGVCb3VuZHMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9hZGRUaWxlc0Zyb21DZW50ZXJPdXQ6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdHZhciBxdWV1ZSA9IFtdLFxyXG5cdFx0ICAgIGNlbnRlciA9IGJvdW5kcy5nZXRDZW50ZXIoKTtcclxuXHJcblx0XHR2YXIgaiwgaSwgcG9pbnQ7XHJcblxyXG5cdFx0Zm9yIChqID0gYm91bmRzLm1pbi55OyBqIDw9IGJvdW5kcy5tYXgueTsgaisrKSB7XHJcblx0XHRcdGZvciAoaSA9IGJvdW5kcy5taW4ueDsgaSA8PSBib3VuZHMubWF4Lng7IGkrKykge1xyXG5cdFx0XHRcdHBvaW50ID0gbmV3IEwuUG9pbnQoaSwgaik7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLl90aWxlU2hvdWxkQmVMb2FkZWQocG9pbnQpKSB7XHJcblx0XHRcdFx0XHRxdWV1ZS5wdXNoKHBvaW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgdGlsZXNUb0xvYWQgPSBxdWV1ZS5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKHRpbGVzVG9Mb2FkID09PSAwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIGxvYWQgdGlsZXMgaW4gb3JkZXIgb2YgdGhlaXIgZGlzdGFuY2UgdG8gY2VudGVyXHJcblx0XHRxdWV1ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcblx0XHRcdHJldHVybiBhLmRpc3RhbmNlVG8oY2VudGVyKSAtIGIuZGlzdGFuY2VUbyhjZW50ZXIpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuXHRcdC8vIGlmIGl0cyB0aGUgZmlyc3QgYmF0Y2ggb2YgdGlsZXMgdG8gbG9hZFxyXG5cdFx0aWYgKCF0aGlzLl90aWxlc1RvTG9hZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xvYWRpbmcnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlc1RvTG9hZCArPSB0aWxlc1RvTG9hZDtcclxuXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgdGlsZXNUb0xvYWQ7IGkrKykge1xyXG5cdFx0XHR0aGlzLl9hZGRUaWxlKHF1ZXVlW2ldLCBmcmFnbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdGlsZUNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcblx0fSxcclxuXHJcblx0X3RpbGVTaG91bGRCZUxvYWRlZDogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cdFx0aWYgKCh0aWxlUG9pbnQueCArICc6JyArIHRpbGVQb2ludC55KSBpbiB0aGlzLl90aWxlcykge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGFscmVhZHkgbG9hZGVkXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKCFvcHRpb25zLmNvbnRpbnVvdXNXb3JsZCkge1xyXG5cdFx0XHR2YXIgbGltaXQgPSB0aGlzLl9nZXRXcmFwVGlsZU51bSgpO1xyXG5cclxuXHRcdFx0Ly8gZG9uJ3QgbG9hZCBpZiBleGNlZWRzIHdvcmxkIGJvdW5kc1xyXG5cdFx0XHRpZiAoKG9wdGlvbnMubm9XcmFwICYmICh0aWxlUG9pbnQueCA8IDAgfHwgdGlsZVBvaW50LnggPj0gbGltaXQueCkpIHx8XHJcblx0XHRcdFx0dGlsZVBvaW50LnkgPCAwIHx8IHRpbGVQb2ludC55ID49IGxpbWl0LnkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuYm91bmRzKSB7XHJcblx0XHRcdHZhciB0aWxlU2l6ZSA9IG9wdGlvbnMudGlsZVNpemUsXHJcblx0XHRcdCAgICBud1BvaW50ID0gdGlsZVBvaW50Lm11bHRpcGx5QnkodGlsZVNpemUpLFxyXG5cdFx0XHQgICAgc2VQb2ludCA9IG53UG9pbnQuYWRkKFt0aWxlU2l6ZSwgdGlsZVNpemVdKSxcclxuXHRcdFx0ICAgIG53ID0gdGhpcy5fbWFwLnVucHJvamVjdChud1BvaW50KSxcclxuXHRcdFx0ICAgIHNlID0gdGhpcy5fbWFwLnVucHJvamVjdChzZVBvaW50KTtcclxuXHJcblx0XHRcdC8vIFRPRE8gdGVtcG9yYXJ5IGhhY2ssIHdpbGwgYmUgcmVtb3ZlZCBhZnRlciByZWZhY3RvcmluZyBwcm9qZWN0aW9uc1xyXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2lzc3Vlcy8xNjE4XHJcblx0XHRcdGlmICghb3B0aW9ucy5jb250aW51b3VzV29ybGQgJiYgIW9wdGlvbnMubm9XcmFwKSB7XHJcblx0XHRcdFx0bncgPSBudy53cmFwKCk7XHJcblx0XHRcdFx0c2UgPSBzZS53cmFwKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb3B0aW9ucy5ib3VuZHMuaW50ZXJzZWN0cyhbbncsIHNlXSkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZU90aGVyVGlsZXM6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdHZhciBrQXJyLCB4LCB5LCBrZXk7XHJcblxyXG5cdFx0Zm9yIChrZXkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0a0FyciA9IGtleS5zcGxpdCgnOicpO1xyXG5cdFx0XHR4ID0gcGFyc2VJbnQoa0FyclswXSwgMTApO1xyXG5cdFx0XHR5ID0gcGFyc2VJbnQoa0FyclsxXSwgMTApO1xyXG5cclxuXHRcdFx0Ly8gcmVtb3ZlIHRpbGUgaWYgaXQncyBvdXQgb2YgYm91bmRzXHJcblx0XHRcdGlmICh4IDwgYm91bmRzLm1pbi54IHx8IHggPiBib3VuZHMubWF4LnggfHwgeSA8IGJvdW5kcy5taW4ueSB8fCB5ID4gYm91bmRzLm1heC55KSB7XHJcblx0XHRcdFx0dGhpcy5fcmVtb3ZlVGlsZShrZXkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZVRpbGU6IGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdHZhciB0aWxlID0gdGhpcy5fdGlsZXNba2V5XTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ3RpbGV1bmxvYWQnLCB7dGlsZTogdGlsZSwgdXJsOiB0aWxlLnNyY30pO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGlsZSwgJ2xlYWZsZXQtdGlsZS1sb2FkZWQnKTtcclxuXHRcdFx0dGhpcy5fdW51c2VkVGlsZXMucHVzaCh0aWxlKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHRpbGUucGFyZW50Tm9kZSA9PT0gdGhpcy5fdGlsZUNvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl90aWxlQ29udGFpbmVyLnJlbW92ZUNoaWxkKHRpbGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGZvciBodHRwczovL2dpdGh1Yi5jb20vQ2xvdWRNYWRlL0xlYWZsZXQvaXNzdWVzLzEzN1xyXG5cdFx0aWYgKCFMLkJyb3dzZXIuYW5kcm9pZCkge1xyXG5cdFx0XHR0aWxlLm9ubG9hZCA9IG51bGw7XHJcblx0XHRcdHRpbGUuc3JjID0gTC5VdGlsLmVtcHR5SW1hZ2VVcmw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVsZXRlIHRoaXMuX3RpbGVzW2tleV07XHJcblx0fSxcclxuXHJcblx0X2FkZFRpbGU6IGZ1bmN0aW9uICh0aWxlUG9pbnQsIGNvbnRhaW5lcikge1xyXG5cdFx0dmFyIHRpbGVQb3MgPSB0aGlzLl9nZXRUaWxlUG9zKHRpbGVQb2ludCk7XHJcblxyXG5cdFx0Ly8gZ2V0IHVudXNlZCB0aWxlIC0gb3IgY3JlYXRlIGEgbmV3IHRpbGVcclxuXHRcdHZhciB0aWxlID0gdGhpcy5fZ2V0VGlsZSgpO1xyXG5cclxuXHRcdC8qXHJcblx0XHRDaHJvbWUgMjAgbGF5b3V0cyBtdWNoIGZhc3RlciB3aXRoIHRvcC9sZWZ0ICh2ZXJpZnkgd2l0aCB0aW1lbGluZSwgZnJhbWVzKVxyXG5cdFx0QW5kcm9pZCA0IGJyb3dzZXIgaGFzIGRpc3BsYXkgaXNzdWVzIHdpdGggdG9wL2xlZnQgYW5kIHJlcXVpcmVzIHRyYW5zZm9ybSBpbnN0ZWFkXHJcblx0XHQob3RoZXIgYnJvd3NlcnMgZG9uJ3QgY3VycmVudGx5IGNhcmUpIC0gc2VlIGRlYnVnL2hhY2tzL2ppdHRlci5odG1sIGZvciBhbiBleGFtcGxlXHJcblx0XHQqL1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRpbGUsIHRpbGVQb3MsIEwuQnJvd3Nlci5jaHJvbWUpO1xyXG5cclxuXHRcdHRoaXMuX3RpbGVzW3RpbGVQb2ludC54ICsgJzonICsgdGlsZVBvaW50LnldID0gdGlsZTtcclxuXHJcblx0XHR0aGlzLl9sb2FkVGlsZSh0aWxlLCB0aWxlUG9pbnQpO1xyXG5cclxuXHRcdGlmICh0aWxlLnBhcmVudE5vZGUgIT09IHRoaXMuX3RpbGVDb250YWluZXIpIHtcclxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRpbGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRab29tRm9yVXJsOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcblx0XHQgICAgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuem9vbVJldmVyc2UpIHtcclxuXHRcdFx0em9vbSA9IG9wdGlvbnMubWF4Wm9vbSAtIHpvb207XHJcblx0XHR9XHJcblxyXG5cdFx0em9vbSArPSBvcHRpb25zLnpvb21PZmZzZXQ7XHJcblxyXG5cdFx0cmV0dXJuIG9wdGlvbnMubWF4TmF0aXZlWm9vbSA/IE1hdGgubWluKHpvb20sIG9wdGlvbnMubWF4TmF0aXZlWm9vbSkgOiB6b29tO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRUaWxlUG9zOiBmdW5jdGlvbiAodGlsZVBvaW50KSB7XHJcblx0XHR2YXIgb3JpZ2luID0gdGhpcy5fbWFwLmdldFBpeGVsT3JpZ2luKCksXHJcblx0XHQgICAgdGlsZVNpemUgPSB0aGlzLl9nZXRUaWxlU2l6ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aWxlUG9pbnQubXVsdGlwbHlCeSh0aWxlU2l6ZSkuc3VidHJhY3Qob3JpZ2luKTtcclxuXHR9LFxyXG5cclxuXHQvLyBpbWFnZS1zcGVjaWZpYyBjb2RlIChvdmVycmlkZSB0byBpbXBsZW1lbnQgZS5nLiBDYW52YXMgb3IgU1ZHIHRpbGUgbGF5ZXIpXHJcblxyXG5cdGdldFRpbGVVcmw6IGZ1bmN0aW9uICh0aWxlUG9pbnQpIHtcclxuXHRcdHJldHVybiBMLlV0aWwudGVtcGxhdGUodGhpcy5fdXJsLCBMLmV4dGVuZCh7XHJcblx0XHRcdHM6IHRoaXMuX2dldFN1YmRvbWFpbih0aWxlUG9pbnQpLFxyXG5cdFx0XHR6OiB0aWxlUG9pbnQueixcclxuXHRcdFx0eDogdGlsZVBvaW50LngsXHJcblx0XHRcdHk6IHRpbGVQb2ludC55XHJcblx0XHR9LCB0aGlzLm9wdGlvbnMpKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0V3JhcFRpbGVOdW06IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjcnMgPSB0aGlzLl9tYXAub3B0aW9ucy5jcnMsXHJcblx0XHQgICAgc2l6ZSA9IGNycy5nZXRTaXplKHRoaXMuX21hcC5nZXRab29tKCkpO1xyXG5cdFx0cmV0dXJuIHNpemUuZGl2aWRlQnkodGhpcy5fZ2V0VGlsZVNpemUoKSkuX2Zsb29yKCk7XHJcblx0fSxcclxuXHJcblx0X2FkanVzdFRpbGVQb2ludDogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cclxuXHRcdHZhciBsaW1pdCA9IHRoaXMuX2dldFdyYXBUaWxlTnVtKCk7XHJcblxyXG5cdFx0Ly8gd3JhcCB0aWxlIGNvb3JkaW5hdGVzXHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5jb250aW51b3VzV29ybGQgJiYgIXRoaXMub3B0aW9ucy5ub1dyYXApIHtcclxuXHRcdFx0dGlsZVBvaW50LnggPSAoKHRpbGVQb2ludC54ICUgbGltaXQueCkgKyBsaW1pdC54KSAlIGxpbWl0Lng7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy50bXMpIHtcclxuXHRcdFx0dGlsZVBvaW50LnkgPSBsaW1pdC55IC0gdGlsZVBvaW50LnkgLSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRpbGVQb2ludC56ID0gdGhpcy5fZ2V0Wm9vbUZvclVybCgpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRTdWJkb21haW46IGZ1bmN0aW9uICh0aWxlUG9pbnQpIHtcclxuXHRcdHZhciBpbmRleCA9IE1hdGguYWJzKHRpbGVQb2ludC54ICsgdGlsZVBvaW50LnkpICUgdGhpcy5vcHRpb25zLnN1YmRvbWFpbnMubGVuZ3RoO1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5zdWJkb21haW5zW2luZGV4XTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VGlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXVzZVRpbGVzICYmIHRoaXMuX3VudXNlZFRpbGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0dmFyIHRpbGUgPSB0aGlzLl91bnVzZWRUaWxlcy5wb3AoKTtcclxuXHRcdFx0dGhpcy5fcmVzZXRUaWxlKHRpbGUpO1xyXG5cdFx0XHRyZXR1cm4gdGlsZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVUaWxlKCk7XHJcblx0fSxcclxuXHJcblx0Ly8gT3ZlcnJpZGUgaWYgZGF0YSBzdG9yZWQgb24gYSB0aWxlIG5lZWRzIHRvIGJlIGNsZWFuZWQgdXAgYmVmb3JlIHJldXNlXHJcblx0X3Jlc2V0VGlsZTogZnVuY3Rpb24gKC8qdGlsZSovKSB7fSxcclxuXHJcblx0X2NyZWF0ZVRpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0aWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnaW1nJywgJ2xlYWZsZXQtdGlsZScpO1xyXG5cdFx0dGlsZS5zdHlsZS53aWR0aCA9IHRpbGUuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fZ2V0VGlsZVNpemUoKSArICdweCc7XHJcblx0XHR0aWxlLmdhbGxlcnlpbWcgPSAnbm8nO1xyXG5cclxuXHRcdHRpbGUub25zZWxlY3RzdGFydCA9IHRpbGUub25tb3VzZW1vdmUgPSBMLlV0aWwuZmFsc2VGbjtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLmllbHQ5ICYmIHRoaXMub3B0aW9ucy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGlsZSwgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0fVxyXG5cdFx0Ly8gd2l0aG91dCB0aGlzIGhhY2ssIHRpbGVzIGRpc2FwcGVhciBhZnRlciB6b29tIG9uIENocm9tZSBmb3IgQW5kcm9pZFxyXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9pc3N1ZXMvMjA3OFxyXG5cdFx0aWYgKEwuQnJvd3Nlci5tb2JpbGVXZWJraXQzZCkge1xyXG5cdFx0XHR0aWxlLnN0eWxlLldlYmtpdEJhY2tmYWNlVmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRpbGU7XHJcblx0fSxcclxuXHJcblx0X2xvYWRUaWxlOiBmdW5jdGlvbiAodGlsZSwgdGlsZVBvaW50KSB7XHJcblx0XHR0aWxlLl9sYXllciAgPSB0aGlzO1xyXG5cdFx0dGlsZS5vbmxvYWQgID0gdGhpcy5fdGlsZU9uTG9hZDtcclxuXHRcdHRpbGUub25lcnJvciA9IHRoaXMuX3RpbGVPbkVycm9yO1xyXG5cclxuXHRcdHRoaXMuX2FkanVzdFRpbGVQb2ludCh0aWxlUG9pbnQpO1xyXG5cdFx0dGlsZS5zcmMgICAgID0gdGhpcy5nZXRUaWxlVXJsKHRpbGVQb2ludCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKCd0aWxlbG9hZHN0YXJ0Jywge1xyXG5cdFx0XHR0aWxlOiB0aWxlLFxyXG5cdFx0XHR1cmw6IHRpbGUuc3JjXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHRfdGlsZUxvYWRlZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdGlsZXNUb0xvYWQtLTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpbGVDb250YWluZXIsICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX3RpbGVzVG9Mb2FkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2FuaW1hdGVkKSB7XHJcblx0XHRcdFx0Ly8gY2xlYXIgc2NhbGVkIHRpbGVzIGFmdGVyIGFsbCBuZXcgdGlsZXMgYXJlIGxvYWRlZCAoZm9yIHBlcmZvcm1hbmNlKVxyXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9jbGVhckJnQnVmZmVyVGltZXIpO1xyXG5cdFx0XHRcdHRoaXMuX2NsZWFyQmdCdWZmZXJUaW1lciA9IHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuX2NsZWFyQmdCdWZmZXIsIHRoaXMpLCA1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3RpbGVPbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsYXllciA9IHRoaXMuX2xheWVyO1xyXG5cclxuXHRcdC8vT25seSBpZiB3ZSBhcmUgbG9hZGluZyBhbiBhY3R1YWwgaW1hZ2VcclxuXHRcdGlmICh0aGlzLnNyYyAhPT0gTC5VdGlsLmVtcHR5SW1hZ2VVcmwpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMsICdsZWFmbGV0LXRpbGUtbG9hZGVkJyk7XHJcblxyXG5cdFx0XHRsYXllci5maXJlKCd0aWxlbG9hZCcsIHtcclxuXHRcdFx0XHR0aWxlOiB0aGlzLFxyXG5cdFx0XHRcdHVybDogdGhpcy5zcmNcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGF5ZXIuX3RpbGVMb2FkZWQoKTtcclxuXHR9LFxyXG5cclxuXHRfdGlsZU9uRXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsYXllciA9IHRoaXMuX2xheWVyO1xyXG5cclxuXHRcdGxheWVyLmZpcmUoJ3RpbGVlcnJvcicsIHtcclxuXHRcdFx0dGlsZTogdGhpcyxcclxuXHRcdFx0dXJsOiB0aGlzLnNyY1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIG5ld1VybCA9IGxheWVyLm9wdGlvbnMuZXJyb3JUaWxlVXJsO1xyXG5cdFx0aWYgKG5ld1VybCkge1xyXG5cdFx0XHR0aGlzLnNyYyA9IG5ld1VybDtcclxuXHRcdH1cclxuXHJcblx0XHRsYXllci5fdGlsZUxvYWRlZCgpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnRpbGVMYXllciA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyKHVybCwgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlRpbGVMYXllci5XTVMgaXMgdXNlZCBmb3IgcHV0dGluZyBXTVMgdGlsZSBsYXllcnMgb24gdGhlIG1hcC5cclxuICovXHJcblxyXG5MLlRpbGVMYXllci5XTVMgPSBMLlRpbGVMYXllci5leHRlbmQoe1xyXG5cclxuXHRkZWZhdWx0V21zUGFyYW1zOiB7XHJcblx0XHRzZXJ2aWNlOiAnV01TJyxcclxuXHRcdHJlcXVlc3Q6ICdHZXRNYXAnLFxyXG5cdFx0dmVyc2lvbjogJzEuMS4xJyxcclxuXHRcdGxheWVyczogJycsXHJcblx0XHRzdHlsZXM6ICcnLFxyXG5cdFx0Zm9ybWF0OiAnaW1hZ2UvanBlZycsXHJcblx0XHR0cmFuc3BhcmVudDogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7IC8vIChTdHJpbmcsIE9iamVjdClcclxuXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblxyXG5cdFx0dmFyIHdtc1BhcmFtcyA9IEwuZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRXbXNQYXJhbXMpLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gb3B0aW9ucy50aWxlU2l6ZSB8fCB0aGlzLm9wdGlvbnMudGlsZVNpemU7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZGV0ZWN0UmV0aW5hICYmIEwuQnJvd3Nlci5yZXRpbmEpIHtcclxuXHRcdFx0d21zUGFyYW1zLndpZHRoID0gd21zUGFyYW1zLmhlaWdodCA9IHRpbGVTaXplICogMjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHdtc1BhcmFtcy53aWR0aCA9IHdtc1BhcmFtcy5oZWlnaHQgPSB0aWxlU2l6ZTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcclxuXHRcdFx0Ly8gYWxsIGtleXMgdGhhdCBhcmUgbm90IFRpbGVMYXllciBvcHRpb25zIGdvIHRvIFdNUyBwYXJhbXNcclxuXHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkgJiYgaSAhPT0gJ2NycycpIHtcclxuXHRcdFx0XHR3bXNQYXJhbXNbaV0gPSBvcHRpb25zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy53bXNQYXJhbXMgPSB3bXNQYXJhbXM7XHJcblxyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblxyXG5cdFx0dGhpcy5fY3JzID0gdGhpcy5vcHRpb25zLmNycyB8fCBtYXAub3B0aW9ucy5jcnM7XHJcblxyXG5cdFx0dGhpcy5fd21zVmVyc2lvbiA9IHBhcnNlRmxvYXQodGhpcy53bXNQYXJhbXMudmVyc2lvbik7XHJcblxyXG5cdFx0dmFyIHByb2plY3Rpb25LZXkgPSB0aGlzLl93bXNWZXJzaW9uID49IDEuMyA/ICdjcnMnIDogJ3Nycyc7XHJcblx0XHR0aGlzLndtc1BhcmFtc1twcm9qZWN0aW9uS2V5XSA9IHRoaXMuX2Nycy5jb2RlO1xyXG5cclxuXHRcdEwuVGlsZUxheWVyLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XHJcblx0fSxcclxuXHJcblx0Z2V0VGlsZVVybDogZnVuY3Rpb24gKHRpbGVQb2ludCkgeyAvLyAoUG9pbnQsIE51bWJlcikgLT4gU3RyaW5nXHJcblxyXG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcclxuXHRcdCAgICB0aWxlU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZSxcclxuXHJcblx0XHQgICAgbndQb2ludCA9IHRpbGVQb2ludC5tdWx0aXBseUJ5KHRpbGVTaXplKSxcclxuXHRcdCAgICBzZVBvaW50ID0gbndQb2ludC5hZGQoW3RpbGVTaXplLCB0aWxlU2l6ZV0pLFxyXG5cclxuXHRcdCAgICBudyA9IHRoaXMuX2Nycy5wcm9qZWN0KG1hcC51bnByb2plY3QobndQb2ludCwgdGlsZVBvaW50LnopKSxcclxuXHRcdCAgICBzZSA9IHRoaXMuX2Nycy5wcm9qZWN0KG1hcC51bnByb2plY3Qoc2VQb2ludCwgdGlsZVBvaW50LnopKSxcclxuXHRcdCAgICBiYm94ID0gdGhpcy5fd21zVmVyc2lvbiA+PSAxLjMgJiYgdGhpcy5fY3JzID09PSBMLkNSUy5FUFNHNDMyNiA/XHJcblx0XHQgICAgICAgIFtzZS55LCBudy54LCBudy55LCBzZS54XS5qb2luKCcsJykgOlxyXG5cdFx0ICAgICAgICBbbncueCwgc2UueSwgc2UueCwgbncueV0uam9pbignLCcpLFxyXG5cclxuXHRcdCAgICB1cmwgPSBMLlV0aWwudGVtcGxhdGUodGhpcy5fdXJsLCB7czogdGhpcy5fZ2V0U3ViZG9tYWluKHRpbGVQb2ludCl9KTtcclxuXHJcblx0XHRyZXR1cm4gdXJsICsgTC5VdGlsLmdldFBhcmFtU3RyaW5nKHRoaXMud21zUGFyYW1zLCB1cmwsIHRydWUpICsgJyZCQk9YPScgKyBiYm94O1xyXG5cdH0sXHJcblxyXG5cdHNldFBhcmFtczogZnVuY3Rpb24gKHBhcmFtcywgbm9SZWRyYXcpIHtcclxuXHJcblx0XHRMLmV4dGVuZCh0aGlzLndtc1BhcmFtcywgcGFyYW1zKTtcclxuXHJcblx0XHRpZiAoIW5vUmVkcmF3KSB7XHJcblx0XHRcdHRoaXMucmVkcmF3KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59KTtcclxuXHJcbkwudGlsZUxheWVyLndtcyA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyLldNUyh1cmwsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5UaWxlTGF5ZXIuQ2FudmFzIGlzIGEgY2xhc3MgdGhhdCB5b3UgY2FuIHVzZSBhcyBhIGJhc2UgZm9yIGNyZWF0aW5nXHJcbiAqIGR5bmFtaWNhbGx5IGRyYXduIENhbnZhcy1iYXNlZCB0aWxlIGxheWVycy5cclxuICovXHJcblxyXG5MLlRpbGVMYXllci5DYW52YXMgPSBMLlRpbGVMYXllci5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGFzeW5jOiBmYWxzZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0cmVkcmF3OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3Jlc2V0KHtoYXJkOiB0cnVlfSk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0dGhpcy5fcmVkcmF3VGlsZSh0aGlzLl90aWxlc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfcmVkcmF3VGlsZTogZnVuY3Rpb24gKHRpbGUpIHtcclxuXHRcdHRoaXMuZHJhd1RpbGUodGlsZSwgdGlsZS5fdGlsZVBvaW50LCB0aGlzLl9tYXAuX3pvb20pO1xyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVUaWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgdGlsZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2NhbnZhcycsICdsZWFmbGV0LXRpbGUnKTtcclxuXHRcdHRpbGUud2lkdGggPSB0aWxlLmhlaWdodCA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcclxuXHRcdHRpbGUub25zZWxlY3RzdGFydCA9IHRpbGUub25tb3VzZW1vdmUgPSBMLlV0aWwuZmFsc2VGbjtcclxuXHRcdHJldHVybiB0aWxlO1xyXG5cdH0sXHJcblxyXG5cdF9sb2FkVGlsZTogZnVuY3Rpb24gKHRpbGUsIHRpbGVQb2ludCkge1xyXG5cdFx0dGlsZS5fbGF5ZXIgPSB0aGlzO1xyXG5cdFx0dGlsZS5fdGlsZVBvaW50ID0gdGlsZVBvaW50O1xyXG5cclxuXHRcdHRoaXMuX3JlZHJhd1RpbGUodGlsZSk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYXN5bmMpIHtcclxuXHRcdFx0dGhpcy50aWxlRHJhd24odGlsZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0ZHJhd1RpbGU6IGZ1bmN0aW9uICgvKnRpbGUsIHRpbGVQb2ludCovKSB7XHJcblx0XHQvLyBvdmVycmlkZSB3aXRoIHJlbmRlcmluZyBjb2RlXHJcblx0fSxcclxuXHJcblx0dGlsZURyYXduOiBmdW5jdGlvbiAodGlsZSkge1xyXG5cdFx0dGhpcy5fdGlsZU9uTG9hZC5jYWxsKHRpbGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5cclxuTC50aWxlTGF5ZXIuY2FudmFzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyLkNhbnZhcyhvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuSW1hZ2VPdmVybGF5IGlzIHVzZWQgdG8gb3ZlcmxheSBpbWFnZXMgb3ZlciB0aGUgbWFwICh0byBzcGVjaWZpYyBnZW9ncmFwaGljYWwgYm91bmRzKS5cclxuICovXHJcblxyXG5MLkltYWdlT3ZlcmxheSA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdG9wYWNpdHk6IDFcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAodXJsLCBib3VuZHMsIG9wdGlvbnMpIHsgLy8gKFN0cmluZywgTGF0TG5nQm91bmRzLCBPYmplY3QpXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblx0XHR0aGlzLl9ib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdGlmICghdGhpcy5faW1hZ2UpIHtcclxuXHRcdFx0dGhpcy5faW5pdEltYWdlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bWFwLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9pbWFnZSk7XHJcblxyXG5cdFx0bWFwLm9uKCd2aWV3cmVzZXQnLCB0aGlzLl9yZXNldCwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKG1hcC5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5Ccm93c2VyLmFueTNkKSB7XHJcblx0XHRcdG1hcC5vbignem9vbWFuaW0nLCB0aGlzLl9hbmltYXRlWm9vbSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVzZXQoKTtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmdldFBhbmVzKCkub3ZlcmxheVBhbmUucmVtb3ZlQ2hpbGQodGhpcy5faW1hZ2UpO1xyXG5cclxuXHRcdG1hcC5vZmYoJ3ZpZXdyZXNldCcsIHRoaXMuX3Jlc2V0LCB0aGlzKTtcclxuXHJcblx0XHRpZiAobWFwLm9wdGlvbnMuem9vbUFuaW1hdGlvbikge1xyXG5cdFx0XHRtYXAub2ZmKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVab29tLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuXHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdC8vIFRPRE8gcmVtb3ZlIGJyaW5nVG9Gcm9udC9icmluZ1RvQmFjayBkdXBsaWNhdGlvbiBmcm9tIFRpbGVMYXllci9QYXRoXHJcblx0YnJpbmdUb0Zyb250OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5faW1hZ2UpIHtcclxuXHRcdFx0dGhpcy5fbWFwLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9pbWFnZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvQmFjazogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLm92ZXJsYXlQYW5lO1xyXG5cdFx0aWYgKHRoaXMuX2ltYWdlKSB7XHJcblx0XHRcdHBhbmUuaW5zZXJ0QmVmb3JlKHRoaXMuX2ltYWdlLCBwYW5lLmZpcnN0Q2hpbGQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0VXJsOiBmdW5jdGlvbiAodXJsKSB7XHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblx0XHR0aGlzLl9pbWFnZS5zcmMgPSB0aGlzLl91cmw7XHJcblx0fSxcclxuXHJcblx0Z2V0QXR0cmlidXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuYXR0cmlidXRpb247XHJcblx0fSxcclxuXHJcblx0X2luaXRJbWFnZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5faW1hZ2UgPSBMLkRvbVV0aWwuY3JlYXRlKCdpbWcnLCAnbGVhZmxldC1pbWFnZS1sYXllcicpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuQnJvd3Nlci5hbnkzZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5faW1hZ2UsICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pbWFnZSwgJ2xlYWZsZXQtem9vbS1oaWRlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cclxuXHRcdC8vVE9ETyBjcmVhdGVJbWFnZSB1dGlsIG1ldGhvZCB0byByZW1vdmUgZHVwbGljYXRpb25cclxuXHRcdEwuZXh0ZW5kKHRoaXMuX2ltYWdlLCB7XHJcblx0XHRcdGdhbGxlcnlpbWc6ICdubycsXHJcblx0XHRcdG9uc2VsZWN0c3RhcnQ6IEwuVXRpbC5mYWxzZUZuLFxyXG5cdFx0XHRvbm1vdXNlbW92ZTogTC5VdGlsLmZhbHNlRm4sXHJcblx0XHRcdG9ubG9hZDogTC5iaW5kKHRoaXMuX29uSW1hZ2VMb2FkLCB0aGlzKSxcclxuXHRcdFx0c3JjOiB0aGlzLl91cmxcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgaW1hZ2UgPSB0aGlzLl9pbWFnZSxcclxuXHRcdCAgICBzY2FsZSA9IG1hcC5nZXRab29tU2NhbGUoZS56b29tKSxcclxuXHRcdCAgICBudyA9IHRoaXMuX2JvdW5kcy5nZXROb3J0aFdlc3QoKSxcclxuXHRcdCAgICBzZSA9IHRoaXMuX2JvdW5kcy5nZXRTb3V0aEVhc3QoKSxcclxuXHJcblx0XHQgICAgdG9wTGVmdCA9IG1hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KG53LCBlLnpvb20sIGUuY2VudGVyKSxcclxuXHRcdCAgICBzaXplID0gbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQoc2UsIGUuem9vbSwgZS5jZW50ZXIpLl9zdWJ0cmFjdCh0b3BMZWZ0KSxcclxuXHRcdCAgICBvcmlnaW4gPSB0b3BMZWZ0Ll9hZGQoc2l6ZS5fbXVsdGlwbHlCeSgoMSAvIDIpICogKDEgLSAxIC8gc2NhbGUpKSk7XHJcblxyXG5cdFx0aW1hZ2Uuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPVxyXG5cdFx0ICAgICAgICBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKG9yaWdpbikgKyAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblx0fSxcclxuXHJcblx0X3Jlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaW1hZ2UgICA9IHRoaXMuX2ltYWdlLFxyXG5cdFx0ICAgIHRvcExlZnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2JvdW5kcy5nZXROb3J0aFdlc3QoKSksXHJcblx0XHQgICAgc2l6ZSA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fYm91bmRzLmdldFNvdXRoRWFzdCgpKS5fc3VidHJhY3QodG9wTGVmdCk7XHJcblxyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKGltYWdlLCB0b3BMZWZ0KTtcclxuXHJcblx0XHRpbWFnZS5zdHlsZS53aWR0aCAgPSBzaXplLnggKyAncHgnO1xyXG5cdFx0aW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gc2l6ZS55ICsgJ3B4JztcclxuXHR9LFxyXG5cclxuXHRfb25JbWFnZUxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9pbWFnZSwgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmltYWdlT3ZlcmxheSA9IGZ1bmN0aW9uICh1cmwsIGJvdW5kcywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5JbWFnZU92ZXJsYXkodXJsLCBib3VuZHMsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5JY29uIGlzIGFuIGltYWdlLWJhc2VkIGljb24gY2xhc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRoIEwuTWFya2VyIGZvciBjdXN0b20gbWFya2Vycy5cclxuICovXHJcblxyXG5MLkljb24gPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0LypcclxuXHRcdGljb25Vcmw6IChTdHJpbmcpIChyZXF1aXJlZClcclxuXHRcdGljb25SZXRpbmFVcmw6IChTdHJpbmcpIChvcHRpb25hbCwgdXNlZCBmb3IgcmV0aW5hIGRldmljZXMgaWYgZGV0ZWN0ZWQpXHJcblx0XHRpY29uU2l6ZTogKFBvaW50KSAoY2FuIGJlIHNldCB0aHJvdWdoIENTUylcclxuXHRcdGljb25BbmNob3I6IChQb2ludCkgKGNlbnRlcmVkIGJ5IGRlZmF1bHQsIGNhbiBiZSBzZXQgaW4gQ1NTIHdpdGggbmVnYXRpdmUgbWFyZ2lucylcclxuXHRcdHBvcHVwQW5jaG9yOiAoUG9pbnQpIChpZiBub3Qgc3BlY2lmaWVkLCBwb3B1cCBvcGVucyBpbiB0aGUgYW5jaG9yIHBvaW50KVxyXG5cdFx0c2hhZG93VXJsOiAoU3RyaW5nKSAobm8gc2hhZG93IGJ5IGRlZmF1bHQpXHJcblx0XHRzaGFkb3dSZXRpbmFVcmw6IChTdHJpbmcpIChvcHRpb25hbCwgdXNlZCBmb3IgcmV0aW5hIGRldmljZXMgaWYgZGV0ZWN0ZWQpXHJcblx0XHRzaGFkb3dTaXplOiAoUG9pbnQpXHJcblx0XHRzaGFkb3dBbmNob3I6IChQb2ludClcclxuXHRcdCovXHJcblx0XHRjbGFzc05hbWU6ICcnXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRjcmVhdGVJY29uOiBmdW5jdGlvbiAob2xkSWNvbikge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZUljb24oJ2ljb24nLCBvbGRJY29uKTtcclxuXHR9LFxyXG5cclxuXHRjcmVhdGVTaGFkb3c6IGZ1bmN0aW9uIChvbGRJY29uKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlSWNvbignc2hhZG93Jywgb2xkSWNvbik7XHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZUljb246IGZ1bmN0aW9uIChuYW1lLCBvbGRJY29uKSB7XHJcblx0XHR2YXIgc3JjID0gdGhpcy5fZ2V0SWNvblVybChuYW1lKTtcclxuXHJcblx0XHRpZiAoIXNyYykge1xyXG5cdFx0XHRpZiAobmFtZSA9PT0gJ2ljb24nKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpY29uVXJsIG5vdCBzZXQgaW4gSWNvbiBvcHRpb25zIChzZWUgdGhlIGRvY3MpLicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBpbWc7XHJcblx0XHRpZiAoIW9sZEljb24gfHwgb2xkSWNvbi50YWdOYW1lICE9PSAnSU1HJykge1xyXG5cdFx0XHRpbWcgPSB0aGlzLl9jcmVhdGVJbWcoc3JjKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGltZyA9IHRoaXMuX2NyZWF0ZUltZyhzcmMsIG9sZEljb24pO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fc2V0SWNvblN0eWxlcyhpbWcsIG5hbWUpO1xyXG5cclxuXHRcdHJldHVybiBpbWc7XHJcblx0fSxcclxuXHJcblx0X3NldEljb25TdHlsZXM6IGZ1bmN0aW9uIChpbWcsIG5hbWUpIHtcclxuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG5cdFx0ICAgIHNpemUgPSBMLnBvaW50KG9wdGlvbnNbbmFtZSArICdTaXplJ10pLFxyXG5cdFx0ICAgIGFuY2hvcjtcclxuXHJcblx0XHRpZiAobmFtZSA9PT0gJ3NoYWRvdycpIHtcclxuXHRcdFx0YW5jaG9yID0gTC5wb2ludChvcHRpb25zLnNoYWRvd0FuY2hvciB8fCBvcHRpb25zLmljb25BbmNob3IpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YW5jaG9yID0gTC5wb2ludChvcHRpb25zLmljb25BbmNob3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghYW5jaG9yICYmIHNpemUpIHtcclxuXHRcdFx0YW5jaG9yID0gc2l6ZS5kaXZpZGVCeSgyLCB0cnVlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpbWcuY2xhc3NOYW1lID0gJ2xlYWZsZXQtbWFya2VyLScgKyBuYW1lICsgJyAnICsgb3B0aW9ucy5jbGFzc05hbWU7XHJcblxyXG5cdFx0aWYgKGFuY2hvcikge1xyXG5cdFx0XHRpbWcuc3R5bGUubWFyZ2luTGVmdCA9ICgtYW5jaG9yLngpICsgJ3B4JztcclxuXHRcdFx0aW1nLnN0eWxlLm1hcmdpblRvcCAgPSAoLWFuY2hvci55KSArICdweCc7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHNpemUpIHtcclxuXHRcdFx0aW1nLnN0eWxlLndpZHRoICA9IHNpemUueCArICdweCc7XHJcblx0XHRcdGltZy5zdHlsZS5oZWlnaHQgPSBzaXplLnkgKyAncHgnO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVJbWc6IGZ1bmN0aW9uIChzcmMsIGVsKSB7XHJcblx0XHRlbCA9IGVsIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0ZWwuc3JjID0gc3JjO1xyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRJY29uVXJsOiBmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0aWYgKEwuQnJvd3Nlci5yZXRpbmEgJiYgdGhpcy5vcHRpb25zW25hbWUgKyAnUmV0aW5hVXJsJ10pIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1tuYW1lICsgJ1JldGluYVVybCddO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9uc1tuYW1lICsgJ1VybCddO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmljb24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5JY29uKG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcbiAqIEwuSWNvbi5EZWZhdWx0IGlzIHRoZSBibHVlIG1hcmtlciBpY29uIHVzZWQgYnkgZGVmYXVsdCBpbiBMZWFmbGV0LlxuICovXG5cbkwuSWNvbi5EZWZhdWx0ID0gTC5JY29uLmV4dGVuZCh7XG5cblx0b3B0aW9uczoge1xuXHRcdGljb25TaXplOiBbMjUsIDQxXSxcblx0XHRpY29uQW5jaG9yOiBbMTIsIDQxXSxcblx0XHRwb3B1cEFuY2hvcjogWzEsIC0zNF0sXG5cblx0XHRzaGFkb3dTaXplOiBbNDEsIDQxXVxuXHR9LFxuXG5cdF9nZXRJY29uVXJsOiBmdW5jdGlvbiAobmFtZSkge1xuXHRcdHZhciBrZXkgPSBuYW1lICsgJ1VybCc7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zW2tleV0pIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNba2V5XTtcblx0XHR9XG5cblx0XHRpZiAoTC5Ccm93c2VyLnJldGluYSAmJiBuYW1lID09PSAnaWNvbicpIHtcblx0XHRcdG5hbWUgKz0gJy0yeCc7XG5cdFx0fVxuXG5cdFx0dmFyIHBhdGggPSBMLkljb24uRGVmYXVsdC5pbWFnZVBhdGg7XG5cblx0XHRpZiAoIXBhdGgpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCBhdXRvZGV0ZWN0IEwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aCwgc2V0IGl0IG1hbnVhbGx5LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoICsgJy9tYXJrZXItJyArIG5hbWUgKyAnLnBuZyc7XG5cdH1cbn0pO1xuXG5MLkljb24uRGVmYXVsdC5pbWFnZVBhdGggPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0ICAgIGxlYWZsZXRSZSA9IC9bXFwvXl1sZWFmbGV0W1xcLVxcLl9dPyhbXFx3XFwtXFwuX10qKVxcLmpzXFw/Py87XG5cblx0dmFyIGksIGxlbiwgc3JjLCBtYXRjaGVzLCBwYXRoO1xuXG5cdGZvciAoaSA9IDAsIGxlbiA9IHNjcmlwdHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRzcmMgPSBzY3JpcHRzW2ldLnNyYztcblx0XHRtYXRjaGVzID0gc3JjLm1hdGNoKGxlYWZsZXRSZSk7XG5cblx0XHRpZiAobWF0Y2hlcykge1xuXHRcdFx0cGF0aCA9IHNyYy5zcGxpdChsZWFmbGV0UmUpWzBdO1xuXHRcdFx0cmV0dXJuIChwYXRoID8gcGF0aCArICcvJyA6ICcnKSArICdpbWFnZXMnO1xuXHRcdH1cblx0fVxufSgpKTtcblxuXG4vKlxyXG4gKiBMLk1hcmtlciBpcyB1c2VkIHRvIGRpc3BsYXkgY2xpY2thYmxlL2RyYWdnYWJsZSBpY29ucyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFya2VyID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGljb246IG5ldyBMLkljb24uRGVmYXVsdCgpLFxyXG5cdFx0dGl0bGU6ICcnLFxyXG5cdFx0YWx0OiAnJyxcclxuXHRcdGNsaWNrYWJsZTogdHJ1ZSxcclxuXHRcdGRyYWdnYWJsZTogZmFsc2UsXHJcblx0XHRrZXlib2FyZDogdHJ1ZSxcclxuXHRcdHpJbmRleE9mZnNldDogMCxcclxuXHRcdG9wYWNpdHk6IDEsXHJcblx0XHRyaXNlT25Ib3ZlcjogZmFsc2UsXHJcblx0XHRyaXNlT2Zmc2V0OiAyNTBcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5nLCBvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0bWFwLm9uKCd2aWV3cmVzZXQnLCB0aGlzLnVwZGF0ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faW5pdEljb24oKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR0aGlzLmZpcmUoJ2FkZCcpO1xyXG5cclxuXHRcdGlmIChtYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIG1hcC5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pIHtcclxuXHRcdFx0bWFwLm9uKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVab29tLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdGlmICh0aGlzLmRyYWdnaW5nKSB7XHJcblx0XHRcdHRoaXMuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3JlbW92ZUljb24oKTtcclxuXHRcdHRoaXMuX3JlbW92ZVNoYWRvdygpO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgncmVtb3ZlJyk7XHJcblxyXG5cdFx0bWFwLm9mZih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLnVwZGF0ZSxcclxuXHRcdFx0J3pvb21hbmltJzogdGhpcy5fYW5pbWF0ZVpvb21cclxuXHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF0TG5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF0bG5nO1xyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZzogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0dGhpcy5fbGF0bG5nID0gTC5sYXRMbmcobGF0bG5nKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ21vdmUnLCB7IGxhdGxuZzogdGhpcy5fbGF0bG5nIH0pO1xyXG5cdH0sXHJcblxyXG5cdHNldFpJbmRleE9mZnNldDogZnVuY3Rpb24gKG9mZnNldCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLnpJbmRleE9mZnNldCA9IG9mZnNldDtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0SWNvbjogZnVuY3Rpb24gKGljb24pIHtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuaWNvbiA9IGljb247XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9pbml0SWNvbigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLmJpbmRQb3B1cCh0aGlzLl9wb3B1cCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5faWNvbikge1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpLnJvdW5kKCk7XHJcblx0XHRcdHRoaXMuX3NldFBvcyhwb3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0SWNvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcblx0XHQgICAgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGFuaW1hdGlvbiA9IChtYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIG1hcC5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pLFxyXG5cdFx0ICAgIGNsYXNzVG9BZGQgPSBhbmltYXRpb24gPyAnbGVhZmxldC16b29tLWFuaW1hdGVkJyA6ICdsZWFmbGV0LXpvb20taGlkZSc7XHJcblxyXG5cdFx0dmFyIGljb24gPSBvcHRpb25zLmljb24uY3JlYXRlSWNvbih0aGlzLl9pY29uKSxcclxuXHRcdFx0YWRkSWNvbiA9IGZhbHNlO1xyXG5cclxuXHRcdC8vIGlmIHdlJ3JlIG5vdCByZXVzaW5nIHRoZSBpY29uLCByZW1vdmUgdGhlIG9sZCBvbmUgYW5kIGluaXQgbmV3IG9uZVxyXG5cdFx0aWYgKGljb24gIT09IHRoaXMuX2ljb24pIHtcclxuXHRcdFx0aWYgKHRoaXMuX2ljb24pIHtcclxuXHRcdFx0XHR0aGlzLl9yZW1vdmVJY29uKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0YWRkSWNvbiA9IHRydWU7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy50aXRsZSkge1xyXG5cdFx0XHRcdGljb24udGl0bGUgPSBvcHRpb25zLnRpdGxlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAob3B0aW9ucy5hbHQpIHtcclxuXHRcdFx0XHRpY29uLmFsdCA9IG9wdGlvbnMuYWx0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKGljb24sIGNsYXNzVG9BZGQpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmtleWJvYXJkKSB7XHJcblx0XHRcdGljb24udGFiSW5kZXggPSAnMCc7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faWNvbiA9IGljb247XHJcblxyXG5cdFx0dGhpcy5faW5pdEludGVyYWN0aW9uKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMucmlzZU9uSG92ZXIpIHtcclxuXHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdC5vbihpY29uLCAnbW91c2VvdmVyJywgdGhpcy5fYnJpbmdUb0Zyb250LCB0aGlzKVxyXG5cdFx0XHRcdC5vbihpY29uLCAnbW91c2VvdXQnLCB0aGlzLl9yZXNldFpJbmRleCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5ld1NoYWRvdyA9IG9wdGlvbnMuaWNvbi5jcmVhdGVTaGFkb3codGhpcy5fc2hhZG93KSxcclxuXHRcdFx0YWRkU2hhZG93ID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKG5ld1NoYWRvdyAhPT0gdGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdHRoaXMuX3JlbW92ZVNoYWRvdygpO1xyXG5cdFx0XHRhZGRTaGFkb3cgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChuZXdTaGFkb3cpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKG5ld1NoYWRvdywgY2xhc3NUb0FkZCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9zaGFkb3cgPSBuZXdTaGFkb3c7XHJcblxyXG5cclxuXHRcdGlmIChvcHRpb25zLm9wYWNpdHkgPCAxKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0dmFyIHBhbmVzID0gdGhpcy5fbWFwLl9wYW5lcztcclxuXHJcblx0XHRpZiAoYWRkSWNvbikge1xyXG5cdFx0XHRwYW5lcy5tYXJrZXJQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2ljb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChuZXdTaGFkb3cgJiYgYWRkU2hhZG93KSB7XHJcblx0XHRcdHBhbmVzLnNoYWRvd1BhbmUuYXBwZW5kQ2hpbGQodGhpcy5fc2hhZG93KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcmVtb3ZlSWNvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yaXNlT25Ib3Zlcikge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdCAgICAub2ZmKHRoaXMuX2ljb24sICdtb3VzZW92ZXInLCB0aGlzLl9icmluZ1RvRnJvbnQpXHJcblx0XHRcdCAgICAub2ZmKHRoaXMuX2ljb24sICdtb3VzZW91dCcsIHRoaXMuX3Jlc2V0WkluZGV4KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9tYXAuX3BhbmVzLm1hcmtlclBhbmUucmVtb3ZlQ2hpbGQodGhpcy5faWNvbik7XHJcblxyXG5cdFx0dGhpcy5faWNvbiA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZVNoYWRvdzogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3NoYWRvdykge1xyXG5cdFx0XHR0aGlzLl9tYXAuX3BhbmVzLnNoYWRvd1BhbmUucmVtb3ZlQ2hpbGQodGhpcy5fc2hhZG93KTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX3NoYWRvdyA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0X3NldFBvczogZnVuY3Rpb24gKHBvcykge1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2ljb24sIHBvcyk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3NoYWRvdykge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fc2hhZG93LCBwb3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3pJbmRleCA9IHBvcy55ICsgdGhpcy5vcHRpb25zLnpJbmRleE9mZnNldDtcclxuXHJcblx0XHR0aGlzLl9yZXNldFpJbmRleCgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVaSW5kZXg6IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuXHRcdHRoaXMuX2ljb24uc3R5bGUuekluZGV4ID0gdGhpcy5fekluZGV4ICsgb2Zmc2V0O1xyXG5cdH0sXHJcblxyXG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKG9wdCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuX21hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KHRoaXMuX2xhdGxuZywgb3B0Lnpvb20sIG9wdC5jZW50ZXIpLnJvdW5kKCk7XHJcblxyXG5cdFx0dGhpcy5fc2V0UG9zKHBvcyk7XHJcblx0fSxcclxuXHJcblx0X2luaXRJbnRlcmFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmNsaWNrYWJsZSkgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBUT0RPIHJlZmFjdG9yIGludG8gc29tZXRoaW5nIHNoYXJlZCB3aXRoIE1hcC9QYXRoL2V0Yy4gdG8gRFJZIGl0IHVwXHJcblxyXG5cdFx0dmFyIGljb24gPSB0aGlzLl9pY29uLFxyXG5cdFx0ICAgIGV2ZW50cyA9IFsnZGJsY2xpY2snLCAnbW91c2Vkb3duJywgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdjb250ZXh0bWVudSddO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhpY29uLCAnbGVhZmxldC1jbGlja2FibGUnKTtcclxuXHRcdEwuRG9tRXZlbnQub24oaWNvbiwgJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrLCB0aGlzKTtcclxuXHRcdEwuRG9tRXZlbnQub24oaWNvbiwgJ2tleXByZXNzJywgdGhpcy5fb25LZXlQcmVzcywgdGhpcyk7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbihpY29uLCBldmVudHNbaV0sIHRoaXMuX2ZpcmVNb3VzZUV2ZW50LCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoTC5IYW5kbGVyLk1hcmtlckRyYWcpIHtcclxuXHRcdFx0dGhpcy5kcmFnZ2luZyA9IG5ldyBMLkhhbmRsZXIuTWFya2VyRHJhZyh0aGlzKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlKSB7XHJcblx0XHRcdFx0dGhpcy5kcmFnZ2luZy5lbmFibGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbk1vdXNlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR2YXIgd2FzRHJhZ2dlZCA9IHRoaXMuZHJhZ2dpbmcgJiYgdGhpcy5kcmFnZ2luZy5tb3ZlZCgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0V2ZW50TGlzdGVuZXJzKGUudHlwZSkgfHwgd2FzRHJhZ2dlZCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAod2FzRHJhZ2dlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAoKCF0aGlzLmRyYWdnaW5nIHx8ICF0aGlzLmRyYWdnaW5nLl9lbmFibGVkKSAmJiB0aGlzLl9tYXAuZHJhZ2dpbmcgJiYgdGhpcy5fbWFwLmRyYWdnaW5nLm1vdmVkKCkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwge1xyXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBlLFxyXG5cdFx0XHRsYXRsbmc6IHRoaXMuX2xhdGxuZ1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X29uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2NsaWNrJywge1xyXG5cdFx0XHRcdG9yaWdpbmFsRXZlbnQ6IGUsXHJcblx0XHRcdFx0bGF0bG5nOiB0aGlzLl9sYXRsbmdcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2ZpcmVNb3VzZUV2ZW50OiBmdW5jdGlvbiAoZSkge1xyXG5cclxuXHRcdHRoaXMuZmlyZShlLnR5cGUsIHtcclxuXHRcdFx0b3JpZ2luYWxFdmVudDogZSxcclxuXHRcdFx0bGF0bG5nOiB0aGlzLl9sYXRsbmdcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFRPRE8gcHJvcGVyIGN1c3RvbSBldmVudCBwcm9wYWdhdGlvblxyXG5cdFx0Ly8gdGhpcyBsaW5lIHdpbGwgYWx3YXlzIGJlIGNhbGxlZCBpZiBtYXJrZXIgaXMgaW4gYSBGZWF0dXJlR3JvdXBcclxuXHRcdGlmIChlLnR5cGUgPT09ICdjb250ZXh0bWVudScgJiYgdGhpcy5oYXNFdmVudExpc3RlbmVycyhlLnR5cGUpKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZS50eXBlICE9PSAnbW91c2Vkb3duJykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9pY29uLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHRpZiAodGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdEwuRG9tVXRpbC5zZXRPcGFjaXR5KHRoaXMuX3NoYWRvdywgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9icmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3VwZGF0ZVpJbmRleCh0aGlzLm9wdGlvbnMucmlzZU9mZnNldCk7XHJcblx0fSxcclxuXHJcblx0X3Jlc2V0WkluZGV4OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl91cGRhdGVaSW5kZXgoMCk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwubWFya2VyID0gZnVuY3Rpb24gKGxhdGxuZywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5NYXJrZXIobGF0bG5nLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXG4gKiBMLkRpdkljb24gaXMgYSBsaWdodHdlaWdodCBIVE1MLWJhc2VkIGljb24gY2xhc3MgKGFzIG9wcG9zZWQgdG8gdGhlIGltYWdlLWJhc2VkIEwuSWNvbilcbiAqIHRvIHVzZSB3aXRoIEwuTWFya2VyLlxuICovXG5cbkwuRGl2SWNvbiA9IEwuSWNvbi5leHRlbmQoe1xuXHRvcHRpb25zOiB7XG5cdFx0aWNvblNpemU6IFsxMiwgMTJdLCAvLyBhbHNvIGNhbiBiZSBzZXQgdGhyb3VnaCBDU1Ncblx0XHQvKlxuXHRcdGljb25BbmNob3I6IChQb2ludClcblx0XHRwb3B1cEFuY2hvcjogKFBvaW50KVxuXHRcdGh0bWw6IChTdHJpbmcpXG5cdFx0YmdQb3M6IChQb2ludClcblx0XHQqL1xuXHRcdGNsYXNzTmFtZTogJ2xlYWZsZXQtZGl2LWljb24nLFxuXHRcdGh0bWw6IGZhbHNlXG5cdH0sXG5cblx0Y3JlYXRlSWNvbjogZnVuY3Rpb24gKG9sZEljb24pIHtcblx0XHR2YXIgZGl2ID0gKG9sZEljb24gJiYgb2xkSWNvbi50YWdOYW1lID09PSAnRElWJykgPyBvbGRJY29uIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cdFx0ICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRpZiAob3B0aW9ucy5odG1sICE9PSBmYWxzZSkge1xuXHRcdFx0ZGl2LmlubmVySFRNTCA9IG9wdGlvbnMuaHRtbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGl2LmlubmVySFRNTCA9ICcnO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLmJnUG9zKSB7XG5cdFx0XHRkaXYuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID1cblx0XHRcdCAgICAgICAgKC1vcHRpb25zLmJnUG9zLngpICsgJ3B4ICcgKyAoLW9wdGlvbnMuYmdQb3MueSkgKyAncHgnO1xuXHRcdH1cblxuXHRcdHRoaXMuX3NldEljb25TdHlsZXMoZGl2LCAnaWNvbicpO1xuXHRcdHJldHVybiBkaXY7XG5cdH0sXG5cblx0Y3JlYXRlU2hhZG93OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn0pO1xuXG5MLmRpdkljb24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRyZXR1cm4gbmV3IEwuRGl2SWNvbihvcHRpb25zKTtcbn07XG5cblxuLypcclxuICogTC5Qb3B1cCBpcyB1c2VkIGZvciBkaXNwbGF5aW5nIHBvcHVwcyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFwLm1lcmdlT3B0aW9ucyh7XHJcblx0Y2xvc2VQb3B1cE9uQ2xpY2s6IHRydWVcclxufSk7XHJcblxyXG5MLlBvcHVwID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0bWluV2lkdGg6IDUwLFxyXG5cdFx0bWF4V2lkdGg6IDMwMCxcclxuXHRcdC8vIG1heEhlaWdodDogbnVsbCxcclxuXHRcdGF1dG9QYW46IHRydWUsXHJcblx0XHRjbG9zZUJ1dHRvbjogdHJ1ZSxcclxuXHRcdG9mZnNldDogWzAsIDddLFxyXG5cdFx0YXV0b1BhblBhZGRpbmc6IFs1LCA1XSxcclxuXHRcdC8vIGF1dG9QYW5QYWRkaW5nVG9wTGVmdDogbnVsbCxcclxuXHRcdC8vIGF1dG9QYW5QYWRkaW5nQm90dG9tUmlnaHQ6IG51bGwsXHJcblx0XHRrZWVwSW5WaWV3OiBmYWxzZSxcclxuXHRcdGNsYXNzTmFtZTogJycsXHJcblx0XHR6b29tQW5pbWF0aW9uOiB0cnVlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMsIHNvdXJjZSkge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcclxuXHRcdHRoaXMuX2FuaW1hdGVkID0gTC5Ccm93c2VyLmFueTNkICYmIHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uO1xyXG5cdFx0dGhpcy5faXNPcGVuID0gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9pbml0TGF5b3V0KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGFuaW1GYWRlID0gbWFwLm9wdGlvbnMuZmFkZUFuaW1hdGlvbjtcclxuXHJcblx0XHRpZiAoYW5pbUZhZGUpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCAwKTtcclxuXHRcdH1cclxuXHRcdG1hcC5fcGFuZXMucG9wdXBQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0bWFwLm9uKHRoaXMuX2dldEV2ZW50cygpLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHRcdGlmIChhbmltRmFkZSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9jb250YWluZXIsIDEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnb3BlbicpO1xyXG5cclxuXHRcdG1hcC5maXJlKCdwb3B1cG9wZW4nLCB7cG9wdXA6IHRoaXN9KTtcclxuXHJcblx0XHRpZiAodGhpcy5fc291cmNlKSB7XHJcblx0XHRcdHRoaXMuX3NvdXJjZS5maXJlKCdwb3B1cG9wZW4nLCB7cG9wdXA6IHRoaXN9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b3Blbk9uOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAub3BlblBvcHVwKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5fcGFuZXMucG9wdXBQYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0TC5VdGlsLmZhbHNlRm4odGhpcy5fY29udGFpbmVyLm9mZnNldFdpZHRoKTsgLy8gZm9yY2UgcmVmbG93XHJcblxyXG5cdFx0bWFwLm9mZih0aGlzLl9nZXRFdmVudHMoKSwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKG1hcC5vcHRpb25zLmZhZGVBbmltYXRpb24pIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCAwKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgnY2xvc2UnKTtcclxuXHJcblx0XHRtYXAuZmlyZSgncG9wdXBjbG9zZScsIHtwb3B1cDogdGhpc30pO1xyXG5cclxuXHRcdGlmICh0aGlzLl9zb3VyY2UpIHtcclxuXHRcdFx0dGhpcy5fc291cmNlLmZpcmUoJ3BvcHVwY2xvc2UnLCB7cG9wdXA6IHRoaXN9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXRMYXRMbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXRsbmc7XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xyXG5cdFx0XHR0aGlzLl9hZGp1c3RQYW4oKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250ZW50O1xyXG5cdH0sXHJcblxyXG5cdHNldENvbnRlbnQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHR0aGlzLl9jb250ZW50ID0gY29udGVudDtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlQ29udGVudCgpO1xyXG5cdFx0dGhpcy5fdXBkYXRlTGF5b3V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XHJcblxyXG5cdFx0dGhpcy5fYWRqdXN0UGFuKCk7XHJcblx0fSxcclxuXHJcblx0X2dldEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGV2ZW50cyA9IHtcclxuXHRcdFx0dmlld3Jlc2V0OiB0aGlzLl91cGRhdGVQb3NpdGlvblxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0ZXZlbnRzLnpvb21hbmltID0gdGhpcy5fem9vbUFuaW1hdGlvbjtcclxuXHRcdH1cclxuXHRcdGlmICgnY2xvc2VPbkNsaWNrJyBpbiB0aGlzLm9wdGlvbnMgPyB0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIDogdGhpcy5fbWFwLm9wdGlvbnMuY2xvc2VQb3B1cE9uQ2xpY2spIHtcclxuXHRcdFx0ZXZlbnRzLnByZWNsaWNrID0gdGhpcy5fY2xvc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmtlZXBJblZpZXcpIHtcclxuXHRcdFx0ZXZlbnRzLm1vdmVlbmQgPSB0aGlzLl9hZGp1c3RQYW47XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGV2ZW50cztcclxuXHR9LFxyXG5cclxuXHRfY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fbWFwLmNsb3NlUG9wdXAodGhpcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2luaXRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwcmVmaXggPSAnbGVhZmxldC1wb3B1cCcsXHJcblx0XHRcdGNvbnRhaW5lckNsYXNzID0gcHJlZml4ICsgJyAnICsgdGhpcy5vcHRpb25zLmNsYXNzTmFtZSArICcgbGVhZmxldC16b29tLScgK1xyXG5cdFx0XHQgICAgICAgICh0aGlzLl9hbmltYXRlZCA/ICdhbmltYXRlZCcgOiAnaGlkZScpLFxyXG5cdFx0XHRjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjb250YWluZXJDbGFzcyksXHJcblx0XHRcdGNsb3NlQnV0dG9uO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xvc2VCdXR0b24pIHtcclxuXHRcdFx0Y2xvc2VCdXR0b24gPSB0aGlzLl9jbG9zZUJ1dHRvbiA9XHJcblx0XHRcdCAgICAgICAgTC5Eb21VdGlsLmNyZWF0ZSgnYScsIHByZWZpeCArICctY2xvc2UtYnV0dG9uJywgY29udGFpbmVyKTtcclxuXHRcdFx0Y2xvc2VCdXR0b24uaHJlZiA9ICcjY2xvc2UnO1xyXG5cdFx0XHRjbG9zZUJ1dHRvbi5pbm5lckhUTUwgPSAnJiMyMTU7JztcclxuXHRcdFx0TC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbihjbG9zZUJ1dHRvbik7XHJcblxyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGNsb3NlQnV0dG9uLCAnY2xpY2snLCB0aGlzLl9vbkNsb3NlQnV0dG9uQ2xpY2ssIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciB3cmFwcGVyID0gdGhpcy5fd3JhcHBlciA9XHJcblx0XHQgICAgICAgIEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHByZWZpeCArICctY29udGVudC13cmFwcGVyJywgY29udGFpbmVyKTtcclxuXHRcdEwuRG9tRXZlbnQuZGlzYWJsZUNsaWNrUHJvcGFnYXRpb24od3JhcHBlcik7XHJcblxyXG5cdFx0dGhpcy5fY29udGVudE5vZGUgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBwcmVmaXggKyAnLWNvbnRlbnQnLCB3cmFwcGVyKTtcclxuXHJcblx0XHRMLkRvbUV2ZW50LmRpc2FibGVTY3JvbGxQcm9wYWdhdGlvbih0aGlzLl9jb250ZW50Tm9kZSk7XHJcblx0XHRMLkRvbUV2ZW50Lm9uKHdyYXBwZXIsICdjb250ZXh0bWVudScsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcclxuXHJcblx0XHR0aGlzLl90aXBDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBwcmVmaXggKyAnLXRpcC1jb250YWluZXInLCBjb250YWluZXIpO1xyXG5cdFx0dGhpcy5fdGlwID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgcHJlZml4ICsgJy10aXAnLCB0aGlzLl90aXBDb250YWluZXIpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX2NvbnRlbnQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jb250ZW50ID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHR0aGlzLl9jb250ZW50Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9jb250ZW50O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0d2hpbGUgKHRoaXMuX2NvbnRlbnROb2RlLmhhc0NoaWxkTm9kZXMoKSkge1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRlbnROb2RlLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2NvbnRlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuX2NvbnRlbnQpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5maXJlKCdjb250ZW50dXBkYXRlJyk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZUxheW91dDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRlbnROb2RlLFxyXG5cdFx0ICAgIHN0eWxlID0gY29udGFpbmVyLnN0eWxlO1xyXG5cclxuXHRcdHN0eWxlLndpZHRoID0gJyc7XHJcblx0XHRzdHlsZS53aGl0ZVNwYWNlID0gJ25vd3JhcCc7XHJcblxyXG5cdFx0dmFyIHdpZHRoID0gY29udGFpbmVyLm9mZnNldFdpZHRoO1xyXG5cdFx0d2lkdGggPSBNYXRoLm1pbih3aWR0aCwgdGhpcy5vcHRpb25zLm1heFdpZHRoKTtcclxuXHRcdHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIHRoaXMub3B0aW9ucy5taW5XaWR0aCk7XHJcblxyXG5cdFx0c3R5bGUud2lkdGggPSAod2lkdGggKyAxKSArICdweCc7XHJcblx0XHRzdHlsZS53aGl0ZVNwYWNlID0gJyc7XHJcblxyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gJyc7XHJcblxyXG5cdFx0dmFyIGhlaWdodCA9IGNvbnRhaW5lci5vZmZzZXRIZWlnaHQsXHJcblx0XHQgICAgbWF4SGVpZ2h0ID0gdGhpcy5vcHRpb25zLm1heEhlaWdodCxcclxuXHRcdCAgICBzY3JvbGxlZENsYXNzID0gJ2xlYWZsZXQtcG9wdXAtc2Nyb2xsZWQnO1xyXG5cclxuXHRcdGlmIChtYXhIZWlnaHQgJiYgaGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XHJcblx0XHRcdHN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCc7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsIHNjcm9sbGVkQ2xhc3MpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKGNvbnRhaW5lciwgc2Nyb2xsZWRDbGFzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyV2lkdGggPSB0aGlzLl9jb250YWluZXIub2Zmc2V0V2lkdGg7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX21hcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpLFxyXG5cdFx0ICAgIGFuaW1hdGVkID0gdGhpcy5fYW5pbWF0ZWQsXHJcblx0XHQgICAgb2Zmc2V0ID0gTC5wb2ludCh0aGlzLm9wdGlvbnMub2Zmc2V0KTtcclxuXHJcblx0XHRpZiAoYW5pbWF0ZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NvbnRhaW5lciwgcG9zKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXJCb3R0b20gPSAtb2Zmc2V0LnkgLSAoYW5pbWF0ZWQgPyAwIDogcG9zLnkpO1xyXG5cdFx0dGhpcy5fY29udGFpbmVyTGVmdCA9IC1NYXRoLnJvdW5kKHRoaXMuX2NvbnRhaW5lcldpZHRoIC8gMikgKyBvZmZzZXQueCArIChhbmltYXRlZCA/IDAgOiBwb3MueCk7XHJcblxyXG5cdFx0Ly8gYm90dG9tIHBvc2l0aW9uIHRoZSBwb3B1cCBpbiBjYXNlIHRoZSBoZWlnaHQgb2YgdGhlIHBvcHVwIGNoYW5nZXMgKGltYWdlcyBsb2FkaW5nIGV0YylcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS5ib3R0b20gPSB0aGlzLl9jb250YWluZXJCb3R0b20gKyAncHgnO1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLmxlZnQgPSB0aGlzLl9jb250YWluZXJMZWZ0ICsgJ3B4JztcclxuXHR9LFxyXG5cclxuXHRfem9vbUFuaW1hdGlvbjogZnVuY3Rpb24gKG9wdCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuX21hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KHRoaXMuX2xhdGxuZywgb3B0Lnpvb20sIG9wdC5jZW50ZXIpO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jb250YWluZXIsIHBvcyk7XHJcblx0fSxcclxuXHJcblx0X2FkanVzdFBhbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYXV0b1BhbikgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuX2NvbnRhaW5lci5vZmZzZXRIZWlnaHQsXHJcblx0XHQgICAgY29udGFpbmVyV2lkdGggPSB0aGlzLl9jb250YWluZXJXaWR0aCxcclxuXHJcblx0XHQgICAgbGF5ZXJQb3MgPSBuZXcgTC5Qb2ludCh0aGlzLl9jb250YWluZXJMZWZ0LCAtY29udGFpbmVySGVpZ2h0IC0gdGhpcy5fY29udGFpbmVyQm90dG9tKTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0bGF5ZXJQb3MuX2FkZChMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fY29udGFpbmVyKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNvbnRhaW5lclBvcyA9IG1hcC5sYXllclBvaW50VG9Db250YWluZXJQb2ludChsYXllclBvcyksXHJcblx0XHQgICAgcGFkZGluZyA9IEwucG9pbnQodGhpcy5vcHRpb25zLmF1dG9QYW5QYWRkaW5nKSxcclxuXHRcdCAgICBwYWRkaW5nVEwgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5hdXRvUGFuUGFkZGluZ1RvcExlZnQgfHwgcGFkZGluZyksXHJcblx0XHQgICAgcGFkZGluZ0JSID0gTC5wb2ludCh0aGlzLm9wdGlvbnMuYXV0b1BhblBhZGRpbmdCb3R0b21SaWdodCB8fCBwYWRkaW5nKSxcclxuXHRcdCAgICBzaXplID0gbWFwLmdldFNpemUoKSxcclxuXHRcdCAgICBkeCA9IDAsXHJcblx0XHQgICAgZHkgPSAwO1xyXG5cclxuXHRcdGlmIChjb250YWluZXJQb3MueCArIGNvbnRhaW5lcldpZHRoICsgcGFkZGluZ0JSLnggPiBzaXplLngpIHsgLy8gcmlnaHRcclxuXHRcdFx0ZHggPSBjb250YWluZXJQb3MueCArIGNvbnRhaW5lcldpZHRoIC0gc2l6ZS54ICsgcGFkZGluZ0JSLng7XHJcblx0XHR9XHJcblx0XHRpZiAoY29udGFpbmVyUG9zLnggLSBkeCAtIHBhZGRpbmdUTC54IDwgMCkgeyAvLyBsZWZ0XHJcblx0XHRcdGR4ID0gY29udGFpbmVyUG9zLnggLSBwYWRkaW5nVEwueDtcclxuXHRcdH1cclxuXHRcdGlmIChjb250YWluZXJQb3MueSArIGNvbnRhaW5lckhlaWdodCArIHBhZGRpbmdCUi55ID4gc2l6ZS55KSB7IC8vIGJvdHRvbVxyXG5cdFx0XHRkeSA9IGNvbnRhaW5lclBvcy55ICsgY29udGFpbmVySGVpZ2h0IC0gc2l6ZS55ICsgcGFkZGluZ0JSLnk7XHJcblx0XHR9XHJcblx0XHRpZiAoY29udGFpbmVyUG9zLnkgLSBkeSAtIHBhZGRpbmdUTC55IDwgMCkgeyAvLyB0b3BcclxuXHRcdFx0ZHkgPSBjb250YWluZXJQb3MueSAtIHBhZGRpbmdUTC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkeCB8fCBkeSkge1xyXG5cdFx0XHRtYXBcclxuXHRcdFx0ICAgIC5maXJlKCdhdXRvcGFuc3RhcnQnKVxyXG5cdFx0XHQgICAgLnBhbkJ5KFtkeCwgZHldKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25DbG9zZUJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fY2xvc2UoKTtcclxuXHRcdEwuRG9tRXZlbnQuc3RvcChlKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5wb3B1cCA9IGZ1bmN0aW9uIChvcHRpb25zLCBzb3VyY2UpIHtcclxuXHRyZXR1cm4gbmV3IEwuUG9wdXAob3B0aW9ucywgc291cmNlKTtcclxufTtcclxuXHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRvcGVuUG9wdXA6IGZ1bmN0aW9uIChwb3B1cCwgbGF0bG5nLCBvcHRpb25zKSB7IC8vIChQb3B1cCkgb3IgKFN0cmluZyB8fCBIVE1MRWxlbWVudCwgTGF0TG5nWywgT2JqZWN0XSlcclxuXHRcdHRoaXMuY2xvc2VQb3B1cCgpO1xyXG5cclxuXHRcdGlmICghKHBvcHVwIGluc3RhbmNlb2YgTC5Qb3B1cCkpIHtcclxuXHRcdFx0dmFyIGNvbnRlbnQgPSBwb3B1cDtcclxuXHJcblx0XHRcdHBvcHVwID0gbmV3IEwuUG9wdXAob3B0aW9ucylcclxuXHRcdFx0ICAgIC5zZXRMYXRMbmcobGF0bG5nKVxyXG5cdFx0XHQgICAgLnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblx0XHRwb3B1cC5faXNPcGVuID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLl9wb3B1cCA9IHBvcHVwO1xyXG5cdFx0cmV0dXJuIHRoaXMuYWRkTGF5ZXIocG9wdXApO1xyXG5cdH0sXHJcblxyXG5cdGNsb3NlUG9wdXA6IGZ1bmN0aW9uIChwb3B1cCkge1xyXG5cdFx0aWYgKCFwb3B1cCB8fCBwb3B1cCA9PT0gdGhpcy5fcG9wdXApIHtcclxuXHRcdFx0cG9wdXAgPSB0aGlzLl9wb3B1cDtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHBvcHVwKSB7XHJcblx0XHRcdHRoaXMucmVtb3ZlTGF5ZXIocG9wdXApO1xyXG5cdFx0XHRwb3B1cC5faXNPcGVuID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogUG9wdXAgZXh0ZW5zaW9uIHRvIEwuTWFya2VyLCBhZGRpbmcgcG9wdXAtcmVsYXRlZCBtZXRob2RzLlxyXG4gKi9cclxuXHJcbkwuTWFya2VyLmluY2x1ZGUoe1xyXG5cdG9wZW5Qb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwICYmIHRoaXMuX21hcCAmJiAhdGhpcy5fbWFwLmhhc0xheWVyKHRoaXMuX3BvcHVwKSkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cC5zZXRMYXRMbmcodGhpcy5fbGF0bG5nKTtcclxuXHRcdFx0dGhpcy5fbWFwLm9wZW5Qb3B1cCh0aGlzLl9wb3B1cCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLl9jbG9zZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dG9nZ2xlUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHRpZiAodGhpcy5fcG9wdXAuX2lzT3Blbikge1xyXG5cdFx0XHRcdHRoaXMuY2xvc2VQb3B1cCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMub3BlblBvcHVwKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGJpbmRQb3B1cDogZnVuY3Rpb24gKGNvbnRlbnQsIG9wdGlvbnMpIHtcclxuXHRcdHZhciBhbmNob3IgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5pY29uLm9wdGlvbnMucG9wdXBBbmNob3IgfHwgWzAsIDBdKTtcclxuXHJcblx0XHRhbmNob3IgPSBhbmNob3IuYWRkKEwuUG9wdXAucHJvdG90eXBlLm9wdGlvbnMub2Zmc2V0KTtcclxuXHJcblx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLm9mZnNldCkge1xyXG5cdFx0XHRhbmNob3IgPSBhbmNob3IuYWRkKG9wdGlvbnMub2Zmc2V0KTtcclxuXHRcdH1cclxuXHJcblx0XHRvcHRpb25zID0gTC5leHRlbmQoe29mZnNldDogYW5jaG9yfSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9uKCdjbGljaycsIHRoaXMudG9nZ2xlUG9wdXAsIHRoaXMpXHJcblx0XHRcdCAgICAub24oJ3JlbW92ZScsIHRoaXMuY2xvc2VQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vbignbW92ZScsIHRoaXMuX21vdmVQb3B1cCwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBMLlBvcHVwKSB7XHJcblx0XHRcdEwuc2V0T3B0aW9ucyhjb250ZW50LCBvcHRpb25zKTtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBjb250ZW50O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBuZXcgTC5Qb3B1cChvcHRpb25zLCB0aGlzKVxyXG5cdFx0XHRcdC5zZXRDb250ZW50KGNvbnRlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvcHVwQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dW5iaW5kUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG51bGw7XHJcblx0XHRcdHRoaXNcclxuXHRcdFx0ICAgIC5vZmYoJ2NsaWNrJywgdGhpcy50b2dnbGVQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vZmYoJ3JlbW92ZScsIHRoaXMuY2xvc2VQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vZmYoJ21vdmUnLCB0aGlzLl9tb3ZlUG9wdXAsIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldFBvcHVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcG9wdXA7XHJcblx0fSxcclxuXHJcblx0X21vdmVQb3B1cDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyhlLmxhdGxuZyk7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuTGF5ZXJHcm91cCBpcyBhIGNsYXNzIHRvIGNvbWJpbmUgc2V2ZXJhbCBsYXllcnMgaW50byBvbmUgc28gdGhhdFxyXG4gKiB5b3UgY2FuIG1hbmlwdWxhdGUgdGhlIGdyb3VwIChlLmcuIGFkZC9yZW1vdmUgaXQpIGFzIG9uZSBsYXllci5cclxuICovXHJcblxyXG5MLkxheWVyR3JvdXAgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxheWVycykge1xyXG5cdFx0dGhpcy5fbGF5ZXJzID0ge307XHJcblxyXG5cdFx0dmFyIGksIGxlbjtcclxuXHJcblx0XHRpZiAobGF5ZXJzKSB7XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxheWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuYWRkTGF5ZXIobGF5ZXJzW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZExheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IHRoaXMuZ2V0TGF5ZXJJZChsYXllcik7XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fbWFwLmFkZExheWVyKGxheWVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHR2YXIgaWQgPSBsYXllciBpbiB0aGlzLl9sYXllcnMgPyBsYXllciA6IHRoaXMuZ2V0TGF5ZXJJZChsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCAmJiB0aGlzLl9sYXllcnNbaWRdKSB7XHJcblx0XHRcdHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9sYXllcnNbaWRdKTtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgdGhpcy5fbGF5ZXJzW2lkXTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRoYXNMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIWxheWVyKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdHJldHVybiAobGF5ZXIgaW4gdGhpcy5fbGF5ZXJzIHx8IHRoaXMuZ2V0TGF5ZXJJZChsYXllcikgaW4gdGhpcy5fbGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHRjbGVhckxheWVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5lYWNoTGF5ZXIodGhpcy5yZW1vdmVMYXllciwgdGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRpbnZva2U6IGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XHJcblx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcblx0XHQgICAgaSwgbGF5ZXI7XHJcblxyXG5cdFx0Zm9yIChpIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRsYXllciA9IHRoaXMuX2xheWVyc1tpXTtcclxuXHJcblx0XHRcdGlmIChsYXllclttZXRob2ROYW1lXSkge1xyXG5cdFx0XHRcdGxheWVyW21ldGhvZE5hbWVdLmFwcGx5KGxheWVyLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblx0XHR0aGlzLmVhY2hMYXllcihtYXAuYWRkTGF5ZXIsIG1hcCk7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuZWFjaExheWVyKG1hcC5yZW1vdmVMYXllciwgbWFwKTtcclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0YWRkVG86IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5hZGRMYXllcih0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGVhY2hMYXllcjogZnVuY3Rpb24gKG1ldGhvZCwgY29udGV4dCkge1xyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9sYXllcnMpIHtcclxuXHRcdFx0bWV0aG9kLmNhbGwoY29udGV4dCwgdGhpcy5fbGF5ZXJzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVyOiBmdW5jdGlvbiAoaWQpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXllcnNbaWRdO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxheWVycyA9IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdGxheWVycy5wdXNoKHRoaXMuX2xheWVyc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbGF5ZXJzO1xyXG5cdH0sXHJcblxyXG5cdHNldFpJbmRleDogZnVuY3Rpb24gKHpJbmRleCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdzZXRaSW5kZXgnLCB6SW5kZXgpO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVySWQ6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0cmV0dXJuIEwuc3RhbXAobGF5ZXIpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmxheWVyR3JvdXAgPSBmdW5jdGlvbiAobGF5ZXJzKSB7XHJcblx0cmV0dXJuIG5ldyBMLkxheWVyR3JvdXAobGF5ZXJzKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuRmVhdHVyZUdyb3VwIGV4dGVuZHMgTC5MYXllckdyb3VwIGJ5IGludHJvZHVjaW5nIG1vdXNlIGV2ZW50cyBhbmQgYWRkaXRpb25hbCBtZXRob2RzXHJcbiAqIHNoYXJlZCBiZXR3ZWVuIGEgZ3JvdXAgb2YgaW50ZXJhY3RpdmUgbGF5ZXJzIChsaWtlIHZlY3RvcnMgb3IgbWFya2VycykuXHJcbiAqL1xyXG5cclxuTC5GZWF0dXJlR3JvdXAgPSBMLkxheWVyR3JvdXAuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdHN0YXRpY3M6IHtcclxuXHRcdEVWRU5UUzogJ2NsaWNrIGRibGNsaWNrIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZW1vdmUgY29udGV4dG1lbnUgcG9wdXBvcGVuIHBvcHVwY2xvc2UnXHJcblx0fSxcclxuXHJcblx0YWRkTGF5ZXI6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0aWYgKHRoaXMuaGFzTGF5ZXIobGF5ZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICgnb24nIGluIGxheWVyKSB7XHJcblx0XHRcdGxheWVyLm9uKEwuRmVhdHVyZUdyb3VwLkVWRU5UUywgdGhpcy5fcHJvcGFnYXRlRXZlbnQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEwuTGF5ZXJHcm91cC5wcm90b3R5cGUuYWRkTGF5ZXIuY2FsbCh0aGlzLCBsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwQ29udGVudCAmJiBsYXllci5iaW5kUG9wdXApIHtcclxuXHRcdFx0bGF5ZXIuYmluZFBvcHVwKHRoaXMuX3BvcHVwQ29udGVudCwgdGhpcy5fcG9wdXBPcHRpb25zKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5maXJlKCdsYXllcmFkZCcsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIXRoaXMuaGFzTGF5ZXIobGF5ZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGxheWVyIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRsYXllciA9IHRoaXMuX2xheWVyc1tsYXllcl07XHJcblx0XHR9XHJcblxyXG5cdFx0bGF5ZXIub2ZmKEwuRmVhdHVyZUdyb3VwLkVWRU5UUywgdGhpcy5fcHJvcGFnYXRlRXZlbnQsIHRoaXMpO1xyXG5cclxuXHRcdEwuTGF5ZXJHcm91cC5wcm90b3R5cGUucmVtb3ZlTGF5ZXIuY2FsbCh0aGlzLCBsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwQ29udGVudCkge1xyXG5cdFx0XHR0aGlzLmludm9rZSgndW5iaW5kUG9wdXAnKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5maXJlKCdsYXllcnJlbW92ZScsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHRiaW5kUG9wdXA6IGZ1bmN0aW9uIChjb250ZW50LCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLl9wb3B1cENvbnRlbnQgPSBjb250ZW50O1xyXG5cdFx0dGhpcy5fcG9wdXBPcHRpb25zID0gb3B0aW9ucztcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYmluZFBvcHVwJywgY29udGVudCwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0b3BlblBvcHVwOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHQvLyBvcGVuIHBvcHVwIG9uIHRoZSBmaXJzdCBsYXllclxyXG5cdFx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdHRoaXMuX2xheWVyc1tpZF0ub3BlblBvcHVwKGxhdGxuZyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdzZXRTdHlsZScsIHN0eWxlKTtcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYnJpbmdUb0Zyb250Jyk7XHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0JhY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYnJpbmdUb0JhY2snKTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBib3VuZHMgPSBuZXcgTC5MYXRMbmdCb3VuZHMoKTtcclxuXHJcblx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0Ym91bmRzLmV4dGVuZChsYXllciBpbnN0YW5jZW9mIEwuTWFya2VyID8gbGF5ZXIuZ2V0TGF0TG5nKCkgOiBsYXllci5nZXRCb3VuZHMoKSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gYm91bmRzO1xyXG5cdH0sXHJcblxyXG5cdF9wcm9wYWdhdGVFdmVudDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGUgPSBMLmV4dGVuZCh7XHJcblx0XHRcdGxheWVyOiBlLnRhcmdldCxcclxuXHRcdFx0dGFyZ2V0OiB0aGlzXHJcblx0XHR9LCBlKTtcclxuXHRcdHRoaXMuZmlyZShlLnR5cGUsIGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmZlYXR1cmVHcm91cCA9IGZ1bmN0aW9uIChsYXllcnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuRmVhdHVyZUdyb3VwKGxheWVycyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlBhdGggaXMgYSBiYXNlIGNsYXNzIGZvciByZW5kZXJpbmcgdmVjdG9yIHBhdGhzIG9uIGEgbWFwLiBJbmhlcml0ZWQgYnkgUG9seWxpbmUsIENpcmNsZSwgZXRjLlxyXG4gKi9cclxuXHJcbkwuUGF0aCA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogW0wuTWl4aW4uRXZlbnRzXSxcclxuXHJcblx0c3RhdGljczoge1xyXG5cdFx0Ly8gaG93IG11Y2ggdG8gZXh0ZW5kIHRoZSBjbGlwIGFyZWEgYXJvdW5kIHRoZSBtYXAgdmlld1xyXG5cdFx0Ly8gKHJlbGF0aXZlIHRvIGl0cyBzaXplLCBlLmcuIDAuNSBpcyBoYWxmIHRoZSBzY3JlZW4gaW4gZWFjaCBkaXJlY3Rpb24pXHJcblx0XHQvLyBzZXQgaXQgc28gdGhhdCBTVkcgZWxlbWVudCBkb2Vzbid0IGV4Y2VlZCAxMjgwcHggKHZlY3RvcnMgZmxpY2tlciBvbiBkcmFnZW5kIGlmIGl0IGlzKVxyXG5cdFx0Q0xJUF9QQURESU5HOiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR2YXIgbWF4ID0gTC5Ccm93c2VyLm1vYmlsZSA/IDEyODAgOiAyMDAwLFxyXG5cdFx0XHQgICAgdGFyZ2V0ID0gKG1heCAvIE1hdGgubWF4KHdpbmRvdy5vdXRlcldpZHRoLCB3aW5kb3cub3V0ZXJIZWlnaHQpIC0gMSkgLyAyO1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMC41LCB0YXJnZXQpKTtcclxuXHRcdH0pKClcclxuXHR9LFxyXG5cclxuXHRvcHRpb25zOiB7XHJcblx0XHRzdHJva2U6IHRydWUsXHJcblx0XHRjb2xvcjogJyMwMDMzZmYnLFxyXG5cdFx0ZGFzaEFycmF5OiBudWxsLFxyXG5cdFx0bGluZUNhcDogbnVsbCxcclxuXHRcdGxpbmVKb2luOiBudWxsLFxyXG5cdFx0d2VpZ2h0OiA1LFxyXG5cdFx0b3BhY2l0eTogMC41LFxyXG5cclxuXHRcdGZpbGw6IGZhbHNlLFxyXG5cdFx0ZmlsbENvbG9yOiBudWxsLCAvL3NhbWUgYXMgY29sb3IgYnkgZGVmYXVsdFxyXG5cdFx0ZmlsbE9wYWNpdHk6IDAuMixcclxuXHJcblx0XHRjbGlja2FibGU6IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0dGhpcy5faW5pdEVsZW1lbnRzKCk7XHJcblx0XHRcdHRoaXMuX2luaXRFdmVudHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnByb2plY3RMYXRsbmdzKCk7XHJcblx0XHR0aGlzLl91cGRhdGVQYXRoKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9tYXAuX3BhdGhSb290LmFwcGVuZENoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdhZGQnKTtcclxuXHJcblx0XHRtYXAub24oe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5wcm9qZWN0TGF0bG5ncyxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVQYXRoXHJcblx0XHR9LCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5fcGF0aFJvb3QucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHQvLyBOZWVkIHRvIGZpcmUgcmVtb3ZlIGV2ZW50IGJlZm9yZSB3ZSBzZXQgX21hcCB0byBudWxsIGFzIHRoZSBldmVudCBob29rcyBtaWdodCBuZWVkIHRoZSBvYmplY3RcclxuXHRcdHRoaXMuZmlyZSgncmVtb3ZlJyk7XHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIudm1sKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3N0cm9rZSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX2ZpbGwgPSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdG1hcC5vZmYoe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5wcm9qZWN0TGF0bG5ncyxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVQYXRoXHJcblx0XHR9LCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0Ly8gZG8gYWxsIHByb2plY3Rpb24gc3R1ZmYgaGVyZVxyXG5cdH0sXHJcblxyXG5cdHNldFN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBzdHlsZSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlZHJhdzogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLnByb2plY3RMYXRsbmdzKCk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVBhdGgoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRfdXBkYXRlUGF0aFZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcCA9IEwuUGF0aC5DTElQX1BBRERJTkcsXHJcblx0XHQgICAgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpLFxyXG5cdFx0ICAgIHBhbmVQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fbWFwUGFuZSksXHJcblx0XHQgICAgbWluID0gcGFuZVBvcy5tdWx0aXBseUJ5KC0xKS5fc3VidHJhY3Qoc2l6ZS5tdWx0aXBseUJ5KHApLl9yb3VuZCgpKSxcclxuXHRcdCAgICBtYXggPSBtaW4uYWRkKHNpemUubXVsdGlwbHlCeSgxICsgcCAqIDIpLl9yb3VuZCgpKTtcclxuXHJcblx0XHR0aGlzLl9wYXRoVmlld3BvcnQgPSBuZXcgTC5Cb3VuZHMobWluLCBtYXgpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBFeHRlbmRzIEwuUGF0aCB3aXRoIFNWRy1zcGVjaWZpYyByZW5kZXJpbmcgY29kZS5cclxuICovXHJcblxyXG5MLlBhdGguU1ZHX05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcclxuXHJcbkwuQnJvd3Nlci5zdmcgPSAhIShkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEwuUGF0aC5TVkdfTlMsICdzdmcnKS5jcmVhdGVTVkdSZWN0KTtcclxuXHJcbkwuUGF0aCA9IEwuUGF0aC5leHRlbmQoe1xyXG5cdHN0YXRpY3M6IHtcclxuXHRcdFNWRzogTC5Ccm93c2VyLnN2Z1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9Gcm9udDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzLl9tYXAuX3BhdGhSb290LFxyXG5cdFx0ICAgIHBhdGggPSB0aGlzLl9jb250YWluZXI7XHJcblxyXG5cdFx0aWYgKHBhdGggJiYgcm9vdC5sYXN0Q2hpbGQgIT09IHBhdGgpIHtcclxuXHRcdFx0cm9vdC5hcHBlbmRDaGlsZChwYXRoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9CYWNrOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcm9vdCA9IHRoaXMuX21hcC5fcGF0aFJvb3QsXHJcblx0XHQgICAgcGF0aCA9IHRoaXMuX2NvbnRhaW5lcixcclxuXHRcdCAgICBmaXJzdCA9IHJvb3QuZmlyc3RDaGlsZDtcclxuXHJcblx0XHRpZiAocGF0aCAmJiBmaXJzdCAhPT0gcGF0aCkge1xyXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShwYXRoLCBmaXJzdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRnZXRQYXRoU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyBmb3JtIHBhdGggc3RyaW5nIGhlcmVcclxuXHR9LFxyXG5cclxuXHRfY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUpIHtcclxuXHRcdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoTC5QYXRoLlNWR19OUywgbmFtZSk7XHJcblx0fSxcclxuXHJcblx0X2luaXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fbWFwLl9pbml0UGF0aFJvb3QoKTtcclxuXHRcdHRoaXMuX2luaXRQYXRoKCk7XHJcblx0XHR0aGlzLl9pbml0U3R5bGUoKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdFBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ2cnKTtcclxuXHJcblx0XHR0aGlzLl9wYXRoID0gdGhpcy5fY3JlYXRlRWxlbWVudCgncGF0aCcpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xhc3NOYW1lKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9wYXRoLCB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcGF0aCk7XHJcblx0fSxcclxuXHJcblx0X2luaXRTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1saW5lam9pbicsICdyb3VuZCcpO1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbC1ydWxlJywgJ2V2ZW5vZGQnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucG9pbnRlckV2ZW50cykge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgncG9pbnRlci1ldmVudHMnLCB0aGlzLm9wdGlvbnMucG9pbnRlckV2ZW50cyk7XHJcblx0XHR9XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5jbGlja2FibGUgJiYgIXRoaXMub3B0aW9ucy5wb2ludGVyRXZlbnRzKSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIHRoaXMub3B0aW9ucy5jb2xvcik7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2Utb3BhY2l0eScsIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIHRoaXMub3B0aW9ucy53ZWlnaHQpO1xyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmRhc2hBcnJheSkge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtZGFzaGFycmF5JywgdGhpcy5vcHRpb25zLmRhc2hBcnJheSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fcGF0aC5yZW1vdmVBdHRyaWJ1dGUoJ3N0cm9rZS1kYXNoYXJyYXknKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmxpbmVDYXApIHtcclxuXHRcdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVjYXAnLCB0aGlzLm9wdGlvbnMubGluZUNhcCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5saW5lSm9pbikge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtbGluZWpvaW4nLCB0aGlzLm9wdGlvbnMubGluZUpvaW4pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsIHRoaXMub3B0aW9ucy5maWxsQ29sb3IgfHwgdGhpcy5vcHRpb25zLmNvbG9yKTtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ2ZpbGwtb3BhY2l0eScsIHRoaXMub3B0aW9ucy5maWxsT3BhY2l0eSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsICdub25lJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHIgPSB0aGlzLmdldFBhdGhTdHJpbmcoKTtcclxuXHRcdGlmICghc3RyKSB7XHJcblx0XHRcdC8vIGZpeCB3ZWJraXQgZW1wdHkgc3RyaW5nIHBhcnNpbmcgYnVnXHJcblx0XHRcdHN0ciA9ICdNMCAwJztcclxuXHRcdH1cclxuXHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdkJywgc3RyKTtcclxuXHR9LFxyXG5cclxuXHQvLyBUT0RPIHJlbW92ZSBkdXBsaWNhdGlvbiB3aXRoIEwuTWFwXHJcblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7XHJcblx0XHRcdGlmIChMLkJyb3dzZXIuc3ZnIHx8ICFMLkJyb3dzZXIudm1sKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGgsICdsZWFmbGV0LWNsaWNrYWJsZScpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2NvbnRhaW5lciwgJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrLCB0aGlzKTtcclxuXHJcblx0XHRcdHZhciBldmVudHMgPSBbJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZW92ZXInLFxyXG5cdFx0XHQgICAgICAgICAgICAgICdtb3VzZW91dCcsICdtb3VzZW1vdmUnLCAnY29udGV4dG1lbnUnXTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2NvbnRhaW5lciwgZXZlbnRzW2ldLCB0aGlzLl9maXJlTW91c2VFdmVudCwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25Nb3VzZUNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKHRoaXMuX21hcC5kcmFnZ2luZyAmJiB0aGlzLl9tYXAuZHJhZ2dpbmcubW92ZWQoKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLl9maXJlTW91c2VFdmVudChlKTtcclxuXHR9LFxyXG5cclxuXHRfZmlyZU1vdXNlRXZlbnQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcnMoZS50eXBlKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGNvbnRhaW5lclBvaW50ID0gbWFwLm1vdXNlRXZlbnRUb0NvbnRhaW5lclBvaW50KGUpLFxyXG5cdFx0ICAgIGxheWVyUG9pbnQgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoY29udGFpbmVyUG9pbnQpLFxyXG5cdFx0ICAgIGxhdGxuZyA9IG1hcC5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwge1xyXG5cdFx0XHRsYXRsbmc6IGxhdGxuZyxcclxuXHRcdFx0bGF5ZXJQb2ludDogbGF5ZXJQb2ludCxcclxuXHRcdFx0Y29udGFpbmVyUG9pbnQ6IGNvbnRhaW5lclBvaW50LFxyXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBlXHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAoZS50eXBlID09PSAnY29udGV4dG1lbnUnKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZS50eXBlICE9PSAnbW91c2Vtb3ZlJykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAuaW5jbHVkZSh7XHJcblx0X2luaXRQYXRoUm9vdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9wYXRoUm9vdCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoUm9vdCA9IEwuUGF0aC5wcm90b3R5cGUuX2NyZWF0ZUVsZW1lbnQoJ3N2ZycpO1xyXG5cdFx0XHR0aGlzLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9wYXRoUm9vdCk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5Ccm93c2VyLmFueTNkKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGhSb290LCAnbGVhZmxldC16b29tLWFuaW1hdGVkJyk7XHJcblxyXG5cdFx0XHRcdHRoaXMub24oe1xyXG5cdFx0XHRcdFx0J3pvb21hbmltJzogdGhpcy5fYW5pbWF0ZVBhdGhab29tLFxyXG5cdFx0XHRcdFx0J3pvb21lbmQnOiB0aGlzLl9lbmRQYXRoWm9vbVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9wYXRoUm9vdCwgJ2xlYWZsZXQtem9vbS1oaWRlJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVTdmdWaWV3cG9ydCk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVN2Z1ZpZXdwb3J0KCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2FuaW1hdGVQYXRoWm9vbTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuZ2V0Wm9vbVNjYWxlKGUuem9vbSksXHJcblx0XHQgICAgb2Zmc2V0ID0gdGhpcy5fZ2V0Q2VudGVyT2Zmc2V0KGUuY2VudGVyKS5fbXVsdGlwbHlCeSgtc2NhbGUpLl9hZGQodGhpcy5fcGF0aFZpZXdwb3J0Lm1pbik7XHJcblxyXG5cdFx0dGhpcy5fcGF0aFJvb3Quc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPVxyXG5cdFx0ICAgICAgICBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKG9mZnNldCkgKyAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblxyXG5cdFx0dGhpcy5fcGF0aFpvb21pbmcgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdF9lbmRQYXRoWm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fcGF0aFpvb21pbmcgPSBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3ZnVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fcGF0aFpvb21pbmcpIHtcclxuXHRcdFx0Ly8gRG8gbm90IHVwZGF0ZSBTVkdzIHdoaWxlIGEgem9vbSBhbmltYXRpb24gaXMgZ29pbmcgb24gb3RoZXJ3aXNlIHRoZSBhbmltYXRpb24gd2lsbCBicmVhay5cclxuXHRcdFx0Ly8gV2hlbiB0aGUgem9vbSBhbmltYXRpb24gZW5kcyB3ZSB3aWxsIGJlIHVwZGF0ZWQgYWdhaW4gYW55d2F5XHJcblx0XHRcdC8vIFRoaXMgZml4ZXMgdGhlIGNhc2Ugd2hlcmUgeW91IGRvIGEgbW9tZW50dW0gbW92ZSBhbmQgem9vbSB3aGlsZSB0aGUgbW92ZSBpcyBzdGlsbCBvbmdvaW5nLlxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KCk7XHJcblxyXG5cdFx0dmFyIHZwID0gdGhpcy5fcGF0aFZpZXdwb3J0LFxyXG5cdFx0ICAgIG1pbiA9IHZwLm1pbixcclxuXHRcdCAgICBtYXggPSB2cC5tYXgsXHJcblx0XHQgICAgd2lkdGggPSBtYXgueCAtIG1pbi54LFxyXG5cdFx0ICAgIGhlaWdodCA9IG1heC55IC0gbWluLnksXHJcblx0XHQgICAgcm9vdCA9IHRoaXMuX3BhdGhSb290LFxyXG5cdFx0ICAgIHBhbmUgPSB0aGlzLl9wYW5lcy5vdmVybGF5UGFuZTtcclxuXHJcblx0XHQvLyBIYWNrIHRvIG1ha2UgZmxpY2tlciBvbiBkcmFnIGVuZCBvbiBtb2JpbGUgd2Via2l0IGxlc3MgaXJyaXRhdGluZ1xyXG5cdFx0aWYgKEwuQnJvd3Nlci5tb2JpbGVXZWJraXQpIHtcclxuXHRcdFx0cGFuZS5yZW1vdmVDaGlsZChyb290KTtcclxuXHRcdH1cclxuXHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24ocm9vdCwgbWluKTtcclxuXHRcdHJvb3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcclxuXHRcdHJvb3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xyXG5cdFx0cm9vdC5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCBbbWluLngsIG1pbi55LCB3aWR0aCwgaGVpZ2h0XS5qb2luKCcgJykpO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIubW9iaWxlV2Via2l0KSB7XHJcblx0XHRcdHBhbmUuYXBwZW5kQ2hpbGQocm9vdCk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIFBvcHVwIGV4dGVuc2lvbiB0byBMLlBhdGggKHBvbHlsaW5lcywgcG9seWdvbnMsIGNpcmNsZXMpLCBhZGRpbmcgcG9wdXAtcmVsYXRlZCBtZXRob2RzLlxyXG4gKi9cclxuXHJcbkwuUGF0aC5pbmNsdWRlKHtcclxuXHJcblx0YmluZFBvcHVwOiBmdW5jdGlvbiAoY29udGVudCwgb3B0aW9ucykge1xyXG5cclxuXHRcdGlmIChjb250ZW50IGluc3RhbmNlb2YgTC5Qb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IGNvbnRlbnQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3BvcHVwIHx8IG9wdGlvbnMpIHtcclxuXHRcdFx0XHR0aGlzLl9wb3B1cCA9IG5ldyBMLlBvcHVwKG9wdGlvbnMsIHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX3BvcHVwLnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9uKCdjbGljaycsIHRoaXMuX29wZW5Qb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vbigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwLCB0aGlzKTtcclxuXHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dW5iaW5kUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG51bGw7XHJcblx0XHRcdHRoaXNcclxuXHRcdFx0ICAgIC5vZmYoJ2NsaWNrJywgdGhpcy5fb3BlblBvcHVwKVxyXG5cdFx0XHQgICAgLm9mZigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwKTtcclxuXHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b3BlblBvcHVwOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdC8vIG9wZW4gdGhlIHBvcHVwIGZyb20gb25lIG9mIHRoZSBwYXRoJ3MgcG9pbnRzIGlmIG5vdCBzcGVjaWZpZWRcclxuXHRcdFx0bGF0bG5nID0gbGF0bG5nIHx8IHRoaXMuX2xhdGxuZyB8fFxyXG5cdFx0XHQgICAgICAgICB0aGlzLl9sYXRsbmdzW01hdGguZmxvb3IodGhpcy5fbGF0bG5ncy5sZW5ndGggLyAyKV07XHJcblxyXG5cdFx0XHR0aGlzLl9vcGVuUG9wdXAoe2xhdGxuZzogbGF0bG5nfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLl9jbG9zZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X29wZW5Qb3B1cDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyhlLmxhdGxuZyk7XHJcblx0XHR0aGlzLl9tYXAub3BlblBvcHVwKHRoaXMuX3BvcHVwKTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogVmVjdG9yIHJlbmRlcmluZyBmb3IgSUU2LTggdGhyb3VnaCBWTUwuXHJcbiAqIFRoYW5rcyB0byBEbWl0cnkgQmFyYW5vdnNreSBhbmQgaGlzIFJhcGhhZWwgbGlicmFyeSBmb3IgaW5zcGlyYXRpb24hXHJcbiAqL1xyXG5cclxuTC5Ccm93c2VyLnZtbCA9ICFMLkJyb3dzZXIuc3ZnICYmIChmdW5jdGlvbiAoKSB7XHJcblx0dHJ5IHtcclxuXHRcdHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGRpdi5pbm5lckhUTUwgPSAnPHY6c2hhcGUgYWRqPVwiMVwiLz4nO1xyXG5cclxuXHRcdHZhciBzaGFwZSA9IGRpdi5maXJzdENoaWxkO1xyXG5cdFx0c2hhcGUuc3R5bGUuYmVoYXZpb3IgPSAndXJsKCNkZWZhdWx0I1ZNTCknO1xyXG5cclxuXHRcdHJldHVybiBzaGFwZSAmJiAodHlwZW9mIHNoYXBlLmFkaiA9PT0gJ29iamVjdCcpO1xyXG5cclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59KCkpO1xyXG5cclxuTC5QYXRoID0gTC5Ccm93c2VyLnN2ZyB8fCAhTC5Ccm93c2VyLnZtbCA/IEwuUGF0aCA6IEwuUGF0aC5leHRlbmQoe1xyXG5cdHN0YXRpY3M6IHtcclxuXHRcdFZNTDogdHJ1ZSxcclxuXHRcdENMSVBfUEFERElORzogMC4wMlxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVFbGVtZW50OiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0ZG9jdW1lbnQubmFtZXNwYWNlcy5hZGQoJ2x2bWwnLCAndXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTp2bWwnKTtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJzxsdm1sOicgKyBuYW1lICsgJyBjbGFzcz1cImx2bWxcIj4nKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0ICAgICAgICAnPCcgKyBuYW1lICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJsdm1sXCI+Jyk7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fSgpKSxcclxuXHJcblx0X2luaXRQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnc2hhcGUnKTtcclxuXHJcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC12bWwtc2hhcGUnICtcclxuXHRcdFx0KHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPyAnICcgKyB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lIDogJycpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC1jbGlja2FibGUnKTtcclxuXHRcdH1cclxuXHJcblx0XHRjb250YWluZXIuY29vcmRzaXplID0gJzEgMSc7XHJcblxyXG5cdFx0dGhpcy5fcGF0aCA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ3BhdGgnKTtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9wYXRoKTtcclxuXHJcblx0XHR0aGlzLl9tYXAuX3BhdGhSb290LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcblx0fSxcclxuXHJcblx0X2luaXRTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdXBkYXRlU3R5bGUoKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3R5bGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHJva2UgPSB0aGlzLl9zdHJva2UsXHJcblx0XHQgICAgZmlsbCA9IHRoaXMuX2ZpbGwsXHJcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuXHRcdCAgICBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXI7XHJcblxyXG5cdFx0Y29udGFpbmVyLnN0cm9rZWQgPSBvcHRpb25zLnN0cm9rZTtcclxuXHRcdGNvbnRhaW5lci5maWxsZWQgPSBvcHRpb25zLmZpbGw7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3Ryb2tlKSB7XHJcblx0XHRcdGlmICghc3Ryb2tlKSB7XHJcblx0XHRcdFx0c3Ryb2tlID0gdGhpcy5fc3Ryb2tlID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnc3Ryb2tlJyk7XHJcblx0XHRcdFx0c3Ryb2tlLmVuZGNhcCA9ICdyb3VuZCc7XHJcblx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHN0cm9rZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3Ryb2tlLndlaWdodCA9IG9wdGlvbnMud2VpZ2h0ICsgJ3B4JztcclxuXHRcdFx0c3Ryb2tlLmNvbG9yID0gb3B0aW9ucy5jb2xvcjtcclxuXHRcdFx0c3Ryb2tlLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHk7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5kYXNoQXJyYXkpIHtcclxuXHRcdFx0XHRzdHJva2UuZGFzaFN0eWxlID0gTC5VdGlsLmlzQXJyYXkob3B0aW9ucy5kYXNoQXJyYXkpID9cclxuXHRcdFx0XHQgICAgb3B0aW9ucy5kYXNoQXJyYXkuam9pbignICcpIDpcclxuXHRcdFx0XHQgICAgb3B0aW9ucy5kYXNoQXJyYXkucmVwbGFjZSgvKCAqLCAqKS9nLCAnICcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHN0cm9rZS5kYXNoU3R5bGUgPSAnJztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5saW5lQ2FwKSB7XHJcblx0XHRcdFx0c3Ryb2tlLmVuZGNhcCA9IG9wdGlvbnMubGluZUNhcC5yZXBsYWNlKCdidXR0JywgJ2ZsYXQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5saW5lSm9pbikge1xyXG5cdFx0XHRcdHN0cm9rZS5qb2luc3R5bGUgPSBvcHRpb25zLmxpbmVKb2luO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIGlmIChzdHJva2UpIHtcclxuXHRcdFx0Y29udGFpbmVyLnJlbW92ZUNoaWxkKHN0cm9rZSk7XHJcblx0XHRcdHRoaXMuX3N0cm9rZSA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHRpZiAoIWZpbGwpIHtcclxuXHRcdFx0XHRmaWxsID0gdGhpcy5fZmlsbCA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ2ZpbGwnKTtcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZmlsbC5jb2xvciA9IG9wdGlvbnMuZmlsbENvbG9yIHx8IG9wdGlvbnMuY29sb3I7XHJcblx0XHRcdGZpbGwub3BhY2l0eSA9IG9wdGlvbnMuZmlsbE9wYWNpdHk7XHJcblxyXG5cdFx0fSBlbHNlIGlmIChmaWxsKSB7XHJcblx0XHRcdGNvbnRhaW5lci5yZW1vdmVDaGlsZChmaWxsKTtcclxuXHRcdFx0dGhpcy5fZmlsbCA9IG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHlsZSA9IHRoaXMuX2NvbnRhaW5lci5zdHlsZTtcclxuXHJcblx0XHRzdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdFx0dGhpcy5fcGF0aC52ID0gdGhpcy5nZXRQYXRoU3RyaW5nKCkgKyAnICc7IC8vIHRoZSBzcGFjZSBmaXhlcyBJRSBlbXB0eSBwYXRoIHN0cmluZyBidWdcclxuXHRcdHN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAuaW5jbHVkZShMLkJyb3dzZXIuc3ZnIHx8ICFMLkJyb3dzZXIudm1sID8ge30gOiB7XHJcblx0X2luaXRQYXRoUm9vdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BhdGhSb290KSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciByb290ID0gdGhpcy5fcGF0aFJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdHJvb3QuY2xhc3NOYW1lID0gJ2xlYWZsZXQtdm1sLWNvbnRhaW5lcic7XHJcblx0XHR0aGlzLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZChyb290KTtcclxuXHJcblx0XHR0aGlzLm9uKCdtb3ZlZW5kJywgdGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KTtcclxuXHRcdHRoaXMuX3VwZGF0ZVBhdGhWaWV3cG9ydCgpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBWZWN0b3IgcmVuZGVyaW5nIGZvciBhbGwgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGNhbnZhcy5cclxuICovXHJcblxyXG5MLkJyb3dzZXIuY2FudmFzID0gKGZ1bmN0aW9uICgpIHtcclxuXHRyZXR1cm4gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0O1xyXG59KCkpO1xyXG5cclxuTC5QYXRoID0gKEwuUGF0aC5TVkcgJiYgIXdpbmRvdy5MX1BSRUZFUl9DQU5WQVMpIHx8ICFMLkJyb3dzZXIuY2FudmFzID8gTC5QYXRoIDogTC5QYXRoLmV4dGVuZCh7XHJcblx0c3RhdGljczoge1xyXG5cdFx0Ly9DTElQX1BBRERJTkc6IDAuMDIsIC8vIG5vdCBzdXJlIGlmIHRoZXJlJ3MgYSBuZWVkIHRvIHNldCBpdCB0byBhIHNtYWxsIHZhbHVlXHJcblx0XHRDQU5WQVM6IHRydWUsXHJcblx0XHRTVkc6IGZhbHNlXHJcblx0fSxcclxuXHJcblx0cmVkcmF3OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMucHJvamVjdExhdGxuZ3MoKTtcclxuXHRcdFx0dGhpcy5fcmVxdWVzdFVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIHN0eWxlKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVN0eWxlKCk7XHJcblx0XHRcdHRoaXMuX3JlcXVlc3RVcGRhdGUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXBcclxuXHRcdCAgICAub2ZmKCd2aWV3cmVzZXQnLCB0aGlzLnByb2plY3RMYXRsbmdzLCB0aGlzKVxyXG5cdFx0ICAgIC5vZmYoJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVQYXRoLCB0aGlzKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xyXG5cdFx0XHR0aGlzLl9tYXAub2ZmKCdjbGljaycsIHRoaXMuX29uQ2xpY2ssIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVxdWVzdFVwZGF0ZSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmZpcmUoJ3JlbW92ZScpO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRfcmVxdWVzdFVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCAmJiAhTC5QYXRoLl91cGRhdGVSZXF1ZXN0KSB7XHJcblx0XHRcdEwuUGF0aC5fdXBkYXRlUmVxdWVzdCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKHRoaXMuX2ZpcmVNYXBNb3ZlRW5kLCB0aGlzLl9tYXApO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9maXJlTWFwTW92ZUVuZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0TC5QYXRoLl91cGRhdGVSZXF1ZXN0ID0gbnVsbDtcclxuXHRcdHRoaXMuZmlyZSgnbW92ZWVuZCcpO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0RWxlbWVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX21hcC5faW5pdFBhdGhSb290KCk7XHJcblx0XHR0aGlzLl9jdHggPSB0aGlzLl9tYXAuX2NhbnZhc0N0eDtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3R5bGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLnN0cm9rZSkge1xyXG5cdFx0XHR0aGlzLl9jdHgubGluZVdpZHRoID0gb3B0aW9ucy53ZWlnaHQ7XHJcblx0XHRcdHRoaXMuX2N0eC5zdHJva2VTdHlsZSA9IG9wdGlvbnMuY29sb3I7XHJcblx0XHR9XHJcblx0XHRpZiAob3B0aW9ucy5maWxsKSB7XHJcblx0XHRcdHRoaXMuX2N0eC5maWxsU3R5bGUgPSBvcHRpb25zLmZpbGxDb2xvciB8fCBvcHRpb25zLmNvbG9yO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9kcmF3UGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGksIGosIGxlbiwgbGVuMiwgcG9pbnQsIGRyYXdNZXRob2Q7XHJcblxyXG5cdFx0dGhpcy5fY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX3BhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGZvciAoaiA9IDAsIGxlbjIgPSB0aGlzLl9wYXJ0c1tpXS5sZW5ndGg7IGogPCBsZW4yOyBqKyspIHtcclxuXHRcdFx0XHRwb2ludCA9IHRoaXMuX3BhcnRzW2ldW2pdO1xyXG5cdFx0XHRcdGRyYXdNZXRob2QgPSAoaiA9PT0gMCA/ICdtb3ZlJyA6ICdsaW5lJykgKyAnVG8nO1xyXG5cclxuXHRcdFx0XHR0aGlzLl9jdHhbZHJhd01ldGhvZF0ocG9pbnQueCwgcG9pbnQueSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gVE9ETyByZWZhY3RvciB1Z2x5IGhhY2tcclxuXHRcdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMLlBvbHlnb24pIHtcclxuXHRcdFx0XHR0aGlzLl9jdHguY2xvc2VQYXRoKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfY2hlY2tJZkVtcHR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gIXRoaXMuX3BhcnRzLmxlbmd0aDtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX2NoZWNrSWZFbXB0eSgpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBjdHggPSB0aGlzLl9jdHgsXHJcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcblx0XHR0aGlzLl9kcmF3UGF0aCgpO1xyXG5cdFx0Y3R4LnNhdmUoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZVN0eWxlKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSBvcHRpb25zLmZpbGxPcGFjaXR5O1xyXG5cdFx0XHRjdHguZmlsbCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvcHRpb25zLnN0cm9rZSkge1xyXG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSBvcHRpb25zLm9wYWNpdHk7XHJcblx0XHRcdGN0eC5zdHJva2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRjdHgucmVzdG9yZSgpO1xyXG5cclxuXHRcdC8vIFRPRE8gb3B0aW1pemF0aW9uOiAxIGZpbGwvc3Ryb2tlIGZvciBhbGwgZmVhdHVyZXMgd2l0aCBlcXVhbCBzdHlsZSBpbnN0ZWFkIG9mIDEgZm9yIGVhY2ggZmVhdHVyZVxyXG5cdH0sXHJcblxyXG5cdF9pbml0RXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xyXG5cdFx0XHQvLyBUT0RPIGRibGNsaWNrXHJcblx0XHRcdHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9tYXAub24oJ2NsaWNrJywgdGhpcy5fb25DbGljaywgdGhpcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAodGhpcy5fY29udGFpbnNQb2ludChlLmxheWVyUG9pbnQpKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnY2xpY2snLCBlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25Nb3VzZU1vdmU6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoIXRoaXMuX21hcCB8fCB0aGlzLl9tYXAuX2FuaW1hdGluZ1pvb20pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gVE9ETyBkb24ndCBkbyBvbiBlYWNoIG1vdmVcclxuXHRcdGlmICh0aGlzLl9jb250YWluc1BvaW50KGUubGF5ZXJQb2ludCkpIHtcclxuXHRcdFx0dGhpcy5fY3R4LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcblx0XHRcdHRoaXMuX21vdXNlSW5zaWRlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5maXJlKCdtb3VzZW92ZXInLCBlKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuX21vdXNlSW5zaWRlKSB7XHJcblx0XHRcdHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gJyc7XHJcblx0XHRcdHRoaXMuX21vdXNlSW5zaWRlID0gZmFsc2U7XHJcblx0XHRcdHRoaXMuZmlyZSgnbW91c2VvdXQnLCBlKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAuaW5jbHVkZSgoTC5QYXRoLlNWRyAmJiAhd2luZG93LkxfUFJFRkVSX0NBTlZBUykgfHwgIUwuQnJvd3Nlci5jYW52YXMgPyB7fSA6IHtcclxuXHRfaW5pdFBhdGhSb290OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcm9vdCA9IHRoaXMuX3BhdGhSb290LFxyXG5cdFx0ICAgIGN0eDtcclxuXHJcblx0XHRpZiAoIXJvb3QpIHtcclxuXHRcdFx0cm9vdCA9IHRoaXMuX3BhdGhSb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblx0XHRcdHJvb3Quc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG5cdFx0XHRjdHggPSB0aGlzLl9jYW52YXNDdHggPSByb290LmdldENvbnRleHQoJzJkJyk7XHJcblxyXG5cdFx0XHRjdHgubGluZUNhcCA9ICdyb3VuZCc7XHJcblx0XHRcdGN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XHJcblxyXG5cdFx0XHR0aGlzLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZChyb290KTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvbikge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGhSb290LmNsYXNzTmFtZSA9ICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xyXG5cdFx0XHRcdHRoaXMub24oJ3pvb21hbmltJywgdGhpcy5fYW5pbWF0ZVBhdGhab29tKTtcclxuXHRcdFx0XHR0aGlzLm9uKCd6b29tZW5kJywgdGhpcy5fZW5kUGF0aFpvb20pO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVDYW52YXNWaWV3cG9ydCk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZUNhbnZhc1ZpZXdwb3J0KCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZUNhbnZhc1ZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyBkb24ndCByZWRyYXcgd2hpbGUgem9vbWluZy4gU2VlIF91cGRhdGVTdmdWaWV3cG9ydCBmb3IgbW9yZSBkZXRhaWxzXHJcblx0XHRpZiAodGhpcy5fcGF0aFpvb21pbmcpIHsgcmV0dXJuOyB9XHJcblx0XHR0aGlzLl91cGRhdGVQYXRoVmlld3BvcnQoKTtcclxuXHJcblx0XHR2YXIgdnAgPSB0aGlzLl9wYXRoVmlld3BvcnQsXHJcblx0XHQgICAgbWluID0gdnAubWluLFxyXG5cdFx0ICAgIHNpemUgPSB2cC5tYXguc3VidHJhY3QobWluKSxcclxuXHRcdCAgICByb290ID0gdGhpcy5fcGF0aFJvb3Q7XHJcblxyXG5cdFx0Ly9UT0RPIGNoZWNrIGlmIHRoaXMgd29ya3MgcHJvcGVybHkgb24gbW9iaWxlIHdlYmtpdFxyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHJvb3QsIG1pbik7XHJcblx0XHRyb290LndpZHRoID0gc2l6ZS54O1xyXG5cdFx0cm9vdC5oZWlnaHQgPSBzaXplLnk7XHJcblx0XHRyb290LmdldENvbnRleHQoJzJkJykudHJhbnNsYXRlKC1taW4ueCwgLW1pbi55KTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogTC5MaW5lVXRpbCBjb250YWlucyBkaWZmZXJlbnQgdXRpbGl0eSBmdW5jdGlvbnMgZm9yIGxpbmUgc2VnbWVudHNcclxuICogYW5kIHBvbHlsaW5lcyAoY2xpcHBpbmcsIHNpbXBsaWZpY2F0aW9uLCBkaXN0YW5jZXMsIGV0Yy4pXHJcbiAqL1xyXG5cclxuLypqc2hpbnQgYml0d2lzZTpmYWxzZSAqLyAvLyBhbGxvdyBiaXR3aXNlIG9wZXJhdGlvbnMgZm9yIHRoaXMgZmlsZVxyXG5cclxuTC5MaW5lVXRpbCA9IHtcclxuXHJcblx0Ly8gU2ltcGxpZnkgcG9seWxpbmUgd2l0aCB2ZXJ0ZXggcmVkdWN0aW9uIGFuZCBEb3VnbGFzLVBldWNrZXIgc2ltcGxpZmljYXRpb24uXHJcblx0Ly8gSW1wcm92ZXMgcmVuZGVyaW5nIHBlcmZvcm1hbmNlIGRyYW1hdGljYWxseSBieSBsZXNzZW5pbmcgdGhlIG51bWJlciBvZiBwb2ludHMgdG8gZHJhdy5cclxuXHJcblx0c2ltcGxpZnk6IGZ1bmN0aW9uICgvKlBvaW50W10qLyBwb2ludHMsIC8qTnVtYmVyKi8gdG9sZXJhbmNlKSB7XHJcblx0XHRpZiAoIXRvbGVyYW5jZSB8fCAhcG9pbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gcG9pbnRzLnNsaWNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHNxVG9sZXJhbmNlID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xyXG5cclxuXHRcdC8vIHN0YWdlIDE6IHZlcnRleCByZWR1Y3Rpb25cclxuXHRcdHBvaW50cyA9IHRoaXMuX3JlZHVjZVBvaW50cyhwb2ludHMsIHNxVG9sZXJhbmNlKTtcclxuXHJcblx0XHQvLyBzdGFnZSAyOiBEb3VnbGFzLVBldWNrZXIgc2ltcGxpZmljYXRpb25cclxuXHRcdHBvaW50cyA9IHRoaXMuX3NpbXBsaWZ5RFAocG9pbnRzLCBzcVRvbGVyYW5jZSk7XHJcblxyXG5cdFx0cmV0dXJuIHBvaW50cztcclxuXHR9LFxyXG5cclxuXHQvLyBkaXN0YW5jZSBmcm9tIGEgcG9pbnQgdG8gYSBzZWdtZW50IGJldHdlZW4gdHdvIHBvaW50c1xyXG5cdHBvaW50VG9TZWdtZW50RGlzdGFuY2U6ICBmdW5jdGlvbiAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMuX3NxQ2xvc2VzdFBvaW50T25TZWdtZW50KHAsIHAxLCBwMiwgdHJ1ZSkpO1xyXG5cdH0sXHJcblxyXG5cdGNsb3Nlc3RQb2ludE9uU2VnbWVudDogZnVuY3Rpb24gKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMikge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NxQ2xvc2VzdFBvaW50T25TZWdtZW50KHAsIHAxLCBwMik7XHJcblx0fSxcclxuXHJcblx0Ly8gRG91Z2xhcy1QZXVja2VyIHNpbXBsaWZpY2F0aW9uLCBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Eb3VnbGFzLVBldWNrZXJfYWxnb3JpdGhtXHJcblx0X3NpbXBsaWZ5RFA6IGZ1bmN0aW9uIChwb2ludHMsIHNxVG9sZXJhbmNlKSB7XHJcblxyXG5cdFx0dmFyIGxlbiA9IHBvaW50cy5sZW5ndGgsXHJcblx0XHQgICAgQXJyYXlDb25zdHJ1Y3RvciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSB1bmRlZmluZWQgKyAnJyA/IFVpbnQ4QXJyYXkgOiBBcnJheSxcclxuXHRcdCAgICBtYXJrZXJzID0gbmV3IEFycmF5Q29uc3RydWN0b3IobGVuKTtcclxuXHJcblx0XHRtYXJrZXJzWzBdID0gbWFya2Vyc1tsZW4gLSAxXSA9IDE7XHJcblxyXG5cdFx0dGhpcy5fc2ltcGxpZnlEUFN0ZXAocG9pbnRzLCBtYXJrZXJzLCBzcVRvbGVyYW5jZSwgMCwgbGVuIC0gMSk7XHJcblxyXG5cdFx0dmFyIGksXHJcblx0XHQgICAgbmV3UG9pbnRzID0gW107XHJcblxyXG5cdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGlmIChtYXJrZXJzW2ldKSB7XHJcblx0XHRcdFx0bmV3UG9pbnRzLnB1c2gocG9pbnRzW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXdQb2ludHM7XHJcblx0fSxcclxuXHJcblx0X3NpbXBsaWZ5RFBTdGVwOiBmdW5jdGlvbiAocG9pbnRzLCBtYXJrZXJzLCBzcVRvbGVyYW5jZSwgZmlyc3QsIGxhc3QpIHtcclxuXHJcblx0XHR2YXIgbWF4U3FEaXN0ID0gMCxcclxuXHRcdCAgICBpbmRleCwgaSwgc3FEaXN0O1xyXG5cclxuXHRcdGZvciAoaSA9IGZpcnN0ICsgMTsgaSA8PSBsYXN0IC0gMTsgaSsrKSB7XHJcblx0XHRcdHNxRGlzdCA9IHRoaXMuX3NxQ2xvc2VzdFBvaW50T25TZWdtZW50KHBvaW50c1tpXSwgcG9pbnRzW2ZpcnN0XSwgcG9pbnRzW2xhc3RdLCB0cnVlKTtcclxuXHJcblx0XHRcdGlmIChzcURpc3QgPiBtYXhTcURpc3QpIHtcclxuXHRcdFx0XHRpbmRleCA9IGk7XHJcblx0XHRcdFx0bWF4U3FEaXN0ID0gc3FEaXN0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG1heFNxRGlzdCA+IHNxVG9sZXJhbmNlKSB7XHJcblx0XHRcdG1hcmtlcnNbaW5kZXhdID0gMTtcclxuXHJcblx0XHRcdHRoaXMuX3NpbXBsaWZ5RFBTdGVwKHBvaW50cywgbWFya2Vycywgc3FUb2xlcmFuY2UsIGZpcnN0LCBpbmRleCk7XHJcblx0XHRcdHRoaXMuX3NpbXBsaWZ5RFBTdGVwKHBvaW50cywgbWFya2Vycywgc3FUb2xlcmFuY2UsIGluZGV4LCBsYXN0KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyByZWR1Y2UgcG9pbnRzIHRoYXQgYXJlIHRvbyBjbG9zZSB0byBlYWNoIG90aGVyIHRvIGEgc2luZ2xlIHBvaW50XHJcblx0X3JlZHVjZVBvaW50czogZnVuY3Rpb24gKHBvaW50cywgc3FUb2xlcmFuY2UpIHtcclxuXHRcdHZhciByZWR1Y2VkUG9pbnRzID0gW3BvaW50c1swXV07XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDEsIHByZXYgPSAwLCBsZW4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0aWYgKHRoaXMuX3NxRGlzdChwb2ludHNbaV0sIHBvaW50c1twcmV2XSkgPiBzcVRvbGVyYW5jZSkge1xyXG5cdFx0XHRcdHJlZHVjZWRQb2ludHMucHVzaChwb2ludHNbaV0pO1xyXG5cdFx0XHRcdHByZXYgPSBpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAocHJldiA8IGxlbiAtIDEpIHtcclxuXHRcdFx0cmVkdWNlZFBvaW50cy5wdXNoKHBvaW50c1tsZW4gLSAxXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVkdWNlZFBvaW50cztcclxuXHR9LFxyXG5cclxuXHQvLyBDb2hlbi1TdXRoZXJsYW5kIGxpbmUgY2xpcHBpbmcgYWxnb3JpdGhtLlxyXG5cdC8vIFVzZWQgdG8gYXZvaWQgcmVuZGVyaW5nIHBhcnRzIG9mIGEgcG9seWxpbmUgdGhhdCBhcmUgbm90IGN1cnJlbnRseSB2aXNpYmxlLlxyXG5cclxuXHRjbGlwU2VnbWVudDogZnVuY3Rpb24gKGEsIGIsIGJvdW5kcywgdXNlTGFzdENvZGUpIHtcclxuXHRcdHZhciBjb2RlQSA9IHVzZUxhc3RDb2RlID8gdGhpcy5fbGFzdENvZGUgOiB0aGlzLl9nZXRCaXRDb2RlKGEsIGJvdW5kcyksXHJcblx0XHQgICAgY29kZUIgPSB0aGlzLl9nZXRCaXRDb2RlKGIsIGJvdW5kcyksXHJcblxyXG5cdFx0ICAgIGNvZGVPdXQsIHAsIG5ld0NvZGU7XHJcblxyXG5cdFx0Ly8gc2F2ZSAybmQgY29kZSB0byBhdm9pZCBjYWxjdWxhdGluZyBpdCBvbiB0aGUgbmV4dCBzZWdtZW50XHJcblx0XHR0aGlzLl9sYXN0Q29kZSA9IGNvZGVCO1xyXG5cclxuXHRcdHdoaWxlICh0cnVlKSB7XHJcblx0XHRcdC8vIGlmIGEsYiBpcyBpbnNpZGUgdGhlIGNsaXAgd2luZG93ICh0cml2aWFsIGFjY2VwdClcclxuXHRcdFx0aWYgKCEoY29kZUEgfCBjb2RlQikpIHtcclxuXHRcdFx0XHRyZXR1cm4gW2EsIGJdO1xyXG5cdFx0XHQvLyBpZiBhLGIgaXMgb3V0c2lkZSB0aGUgY2xpcCB3aW5kb3cgKHRyaXZpYWwgcmVqZWN0KVxyXG5cdFx0XHR9IGVsc2UgaWYgKGNvZGVBICYgY29kZUIpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdC8vIG90aGVyIGNhc2VzXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29kZU91dCA9IGNvZGVBIHx8IGNvZGVCO1xyXG5cdFx0XHRcdHAgPSB0aGlzLl9nZXRFZGdlSW50ZXJzZWN0aW9uKGEsIGIsIGNvZGVPdXQsIGJvdW5kcyk7XHJcblx0XHRcdFx0bmV3Q29kZSA9IHRoaXMuX2dldEJpdENvZGUocCwgYm91bmRzKTtcclxuXHJcblx0XHRcdFx0aWYgKGNvZGVPdXQgPT09IGNvZGVBKSB7XHJcblx0XHRcdFx0XHRhID0gcDtcclxuXHRcdFx0XHRcdGNvZGVBID0gbmV3Q29kZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YiA9IHA7XHJcblx0XHRcdFx0XHRjb2RlQiA9IG5ld0NvZGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2dldEVkZ2VJbnRlcnNlY3Rpb246IGZ1bmN0aW9uIChhLCBiLCBjb2RlLCBib3VuZHMpIHtcclxuXHRcdHZhciBkeCA9IGIueCAtIGEueCxcclxuXHRcdCAgICBkeSA9IGIueSAtIGEueSxcclxuXHRcdCAgICBtaW4gPSBib3VuZHMubWluLFxyXG5cdFx0ICAgIG1heCA9IGJvdW5kcy5tYXg7XHJcblxyXG5cdFx0aWYgKGNvZGUgJiA4KSB7IC8vIHRvcFxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoYS54ICsgZHggKiAobWF4LnkgLSBhLnkpIC8gZHksIG1heC55KTtcclxuXHRcdH0gZWxzZSBpZiAoY29kZSAmIDQpIHsgLy8gYm90dG9tXHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2ludChhLnggKyBkeCAqIChtaW4ueSAtIGEueSkgLyBkeSwgbWluLnkpO1xyXG5cdFx0fSBlbHNlIGlmIChjb2RlICYgMikgeyAvLyByaWdodFxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobWF4LngsIGEueSArIGR5ICogKG1heC54IC0gYS54KSAvIGR4KTtcclxuXHRcdH0gZWxzZSBpZiAoY29kZSAmIDEpIHsgLy8gbGVmdFxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobWluLngsIGEueSArIGR5ICogKG1pbi54IC0gYS54KSAvIGR4KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfZ2V0Qml0Q29kZTogZnVuY3Rpb24gKC8qUG9pbnQqLyBwLCBib3VuZHMpIHtcclxuXHRcdHZhciBjb2RlID0gMDtcclxuXHJcblx0XHRpZiAocC54IDwgYm91bmRzLm1pbi54KSB7IC8vIGxlZnRcclxuXHRcdFx0Y29kZSB8PSAxO1xyXG5cdFx0fSBlbHNlIGlmIChwLnggPiBib3VuZHMubWF4LngpIHsgLy8gcmlnaHRcclxuXHRcdFx0Y29kZSB8PSAyO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHAueSA8IGJvdW5kcy5taW4ueSkgeyAvLyBib3R0b21cclxuXHRcdFx0Y29kZSB8PSA0O1xyXG5cdFx0fSBlbHNlIGlmIChwLnkgPiBib3VuZHMubWF4LnkpIHsgLy8gdG9wXHJcblx0XHRcdGNvZGUgfD0gODtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY29kZTtcclxuXHR9LFxyXG5cclxuXHQvLyBzcXVhcmUgZGlzdGFuY2UgKHRvIGF2b2lkIHVubmVjZXNzYXJ5IE1hdGguc3FydCBjYWxscylcclxuXHRfc3FEaXN0OiBmdW5jdGlvbiAocDEsIHAyKSB7XHJcblx0XHR2YXIgZHggPSBwMi54IC0gcDEueCxcclxuXHRcdCAgICBkeSA9IHAyLnkgLSBwMS55O1xyXG5cdFx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xyXG5cdH0sXHJcblxyXG5cdC8vIHJldHVybiBjbG9zZXN0IHBvaW50IG9uIHNlZ21lbnQgb3IgZGlzdGFuY2UgdG8gdGhhdCBwb2ludFxyXG5cdF9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudDogZnVuY3Rpb24gKHAsIHAxLCBwMiwgc3FEaXN0KSB7XHJcblx0XHR2YXIgeCA9IHAxLngsXHJcblx0XHQgICAgeSA9IHAxLnksXHJcblx0XHQgICAgZHggPSBwMi54IC0geCxcclxuXHRcdCAgICBkeSA9IHAyLnkgLSB5LFxyXG5cdFx0ICAgIGRvdCA9IGR4ICogZHggKyBkeSAqIGR5LFxyXG5cdFx0ICAgIHQ7XHJcblxyXG5cdFx0aWYgKGRvdCA+IDApIHtcclxuXHRcdFx0dCA9ICgocC54IC0geCkgKiBkeCArIChwLnkgLSB5KSAqIGR5KSAvIGRvdDtcclxuXHJcblx0XHRcdGlmICh0ID4gMSkge1xyXG5cdFx0XHRcdHggPSBwMi54O1xyXG5cdFx0XHRcdHkgPSBwMi55O1xyXG5cdFx0XHR9IGVsc2UgaWYgKHQgPiAwKSB7XHJcblx0XHRcdFx0eCArPSBkeCAqIHQ7XHJcblx0XHRcdFx0eSArPSBkeSAqIHQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRkeCA9IHAueCAtIHg7XHJcblx0XHRkeSA9IHAueSAtIHk7XHJcblxyXG5cdFx0cmV0dXJuIHNxRGlzdCA/IGR4ICogZHggKyBkeSAqIGR5IDogbmV3IEwuUG9pbnQoeCwgeSk7XHJcblx0fVxyXG59O1xyXG5cblxuLypcclxuICogTC5Qb2x5bGluZSBpcyB1c2VkIHRvIGRpc3BsYXkgcG9seWxpbmVzIG9uIGEgbWFwLlxyXG4gKi9cclxuXHJcbkwuUG9seWxpbmUgPSBMLlBhdGguZXh0ZW5kKHtcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdFx0TC5QYXRoLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5fbGF0bG5ncyA9IHRoaXMuX2NvbnZlcnRMYXRMbmdzKGxhdGxuZ3MpO1xyXG5cdH0sXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdC8vIGhvdyBtdWNoIHRvIHNpbXBsaWZ5IHRoZSBwb2x5bGluZSBvbiBlYWNoIHpvb20gbGV2ZWxcclxuXHRcdC8vIG1vcmUgPSBiZXR0ZXIgcGVyZm9ybWFuY2UgYW5kIHNtb290aGVyIGxvb2ssIGxlc3MgPSBtb3JlIGFjY3VyYXRlXHJcblx0XHRzbW9vdGhGYWN0b3I6IDEuMCxcclxuXHRcdG5vQ2xpcDogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5fbGF0bG5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR0aGlzLl9vcmlnaW5hbFBvaW50c1tpXSA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fbGF0bG5nc1tpXSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0UGF0aFN0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3BhcnRzLmxlbmd0aCwgc3RyID0gJyc7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRzdHIgKz0gdGhpcy5fZ2V0UGF0aFBhcnRTdHIodGhpcy5fcGFydHNbaV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0cjtcclxuXHR9LFxyXG5cclxuXHRnZXRMYXRMbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF0bG5ncztcclxuXHR9LFxyXG5cclxuXHRzZXRMYXRMbmdzOiBmdW5jdGlvbiAobGF0bG5ncykge1xyXG5cdFx0dGhpcy5fbGF0bG5ncyA9IHRoaXMuX2NvbnZlcnRMYXRMbmdzKGxhdGxuZ3MpO1xyXG5cdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0fSxcclxuXHJcblx0YWRkTGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR0aGlzLl9sYXRsbmdzLnB1c2goTC5sYXRMbmcobGF0bG5nKSk7XHJcblx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHR9LFxyXG5cclxuXHRzcGxpY2VMYXRMbmdzOiBmdW5jdGlvbiAoKSB7IC8vIChOdW1iZXIgaW5kZXgsIE51bWJlciBob3dNYW55KVxyXG5cdFx0dmFyIHJlbW92ZWQgPSBbXS5zcGxpY2UuYXBwbHkodGhpcy5fbGF0bG5ncywgYXJndW1lbnRzKTtcclxuXHRcdHRoaXMuX2NvbnZlcnRMYXRMbmdzKHRoaXMuX2xhdGxuZ3MsIHRydWUpO1xyXG5cdFx0dGhpcy5yZWRyYXcoKTtcclxuXHRcdHJldHVybiByZW1vdmVkO1xyXG5cdH0sXHJcblxyXG5cdGNsb3Nlc3RMYXllclBvaW50OiBmdW5jdGlvbiAocCkge1xyXG5cdFx0dmFyIG1pbkRpc3RhbmNlID0gSW5maW5pdHksIHBhcnRzID0gdGhpcy5fcGFydHMsIHAxLCBwMiwgbWluUG9pbnQgPSBudWxsO1xyXG5cclxuXHRcdGZvciAodmFyIGogPSAwLCBqTGVuID0gcGFydHMubGVuZ3RoOyBqIDwgakxlbjsgaisrKSB7XHJcblx0XHRcdHZhciBwb2ludHMgPSBwYXJ0c1tqXTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDEsIGxlbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdHAxID0gcG9pbnRzW2kgLSAxXTtcclxuXHRcdFx0XHRwMiA9IHBvaW50c1tpXTtcclxuXHRcdFx0XHR2YXIgc3FEaXN0ID0gTC5MaW5lVXRpbC5fc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQocCwgcDEsIHAyLCB0cnVlKTtcclxuXHRcdFx0XHRpZiAoc3FEaXN0IDwgbWluRGlzdGFuY2UpIHtcclxuXHRcdFx0XHRcdG1pbkRpc3RhbmNlID0gc3FEaXN0O1xyXG5cdFx0XHRcdFx0bWluUG9pbnQgPSBMLkxpbmVVdGlsLl9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudChwLCBwMSwgcDIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKG1pblBvaW50KSB7XHJcblx0XHRcdG1pblBvaW50LmRpc3RhbmNlID0gTWF0aC5zcXJ0KG1pbkRpc3RhbmNlKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBtaW5Qb2ludDtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmdCb3VuZHModGhpcy5nZXRMYXRMbmdzKCkpO1xyXG5cdH0sXHJcblxyXG5cdF9jb252ZXJ0TGF0TG5nczogZnVuY3Rpb24gKGxhdGxuZ3MsIG92ZXJ3cml0ZSkge1xyXG5cdFx0dmFyIGksIGxlbiwgdGFyZ2V0ID0gb3ZlcndyaXRlID8gbGF0bG5ncyA6IFtdO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGxhdGxuZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0aWYgKEwuVXRpbC5pc0FycmF5KGxhdGxuZ3NbaV0pICYmIHR5cGVvZiBsYXRsbmdzW2ldWzBdICE9PSAnbnVtYmVyJykge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHR0YXJnZXRbaV0gPSBMLmxhdExuZyhsYXRsbmdzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0YXJnZXQ7XHJcblx0fSxcclxuXHJcblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuUGF0aC5wcm90b3R5cGUuX2luaXRFdmVudHMuY2FsbCh0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0UGF0aFBhcnRTdHI6IGZ1bmN0aW9uIChwb2ludHMpIHtcclxuXHRcdHZhciByb3VuZCA9IEwuUGF0aC5WTUw7XHJcblxyXG5cdFx0Zm9yICh2YXIgaiA9IDAsIGxlbjIgPSBwb2ludHMubGVuZ3RoLCBzdHIgPSAnJywgcDsgaiA8IGxlbjI7IGorKykge1xyXG5cdFx0XHRwID0gcG9pbnRzW2pdO1xyXG5cdFx0XHRpZiAocm91bmQpIHtcclxuXHRcdFx0XHRwLl9yb3VuZCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0ciArPSAoaiA/ICdMJyA6ICdNJykgKyBwLnggKyAnICcgKyBwLnk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc3RyO1xyXG5cdH0sXHJcblxyXG5cdF9jbGlwUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXHJcblx0XHQgICAgbGVuID0gcG9pbnRzLmxlbmd0aCxcclxuXHRcdCAgICBpLCBrLCBzZWdtZW50O1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubm9DbGlwKSB7XHJcblx0XHRcdHRoaXMuX3BhcnRzID0gW3BvaW50c107XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9wYXJ0cyA9IFtdO1xyXG5cclxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuX3BhcnRzLFxyXG5cdFx0ICAgIHZwID0gdGhpcy5fbWFwLl9wYXRoVmlld3BvcnQsXHJcblx0XHQgICAgbHUgPSBMLkxpbmVVdGlsO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGsgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcblx0XHRcdHNlZ21lbnQgPSBsdS5jbGlwU2VnbWVudChwb2ludHNbaV0sIHBvaW50c1tpICsgMV0sIHZwLCBpKTtcclxuXHRcdFx0aWYgKCFzZWdtZW50KSB7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBhcnRzW2tdID0gcGFydHNba10gfHwgW107XHJcblx0XHRcdHBhcnRzW2tdLnB1c2goc2VnbWVudFswXSk7XHJcblxyXG5cdFx0XHQvLyBpZiBzZWdtZW50IGdvZXMgb3V0IG9mIHNjcmVlbiwgb3IgaXQncyB0aGUgbGFzdCBvbmUsIGl0J3MgdGhlIGVuZCBvZiB0aGUgbGluZSBwYXJ0XHJcblx0XHRcdGlmICgoc2VnbWVudFsxXSAhPT0gcG9pbnRzW2kgKyAxXSkgfHwgKGkgPT09IGxlbiAtIDIpKSB7XHJcblx0XHRcdFx0cGFydHNba10ucHVzaChzZWdtZW50WzFdKTtcclxuXHRcdFx0XHRrKys7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBzaW1wbGlmeSBlYWNoIGNsaXBwZWQgcGFydCBvZiB0aGUgcG9seWxpbmVcclxuXHRfc2ltcGxpZnlQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuX3BhcnRzLFxyXG5cdFx0ICAgIGx1ID0gTC5MaW5lVXRpbDtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0cGFydHNbaV0gPSBsdS5zaW1wbGlmeShwYXJ0c1tpXSwgdGhpcy5vcHRpb25zLnNtb290aEZhY3Rvcik7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuX2NsaXBQb2ludHMoKTtcclxuXHRcdHRoaXMuX3NpbXBsaWZ5UG9pbnRzKCk7XHJcblxyXG5cdFx0TC5QYXRoLnByb3RvdHlwZS5fdXBkYXRlUGF0aC5jYWxsKHRoaXMpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnBvbHlsaW5lID0gZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuUG9seWxpbmUobGF0bG5ncywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlBvbHlVdGlsIGNvbnRhaW5zIHV0aWxpdHkgZnVuY3Rpb25zIGZvciBwb2x5Z29ucyAoY2xpcHBpbmcsIGV0Yy4pLlxyXG4gKi9cclxuXHJcbi8qanNoaW50IGJpdHdpc2U6ZmFsc2UgKi8gLy8gYWxsb3cgYml0d2lzZSBvcGVyYXRpb25zIGhlcmVcclxuXHJcbkwuUG9seVV0aWwgPSB7fTtcclxuXHJcbi8qXHJcbiAqIFN1dGhlcmxhbmQtSG9kZ2VtYW4gcG9seWdvbiBjbGlwcGluZyBhbGdvcml0aG0uXHJcbiAqIFVzZWQgdG8gYXZvaWQgcmVuZGVyaW5nIHBhcnRzIG9mIGEgcG9seWdvbiB0aGF0IGFyZSBub3QgY3VycmVudGx5IHZpc2libGUuXHJcbiAqL1xyXG5MLlBvbHlVdGlsLmNsaXBQb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgYm91bmRzKSB7XHJcblx0dmFyIGNsaXBwZWRQb2ludHMsXHJcblx0ICAgIGVkZ2VzID0gWzEsIDQsIDIsIDhdLFxyXG5cdCAgICBpLCBqLCBrLFxyXG5cdCAgICBhLCBiLFxyXG5cdCAgICBsZW4sIGVkZ2UsIHAsXHJcblx0ICAgIGx1ID0gTC5MaW5lVXRpbDtcclxuXHJcblx0Zm9yIChpID0gMCwgbGVuID0gcG9pbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRwb2ludHNbaV0uX2NvZGUgPSBsdS5fZ2V0Qml0Q29kZShwb2ludHNbaV0sIGJvdW5kcyk7XHJcblx0fVxyXG5cclxuXHQvLyBmb3IgZWFjaCBlZGdlIChsZWZ0LCBib3R0b20sIHJpZ2h0LCB0b3ApXHJcblx0Zm9yIChrID0gMDsgayA8IDQ7IGsrKykge1xyXG5cdFx0ZWRnZSA9IGVkZ2VzW2tdO1xyXG5cdFx0Y2xpcHBlZFBvaW50cyA9IFtdO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHBvaW50cy5sZW5ndGgsIGogPSBsZW4gLSAxOyBpIDwgbGVuOyBqID0gaSsrKSB7XHJcblx0XHRcdGEgPSBwb2ludHNbaV07XHJcblx0XHRcdGIgPSBwb2ludHNbal07XHJcblxyXG5cdFx0XHQvLyBpZiBhIGlzIGluc2lkZSB0aGUgY2xpcCB3aW5kb3dcclxuXHRcdFx0aWYgKCEoYS5fY29kZSAmIGVkZ2UpKSB7XHJcblx0XHRcdFx0Ly8gaWYgYiBpcyBvdXRzaWRlIHRoZSBjbGlwIHdpbmRvdyAoYS0+YiBnb2VzIG91dCBvZiBzY3JlZW4pXHJcblx0XHRcdFx0aWYgKGIuX2NvZGUgJiBlZGdlKSB7XHJcblx0XHRcdFx0XHRwID0gbHUuX2dldEVkZ2VJbnRlcnNlY3Rpb24oYiwgYSwgZWRnZSwgYm91bmRzKTtcclxuXHRcdFx0XHRcdHAuX2NvZGUgPSBsdS5fZ2V0Qml0Q29kZShwLCBib3VuZHMpO1xyXG5cdFx0XHRcdFx0Y2xpcHBlZFBvaW50cy5wdXNoKHApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjbGlwcGVkUG9pbnRzLnB1c2goYSk7XHJcblxyXG5cdFx0XHQvLyBlbHNlIGlmIGIgaXMgaW5zaWRlIHRoZSBjbGlwIHdpbmRvdyAoYS0+YiBlbnRlcnMgdGhlIHNjcmVlbilcclxuXHRcdFx0fSBlbHNlIGlmICghKGIuX2NvZGUgJiBlZGdlKSkge1xyXG5cdFx0XHRcdHAgPSBsdS5fZ2V0RWRnZUludGVyc2VjdGlvbihiLCBhLCBlZGdlLCBib3VuZHMpO1xyXG5cdFx0XHRcdHAuX2NvZGUgPSBsdS5fZ2V0Qml0Q29kZShwLCBib3VuZHMpO1xyXG5cdFx0XHRcdGNsaXBwZWRQb2ludHMucHVzaChwKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cG9pbnRzID0gY2xpcHBlZFBvaW50cztcclxuXHR9XHJcblxyXG5cdHJldHVybiBwb2ludHM7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlBvbHlnb24gaXMgdXNlZCB0byBkaXNwbGF5IHBvbHlnb25zIG9uIGEgbWFwLlxyXG4gKi9cclxuXHJcbkwuUG9seWdvbiA9IEwuUG9seWxpbmUuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRmaWxsOiB0cnVlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRcdEwuUG9seWxpbmUucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmdzLCBvcHRpb25zKTtcclxuXHRcdHRoaXMuX2luaXRXaXRoSG9sZXMobGF0bG5ncyk7XHJcblx0fSxcclxuXHJcblx0X2luaXRXaXRoSG9sZXM6IGZ1bmN0aW9uIChsYXRsbmdzKSB7XHJcblx0XHR2YXIgaSwgbGVuLCBob2xlO1xyXG5cdFx0aWYgKGxhdGxuZ3MgJiYgTC5VdGlsLmlzQXJyYXkobGF0bG5nc1swXSkgJiYgKHR5cGVvZiBsYXRsbmdzWzBdWzBdICE9PSAnbnVtYmVyJykpIHtcclxuXHRcdFx0dGhpcy5fbGF0bG5ncyA9IHRoaXMuX2NvbnZlcnRMYXRMbmdzKGxhdGxuZ3NbMF0pO1xyXG5cdFx0XHR0aGlzLl9ob2xlcyA9IGxhdGxuZ3Muc2xpY2UoMSk7XHJcblxyXG5cdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9ob2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGhvbGUgPSB0aGlzLl9ob2xlc1tpXSA9IHRoaXMuX2NvbnZlcnRMYXRMbmdzKHRoaXMuX2hvbGVzW2ldKTtcclxuXHRcdFx0XHRpZiAoaG9sZVswXS5lcXVhbHMoaG9sZVtob2xlLmxlbmd0aCAtIDFdKSkge1xyXG5cdFx0XHRcdFx0aG9sZS5wb3AoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBmaWx0ZXIgb3V0IGxhc3QgcG9pbnQgaWYgaXRzIGVxdWFsIHRvIHRoZSBmaXJzdCBvbmVcclxuXHRcdGxhdGxuZ3MgPSB0aGlzLl9sYXRsbmdzO1xyXG5cclxuXHRcdGlmIChsYXRsbmdzLmxlbmd0aCA+PSAyICYmIGxhdGxuZ3NbMF0uZXF1YWxzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSkpIHtcclxuXHRcdFx0bGF0bG5ncy5wb3AoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0TC5Qb2x5bGluZS5wcm90b3R5cGUucHJvamVjdExhdGxuZ3MuY2FsbCh0aGlzKTtcclxuXHJcblx0XHQvLyBwcm9qZWN0IHBvbHlnb24gaG9sZXMgcG9pbnRzXHJcblx0XHQvLyBUT0RPIG1vdmUgdGhpcyBsb2dpYyB0byBQb2x5bGluZSB0byBnZXQgcmlkIG9mIGR1cGxpY2F0aW9uXHJcblx0XHR0aGlzLl9ob2xlUG9pbnRzID0gW107XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9ob2xlcykgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgaSwgaiwgbGVuLCBsZW4yO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX2hvbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHRoaXMuX2hvbGVQb2ludHNbaV0gPSBbXTtcclxuXHJcblx0XHRcdGZvciAoaiA9IDAsIGxlbjIgPSB0aGlzLl9ob2xlc1tpXS5sZW5ndGg7IGogPCBsZW4yOyBqKyspIHtcclxuXHRcdFx0XHR0aGlzLl9ob2xlUG9pbnRzW2ldW2pdID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9ob2xlc1tpXVtqXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRzZXRMYXRMbmdzOiBmdW5jdGlvbiAobGF0bG5ncykge1xyXG5cdFx0aWYgKGxhdGxuZ3MgJiYgTC5VdGlsLmlzQXJyYXkobGF0bG5nc1swXSkgJiYgKHR5cGVvZiBsYXRsbmdzWzBdWzBdICE9PSAnbnVtYmVyJykpIHtcclxuXHRcdFx0dGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTC5Qb2x5bGluZS5wcm90b3R5cGUuc2V0TGF0TG5ncy5jYWxsKHRoaXMsIGxhdGxuZ3MpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jbGlwUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXHJcblx0XHQgICAgbmV3UGFydHMgPSBbXTtcclxuXHJcblx0XHR0aGlzLl9wYXJ0cyA9IFtwb2ludHNdLmNvbmNhdCh0aGlzLl9ob2xlUG9pbnRzKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm5vQ2xpcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5fcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dmFyIGNsaXBwZWQgPSBMLlBvbHlVdGlsLmNsaXBQb2x5Z29uKHRoaXMuX3BhcnRzW2ldLCB0aGlzLl9tYXAuX3BhdGhWaWV3cG9ydCk7XHJcblx0XHRcdGlmIChjbGlwcGVkLmxlbmd0aCkge1xyXG5cdFx0XHRcdG5ld1BhcnRzLnB1c2goY2xpcHBlZCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9wYXJ0cyA9IG5ld1BhcnRzO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRQYXRoUGFydFN0cjogZnVuY3Rpb24gKHBvaW50cykge1xyXG5cdFx0dmFyIHN0ciA9IEwuUG9seWxpbmUucHJvdG90eXBlLl9nZXRQYXRoUGFydFN0ci5jYWxsKHRoaXMsIHBvaW50cyk7XHJcblx0XHRyZXR1cm4gc3RyICsgKEwuQnJvd3Nlci5zdmcgPyAneicgOiAneCcpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnBvbHlnb24gPSBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Qb2x5Z29uKGxhdGxuZ3MsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogQ29udGFpbnMgTC5NdWx0aVBvbHlsaW5lIGFuZCBMLk11bHRpUG9seWdvbiBsYXllcnMuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHRmdW5jdGlvbiBjcmVhdGVNdWx0aShLbGFzcykge1xyXG5cclxuXHRcdHJldHVybiBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xyXG5cclxuXHRcdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRcdFx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHRcdFx0XHR0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcclxuXHRcdFx0XHR0aGlzLnNldExhdExuZ3MobGF0bG5ncyk7XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRzZXRMYXRMbmdzOiBmdW5jdGlvbiAobGF0bG5ncykge1xyXG5cdFx0XHRcdHZhciBpID0gMCxcclxuXHRcdFx0XHQgICAgbGVuID0gbGF0bG5ncy5sZW5ndGg7XHJcblxyXG5cdFx0XHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHRcdFx0aWYgKGkgPCBsZW4pIHtcclxuXHRcdFx0XHRcdFx0bGF5ZXIuc2V0TGF0TG5ncyhsYXRsbmdzW2krK10pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVMYXllcihsYXllcik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0XHRcdHdoaWxlIChpIDwgbGVuKSB7XHJcblx0XHRcdFx0XHR0aGlzLmFkZExheWVyKG5ldyBLbGFzcyhsYXRsbmdzW2krK10sIHRoaXMuX29wdGlvbnMpKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0Z2V0TGF0TG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHZhciBsYXRsbmdzID0gW107XHJcblxyXG5cdFx0XHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHRcdFx0bGF0bG5ncy5wdXNoKGxheWVyLmdldExhdExuZ3MoKSk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBsYXRsbmdzO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdEwuTXVsdGlQb2x5bGluZSA9IGNyZWF0ZU11bHRpKEwuUG9seWxpbmUpO1xyXG5cdEwuTXVsdGlQb2x5Z29uID0gY3JlYXRlTXVsdGkoTC5Qb2x5Z29uKTtcclxuXHJcblx0TC5tdWx0aVBvbHlsaW5lID0gZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiBuZXcgTC5NdWx0aVBvbHlsaW5lKGxhdGxuZ3MsIG9wdGlvbnMpO1xyXG5cdH07XHJcblxyXG5cdEwubXVsdGlQb2x5Z29uID0gZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiBuZXcgTC5NdWx0aVBvbHlnb24obGF0bG5ncywgb3B0aW9ucyk7XHJcblx0fTtcclxufSgpKTtcclxuXG5cbi8qXHJcbiAqIEwuUmVjdGFuZ2xlIGV4dGVuZHMgUG9seWdvbiBhbmQgY3JlYXRlcyBhIHJlY3RhbmdsZSB3aGVuIHBhc3NlZCBhIExhdExuZ0JvdW5kcyBvYmplY3QuXHJcbiAqL1xyXG5cclxuTC5SZWN0YW5nbGUgPSBMLlBvbHlnb24uZXh0ZW5kKHtcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0TG5nQm91bmRzLCBvcHRpb25zKSB7XHJcblx0XHRMLlBvbHlnb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCB0aGlzLl9ib3VuZHNUb0xhdExuZ3MobGF0TG5nQm91bmRzKSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0c2V0Qm91bmRzOiBmdW5jdGlvbiAobGF0TG5nQm91bmRzKSB7XHJcblx0XHR0aGlzLnNldExhdExuZ3ModGhpcy5fYm91bmRzVG9MYXRMbmdzKGxhdExuZ0JvdW5kcykpO1xyXG5cdH0sXHJcblxyXG5cdF9ib3VuZHNUb0xhdExuZ3M6IGZ1bmN0aW9uIChsYXRMbmdCb3VuZHMpIHtcclxuXHRcdGxhdExuZ0JvdW5kcyA9IEwubGF0TG5nQm91bmRzKGxhdExuZ0JvdW5kcyk7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRsYXRMbmdCb3VuZHMuZ2V0U291dGhXZXN0KCksXHJcblx0XHRcdGxhdExuZ0JvdW5kcy5nZXROb3J0aFdlc3QoKSxcclxuXHRcdFx0bGF0TG5nQm91bmRzLmdldE5vcnRoRWFzdCgpLFxyXG5cdFx0XHRsYXRMbmdCb3VuZHMuZ2V0U291dGhFYXN0KClcclxuXHRcdF07XHJcblx0fVxyXG59KTtcclxuXHJcbkwucmVjdGFuZ2xlID0gZnVuY3Rpb24gKGxhdExuZ0JvdW5kcywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5SZWN0YW5nbGUobGF0TG5nQm91bmRzLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuQ2lyY2xlIGlzIGEgY2lyY2xlIG92ZXJsYXkgKHdpdGggYSBjZXJ0YWluIHJhZGl1cyBpbiBtZXRlcnMpLlxyXG4gKi9cclxuXHJcbkwuQ2lyY2xlID0gTC5QYXRoLmV4dGVuZCh7XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdGxuZywgcmFkaXVzLCBvcHRpb25zKSB7XHJcblx0XHRMLlBhdGgucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdFx0dGhpcy5fbVJhZGl1cyA9IHJhZGl1cztcclxuXHR9LFxyXG5cclxuXHRvcHRpb25zOiB7XHJcblx0XHRmaWxsOiB0cnVlXHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0fSxcclxuXHJcblx0c2V0UmFkaXVzOiBmdW5jdGlvbiAocmFkaXVzKSB7XHJcblx0XHR0aGlzLl9tUmFkaXVzID0gcmFkaXVzO1xyXG5cdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0fSxcclxuXHJcblx0cHJvamVjdExhdGxuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsbmdSYWRpdXMgPSB0aGlzLl9nZXRMbmdSYWRpdXMoKSxcclxuXHRcdCAgICBsYXRsbmcgPSB0aGlzLl9sYXRsbmcsXHJcblx0XHQgICAgcG9pbnRMZWZ0ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChbbGF0bG5nLmxhdCwgbGF0bG5nLmxuZyAtIGxuZ1JhZGl1c10pO1xyXG5cclxuXHRcdHRoaXMuX3BvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpO1xyXG5cdFx0dGhpcy5fcmFkaXVzID0gTWF0aC5tYXgodGhpcy5fcG9pbnQueCAtIHBvaW50TGVmdC54LCAxKTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsbmdSYWRpdXMgPSB0aGlzLl9nZXRMbmdSYWRpdXMoKSxcclxuXHRcdCAgICBsYXRSYWRpdXMgPSAodGhpcy5fbVJhZGl1cyAvIDQwMDc1MDE3KSAqIDM2MCxcclxuXHRcdCAgICBsYXRsbmcgPSB0aGlzLl9sYXRsbmc7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZ0JvdW5kcyhcclxuXHRcdCAgICAgICAgW2xhdGxuZy5sYXQgLSBsYXRSYWRpdXMsIGxhdGxuZy5sbmcgLSBsbmdSYWRpdXNdLFxyXG5cdFx0ICAgICAgICBbbGF0bG5nLmxhdCArIGxhdFJhZGl1cywgbGF0bG5nLmxuZyArIGxuZ1JhZGl1c10pO1xyXG5cdH0sXHJcblxyXG5cdGdldExhdExuZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2xhdGxuZztcclxuXHR9LFxyXG5cclxuXHRnZXRQYXRoU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcCA9IHRoaXMuX3BvaW50LFxyXG5cdFx0ICAgIHIgPSB0aGlzLl9yYWRpdXM7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NoZWNrSWZFbXB0eSgpKSB7XHJcblx0XHRcdHJldHVybiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnN2Zykge1xyXG5cdFx0XHRyZXR1cm4gJ00nICsgcC54ICsgJywnICsgKHAueSAtIHIpICtcclxuXHRcdFx0ICAgICAgICdBJyArIHIgKyAnLCcgKyByICsgJywwLDEsMSwnICtcclxuXHRcdFx0ICAgICAgIChwLnggLSAwLjEpICsgJywnICsgKHAueSAtIHIpICsgJyB6JztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHAuX3JvdW5kKCk7XHJcblx0XHRcdHIgPSBNYXRoLnJvdW5kKHIpO1xyXG5cdFx0XHRyZXR1cm4gJ0FMICcgKyBwLnggKyAnLCcgKyBwLnkgKyAnICcgKyByICsgJywnICsgciArICcgMCwnICsgKDY1NTM1ICogMzYwKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXRSYWRpdXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9tUmFkaXVzO1xyXG5cdH0sXHJcblxyXG5cdC8vIFRPRE8gRWFydGggaGFyZGNvZGVkLCBtb3ZlIGludG8gcHJvamVjdGlvbiBjb2RlIVxyXG5cclxuXHRfZ2V0TGF0UmFkaXVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX21SYWRpdXMgLyA0MDA3NTAxNykgKiAzNjA7XHJcblx0fSxcclxuXHJcblx0X2dldExuZ1JhZGl1czogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2dldExhdFJhZGl1cygpIC8gTWF0aC5jb3MoTC5MYXRMbmcuREVHX1RPX1JBRCAqIHRoaXMuX2xhdGxuZy5sYXQpO1xyXG5cdH0sXHJcblxyXG5cdF9jaGVja0lmRW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHZhciB2cCA9IHRoaXMuX21hcC5fcGF0aFZpZXdwb3J0LFxyXG5cdFx0ICAgIHIgPSB0aGlzLl9yYWRpdXMsXHJcblx0XHQgICAgcCA9IHRoaXMuX3BvaW50O1xyXG5cclxuXHRcdHJldHVybiBwLnggLSByID4gdnAubWF4LnggfHwgcC55IC0gciA+IHZwLm1heC55IHx8XHJcblx0XHQgICAgICAgcC54ICsgciA8IHZwLm1pbi54IHx8IHAueSArIHIgPCB2cC5taW4ueTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jaXJjbGUgPSBmdW5jdGlvbiAobGF0bG5nLCByYWRpdXMsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ2lyY2xlKGxhdGxuZywgcmFkaXVzLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuQ2lyY2xlTWFya2VyIGlzIGEgY2lyY2xlIG92ZXJsYXkgd2l0aCBhIHBlcm1hbmVudCBwaXhlbCByYWRpdXMuXHJcbiAqL1xyXG5cclxuTC5DaXJjbGVNYXJrZXIgPSBMLkNpcmNsZS5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdHJhZGl1czogMTAsXHJcblx0XHR3ZWlnaHQ6IDJcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5nLCBvcHRpb25zKSB7XHJcblx0XHRMLkNpcmNsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZywgbnVsbCwgb3B0aW9ucyk7XHJcblx0XHR0aGlzLl9yYWRpdXMgPSB0aGlzLm9wdGlvbnMucmFkaXVzO1xyXG5cdH0sXHJcblxyXG5cdHByb2plY3RMYXRsbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9wb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fbGF0bG5nKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3R5bGUgOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkNpcmNsZS5wcm90b3R5cGUuX3VwZGF0ZVN0eWxlLmNhbGwodGhpcyk7XHJcblx0XHR0aGlzLnNldFJhZGl1cyh0aGlzLm9wdGlvbnMucmFkaXVzKTtcclxuXHR9LFxyXG5cclxuXHRzZXRMYXRMbmc6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdEwuQ2lyY2xlLnByb3RvdHlwZS5zZXRMYXRMbmcuY2FsbCh0aGlzLCBsYXRsbmcpO1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwICYmIHRoaXMuX3BvcHVwLl9pc09wZW4pIHtcclxuXHRcdFx0dGhpcy5fcG9wdXAuc2V0TGF0TG5nKGxhdGxuZyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRSYWRpdXM6IGZ1bmN0aW9uIChyYWRpdXMpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5yYWRpdXMgPSB0aGlzLl9yYWRpdXMgPSByYWRpdXM7XHJcblx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHR9LFxyXG5cclxuXHRnZXRSYWRpdXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9yYWRpdXM7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuY2lyY2xlTWFya2VyID0gZnVuY3Rpb24gKGxhdGxuZywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5DaXJjbGVNYXJrZXIobGF0bG5nLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEV4dGVuZHMgTC5Qb2x5bGluZSB0byBiZSBhYmxlIHRvIG1hbnVhbGx5IGRldGVjdCBjbGlja3Mgb24gQ2FudmFzLXJlbmRlcmVkIHBvbHlsaW5lcy5cclxuICovXHJcblxyXG5MLlBvbHlsaW5lLmluY2x1ZGUoIUwuUGF0aC5DQU5WQVMgPyB7fSA6IHtcclxuXHRfY29udGFpbnNQb2ludDogZnVuY3Rpb24gKHAsIGNsb3NlZCkge1xyXG5cdFx0dmFyIGksIGosIGssIGxlbiwgbGVuMiwgZGlzdCwgcGFydCxcclxuXHRcdCAgICB3ID0gdGhpcy5vcHRpb25zLndlaWdodCAvIDI7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci50b3VjaCkge1xyXG5cdFx0XHR3ICs9IDEwOyAvLyBwb2x5bGluZSBjbGljayB0b2xlcmFuY2Ugb24gdG91Y2ggZGV2aWNlc1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX3BhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHBhcnQgPSB0aGlzLl9wYXJ0c1tpXTtcclxuXHRcdFx0Zm9yIChqID0gMCwgbGVuMiA9IHBhcnQubGVuZ3RoLCBrID0gbGVuMiAtIDE7IGogPCBsZW4yOyBrID0gaisrKSB7XHJcblx0XHRcdFx0aWYgKCFjbG9zZWQgJiYgKGogPT09IDApKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGRpc3QgPSBMLkxpbmVVdGlsLnBvaW50VG9TZWdtZW50RGlzdGFuY2UocCwgcGFydFtrXSwgcGFydFtqXSk7XHJcblxyXG5cdFx0XHRcdGlmIChkaXN0IDw9IHcpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBFeHRlbmRzIEwuUG9seWdvbiB0byBiZSBhYmxlIHRvIG1hbnVhbGx5IGRldGVjdCBjbGlja3Mgb24gQ2FudmFzLXJlbmRlcmVkIHBvbHlnb25zLlxyXG4gKi9cclxuXHJcbkwuUG9seWdvbi5pbmNsdWRlKCFMLlBhdGguQ0FOVkFTID8ge30gOiB7XHJcblx0X2NvbnRhaW5zUG9pbnQ6IGZ1bmN0aW9uIChwKSB7XHJcblx0XHR2YXIgaW5zaWRlID0gZmFsc2UsXHJcblx0XHQgICAgcGFydCwgcDEsIHAyLFxyXG5cdFx0ICAgIGksIGosIGssXHJcblx0XHQgICAgbGVuLCBsZW4yO1xyXG5cclxuXHRcdC8vIFRPRE8gb3B0aW1pemF0aW9uOiBjaGVjayBpZiB3aXRoaW4gYm91bmRzIGZpcnN0XHJcblxyXG5cdFx0aWYgKEwuUG9seWxpbmUucHJvdG90eXBlLl9jb250YWluc1BvaW50LmNhbGwodGhpcywgcCwgdHJ1ZSkpIHtcclxuXHRcdFx0Ly8gY2xpY2sgb24gcG9seWdvbiBib3JkZXJcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gcmF5IGNhc3RpbmcgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgaWYgcG9pbnQgaXMgaW4gcG9seWdvblxyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX3BhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHBhcnQgPSB0aGlzLl9wYXJ0c1tpXTtcclxuXHJcblx0XHRcdGZvciAoaiA9IDAsIGxlbjIgPSBwYXJ0Lmxlbmd0aCwgayA9IGxlbjIgLSAxOyBqIDwgbGVuMjsgayA9IGorKykge1xyXG5cdFx0XHRcdHAxID0gcGFydFtqXTtcclxuXHRcdFx0XHRwMiA9IHBhcnRba107XHJcblxyXG5cdFx0XHRcdGlmICgoKHAxLnkgPiBwLnkpICE9PSAocDIueSA+IHAueSkpICYmXHJcblx0XHRcdFx0XHRcdChwLnggPCAocDIueCAtIHAxLngpICogKHAueSAtIHAxLnkpIC8gKHAyLnkgLSBwMS55KSArIHAxLngpKSB7XHJcblx0XHRcdFx0XHRpbnNpZGUgPSAhaW5zaWRlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBpbnNpZGU7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEV4dGVuZHMgTC5DaXJjbGUgd2l0aCBDYW52YXMtc3BlY2lmaWMgY29kZS5cclxuICovXHJcblxyXG5MLkNpcmNsZS5pbmNsdWRlKCFMLlBhdGguQ0FOVkFTID8ge30gOiB7XHJcblx0X2RyYXdQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcCA9IHRoaXMuX3BvaW50O1xyXG5cdFx0dGhpcy5fY3R4LmJlZ2luUGF0aCgpO1xyXG5cdFx0dGhpcy5fY3R4LmFyYyhwLngsIHAueSwgdGhpcy5fcmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG5cdH0sXHJcblxyXG5cdF9jb250YWluc1BvaW50OiBmdW5jdGlvbiAocCkge1xyXG5cdFx0dmFyIGNlbnRlciA9IHRoaXMuX3BvaW50LFxyXG5cdFx0ICAgIHcyID0gdGhpcy5vcHRpb25zLnN0cm9rZSA/IHRoaXMub3B0aW9ucy53ZWlnaHQgLyAyIDogMDtcclxuXHJcblx0XHRyZXR1cm4gKHAuZGlzdGFuY2VUbyhjZW50ZXIpIDw9IHRoaXMuX3JhZGl1cyArIHcyKTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcbiAqIENpcmNsZU1hcmtlciBjYW52YXMgc3BlY2lmaWMgZHJhd2luZyBwYXJ0cy5cbiAqL1xuXG5MLkNpcmNsZU1hcmtlci5pbmNsdWRlKCFMLlBhdGguQ0FOVkFTID8ge30gOiB7XG5cdF91cGRhdGVTdHlsZTogZnVuY3Rpb24gKCkge1xuXHRcdEwuUGF0aC5wcm90b3R5cGUuX3VwZGF0ZVN0eWxlLmNhbGwodGhpcyk7XG5cdH1cbn0pO1xuXG5cbi8qXHJcbiAqIEwuR2VvSlNPTiB0dXJucyBhbnkgR2VvSlNPTiBkYXRhIGludG8gYSBMZWFmbGV0IGxheWVyLlxyXG4gKi9cclxuXHJcbkwuR2VvSlNPTiA9IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChnZW9qc29uLCBvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzID0ge307XHJcblxyXG5cdFx0aWYgKGdlb2pzb24pIHtcclxuXHRcdFx0dGhpcy5hZGREYXRhKGdlb2pzb24pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZERhdGE6IGZ1bmN0aW9uIChnZW9qc29uKSB7XHJcblx0XHR2YXIgZmVhdHVyZXMgPSBMLlV0aWwuaXNBcnJheShnZW9qc29uKSA/IGdlb2pzb24gOiBnZW9qc29uLmZlYXR1cmVzLFxyXG5cdFx0ICAgIGksIGxlbiwgZmVhdHVyZTtcclxuXHJcblx0XHRpZiAoZmVhdHVyZXMpIHtcclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gZmVhdHVyZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHQvLyBPbmx5IGFkZCB0aGlzIGlmIGdlb21ldHJ5IG9yIGdlb21ldHJpZXMgYXJlIHNldCBhbmQgbm90IG51bGxcclxuXHRcdFx0XHRmZWF0dXJlID0gZmVhdHVyZXNbaV07XHJcblx0XHRcdFx0aWYgKGZlYXR1cmUuZ2VvbWV0cmllcyB8fCBmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZmVhdHVyZXMgfHwgZmVhdHVyZS5jb29yZGluYXRlcykge1xyXG5cdFx0XHRcdFx0dGhpcy5hZGREYXRhKGZlYXR1cmVzW2ldKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZmlsdGVyICYmICFvcHRpb25zLmZpbHRlcihnZW9qc29uKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbGF5ZXIgPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGdlb2pzb24sIG9wdGlvbnMucG9pbnRUb0xheWVyLCBvcHRpb25zLmNvb3Jkc1RvTGF0TG5nLCBvcHRpb25zKTtcclxuXHRcdGxheWVyLmZlYXR1cmUgPSBMLkdlb0pTT04uYXNGZWF0dXJlKGdlb2pzb24pO1xyXG5cclxuXHRcdGxheWVyLmRlZmF1bHRPcHRpb25zID0gbGF5ZXIub3B0aW9ucztcclxuXHRcdHRoaXMucmVzZXRTdHlsZShsYXllcik7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub25FYWNoRmVhdHVyZSkge1xyXG5cdFx0XHRvcHRpb25zLm9uRWFjaEZlYXR1cmUoZ2VvanNvbiwgbGF5ZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmFkZExheWVyKGxheWVyKTtcclxuXHR9LFxyXG5cclxuXHRyZXNldFN0eWxlOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBzdHlsZSA9IHRoaXMub3B0aW9ucy5zdHlsZTtcclxuXHRcdGlmIChzdHlsZSkge1xyXG5cdFx0XHQvLyByZXNldCBhbnkgY3VzdG9tIHN0eWxlc1xyXG5cdFx0XHRMLlV0aWwuZXh0ZW5kKGxheWVyLm9wdGlvbnMsIGxheWVyLmRlZmF1bHRPcHRpb25zKTtcclxuXHJcblx0XHRcdHRoaXMuX3NldExheWVyU3R5bGUobGF5ZXIsIHN0eWxlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRzZXRTdHlsZTogZnVuY3Rpb24gKHN0eWxlKSB7XHJcblx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0dGhpcy5fc2V0TGF5ZXJTdHlsZShsYXllciwgc3R5bGUpO1xyXG5cdFx0fSwgdGhpcyk7XHJcblx0fSxcclxuXHJcblx0X3NldExheWVyU3R5bGU6IGZ1bmN0aW9uIChsYXllciwgc3R5bGUpIHtcclxuXHRcdGlmICh0eXBlb2Ygc3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0c3R5bGUgPSBzdHlsZShsYXllci5mZWF0dXJlKTtcclxuXHRcdH1cclxuXHRcdGlmIChsYXllci5zZXRTdHlsZSkge1xyXG5cdFx0XHRsYXllci5zZXRTdHlsZShzdHlsZSk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXHJcbkwuZXh0ZW5kKEwuR2VvSlNPTiwge1xyXG5cdGdlb21ldHJ5VG9MYXllcjogZnVuY3Rpb24gKGdlb2pzb24sIHBvaW50VG9MYXllciwgY29vcmRzVG9MYXRMbmcsIHZlY3Rvck9wdGlvbnMpIHtcclxuXHRcdHZhciBnZW9tZXRyeSA9IGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmUnID8gZ2VvanNvbi5nZW9tZXRyeSA6IGdlb2pzb24sXHJcblx0XHQgICAgY29vcmRzID0gZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXHJcblx0XHQgICAgbGF5ZXJzID0gW10sXHJcblx0XHQgICAgbGF0bG5nLCBsYXRsbmdzLCBpLCBsZW47XHJcblxyXG5cdFx0Y29vcmRzVG9MYXRMbmcgPSBjb29yZHNUb0xhdExuZyB8fCB0aGlzLmNvb3Jkc1RvTGF0TG5nO1xyXG5cclxuXHRcdHN3aXRjaCAoZ2VvbWV0cnkudHlwZSkge1xyXG5cdFx0Y2FzZSAnUG9pbnQnOlxyXG5cdFx0XHRsYXRsbmcgPSBjb29yZHNUb0xhdExuZyhjb29yZHMpO1xyXG5cdFx0XHRyZXR1cm4gcG9pbnRUb0xheWVyID8gcG9pbnRUb0xheWVyKGdlb2pzb24sIGxhdGxuZykgOiBuZXcgTC5NYXJrZXIobGF0bG5nKTtcclxuXHJcblx0XHRjYXNlICdNdWx0aVBvaW50JzpcclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gY29vcmRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0bGF0bG5nID0gY29vcmRzVG9MYXRMbmcoY29vcmRzW2ldKTtcclxuXHRcdFx0XHRsYXllcnMucHVzaChwb2ludFRvTGF5ZXIgPyBwb2ludFRvTGF5ZXIoZ2VvanNvbiwgbGF0bG5nKSA6IG5ldyBMLk1hcmtlcihsYXRsbmcpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuRmVhdHVyZUdyb3VwKGxheWVycyk7XHJcblxyXG5cdFx0Y2FzZSAnTGluZVN0cmluZyc6XHJcblx0XHRcdGxhdGxuZ3MgPSB0aGlzLmNvb3Jkc1RvTGF0TG5ncyhjb29yZHMsIDAsIGNvb3Jkc1RvTGF0TG5nKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvbHlsaW5lKGxhdGxuZ3MsIHZlY3Rvck9wdGlvbnMpO1xyXG5cclxuXHRcdGNhc2UgJ1BvbHlnb24nOlxyXG5cdFx0XHRpZiAoY29vcmRzLmxlbmd0aCA9PT0gMiAmJiAhY29vcmRzWzFdLmxlbmd0aCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHZW9KU09OIG9iamVjdC4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRsYXRsbmdzID0gdGhpcy5jb29yZHNUb0xhdExuZ3MoY29vcmRzLCAxLCBjb29yZHNUb0xhdExuZyk7XHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2x5Z29uKGxhdGxuZ3MsIHZlY3Rvck9wdGlvbnMpO1xyXG5cclxuXHRcdGNhc2UgJ011bHRpTGluZVN0cmluZyc6XHJcblx0XHRcdGxhdGxuZ3MgPSB0aGlzLmNvb3Jkc1RvTGF0TG5ncyhjb29yZHMsIDEsIGNvb3Jkc1RvTGF0TG5nKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBMLk11bHRpUG9seWxpbmUobGF0bG5ncywgdmVjdG9yT3B0aW9ucyk7XHJcblxyXG5cdFx0Y2FzZSAnTXVsdGlQb2x5Z29uJzpcclxuXHRcdFx0bGF0bG5ncyA9IHRoaXMuY29vcmRzVG9MYXRMbmdzKGNvb3JkcywgMiwgY29vcmRzVG9MYXRMbmcpO1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuTXVsdGlQb2x5Z29uKGxhdGxuZ3MsIHZlY3Rvck9wdGlvbnMpO1xyXG5cclxuXHRcdGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGdlb21ldHJ5Lmdlb21ldHJpZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHRcdFx0bGF5ZXJzLnB1c2godGhpcy5nZW9tZXRyeVRvTGF5ZXIoe1xyXG5cdFx0XHRcdFx0Z2VvbWV0cnk6IGdlb21ldHJ5Lmdlb21ldHJpZXNbaV0sXHJcblx0XHRcdFx0XHR0eXBlOiAnRmVhdHVyZScsXHJcblx0XHRcdFx0XHRwcm9wZXJ0aWVzOiBnZW9qc29uLnByb3BlcnRpZXNcclxuXHRcdFx0XHR9LCBwb2ludFRvTGF5ZXIsIGNvb3Jkc1RvTGF0TG5nLCB2ZWN0b3JPcHRpb25zKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG5ldyBMLkZlYXR1cmVHcm91cChsYXllcnMpO1xyXG5cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHZW9KU09OIG9iamVjdC4nKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRjb29yZHNUb0xhdExuZzogZnVuY3Rpb24gKGNvb3JkcykgeyAvLyAoQXJyYXlbLCBCb29sZWFuXSkgLT4gTGF0TG5nXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGNvb3Jkc1sxXSwgY29vcmRzWzBdLCBjb29yZHNbMl0pO1xyXG5cdH0sXHJcblxyXG5cdGNvb3Jkc1RvTGF0TG5nczogZnVuY3Rpb24gKGNvb3JkcywgbGV2ZWxzRGVlcCwgY29vcmRzVG9MYXRMbmcpIHsgLy8gKEFycmF5WywgTnVtYmVyLCBGdW5jdGlvbl0pIC0+IEFycmF5XHJcblx0XHR2YXIgbGF0bG5nLCBpLCBsZW4sXHJcblx0XHQgICAgbGF0bG5ncyA9IFtdO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRsYXRsbmcgPSBsZXZlbHNEZWVwID9cclxuXHRcdFx0ICAgICAgICB0aGlzLmNvb3Jkc1RvTGF0TG5ncyhjb29yZHNbaV0sIGxldmVsc0RlZXAgLSAxLCBjb29yZHNUb0xhdExuZykgOlxyXG5cdFx0XHQgICAgICAgIChjb29yZHNUb0xhdExuZyB8fCB0aGlzLmNvb3Jkc1RvTGF0TG5nKShjb29yZHNbaV0pO1xyXG5cclxuXHRcdFx0bGF0bG5ncy5wdXNoKGxhdGxuZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGxhdGxuZ3M7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nVG9Db29yZHM6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHZhciBjb29yZHMgPSBbbGF0bG5nLmxuZywgbGF0bG5nLmxhdF07XHJcblxyXG5cdFx0aWYgKGxhdGxuZy5hbHQgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRjb29yZHMucHVzaChsYXRsbmcuYWx0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBjb29yZHM7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nc1RvQ29vcmRzOiBmdW5jdGlvbiAobGF0TG5ncykge1xyXG5cdFx0dmFyIGNvb3JkcyA9IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBsYXRMbmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGNvb3Jkcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdUb0Nvb3JkcyhsYXRMbmdzW2ldKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNvb3JkcztcclxuXHR9LFxyXG5cclxuXHRnZXRGZWF0dXJlOiBmdW5jdGlvbiAobGF5ZXIsIG5ld0dlb21ldHJ5KSB7XHJcblx0XHRyZXR1cm4gbGF5ZXIuZmVhdHVyZSA/IEwuZXh0ZW5kKHt9LCBsYXllci5mZWF0dXJlLCB7Z2VvbWV0cnk6IG5ld0dlb21ldHJ5fSkgOiBMLkdlb0pTT04uYXNGZWF0dXJlKG5ld0dlb21ldHJ5KTtcclxuXHR9LFxyXG5cclxuXHRhc0ZlYXR1cmU6IGZ1bmN0aW9uIChnZW9KU09OKSB7XHJcblx0XHRpZiAoZ2VvSlNPTi50eXBlID09PSAnRmVhdHVyZScpIHtcclxuXHRcdFx0cmV0dXJuIGdlb0pTT047XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dHlwZTogJ0ZlYXR1cmUnLFxyXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fSxcclxuXHRcdFx0Z2VvbWV0cnk6IGdlb0pTT05cclxuXHRcdH07XHJcblx0fVxyXG59KTtcclxuXHJcbnZhciBQb2ludFRvR2VvSlNPTiA9IHtcclxuXHR0b0dlb0pTT046IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBMLkdlb0pTT04uZ2V0RmVhdHVyZSh0aGlzLCB7XHJcblx0XHRcdHR5cGU6ICdQb2ludCcsXHJcblx0XHRcdGNvb3JkaW5hdGVzOiBMLkdlb0pTT04ubGF0TG5nVG9Db29yZHModGhpcy5nZXRMYXRMbmcoKSlcclxuXHRcdH0pO1xyXG5cdH1cclxufTtcclxuXHJcbkwuTWFya2VyLmluY2x1ZGUoUG9pbnRUb0dlb0pTT04pO1xyXG5MLkNpcmNsZS5pbmNsdWRlKFBvaW50VG9HZW9KU09OKTtcclxuTC5DaXJjbGVNYXJrZXIuaW5jbHVkZShQb2ludFRvR2VvSlNPTik7XHJcblxyXG5MLlBvbHlsaW5lLmluY2x1ZGUoe1xyXG5cdHRvR2VvSlNPTjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIEwuR2VvSlNPTi5nZXRGZWF0dXJlKHRoaXMsIHtcclxuXHRcdFx0dHlwZTogJ0xpbmVTdHJpbmcnLFxyXG5cdFx0XHRjb29yZGluYXRlczogTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyh0aGlzLmdldExhdExuZ3MoKSlcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLlBvbHlnb24uaW5jbHVkZSh7XHJcblx0dG9HZW9KU09OOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29vcmRzID0gW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHModGhpcy5nZXRMYXRMbmdzKCkpXSxcclxuXHRcdCAgICBpLCBsZW4sIGhvbGU7XHJcblxyXG5cdFx0Y29vcmRzWzBdLnB1c2goY29vcmRzWzBdWzBdKTtcclxuXHJcblx0XHRpZiAodGhpcy5faG9sZXMpIHtcclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5faG9sZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRob2xlID0gTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyh0aGlzLl9ob2xlc1tpXSk7XHJcblx0XHRcdFx0aG9sZS5wdXNoKGhvbGVbMF0pO1xyXG5cdFx0XHRcdGNvb3Jkcy5wdXNoKGhvbGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIEwuR2VvSlNPTi5nZXRGZWF0dXJlKHRoaXMsIHtcclxuXHRcdFx0dHlwZTogJ1BvbHlnb24nLFxyXG5cdFx0XHRjb29yZGluYXRlczogY29vcmRzXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHRmdW5jdGlvbiBtdWx0aVRvR2VvSlNPTih0eXBlKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR2YXIgY29vcmRzID0gW107XHJcblxyXG5cdFx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0XHRjb29yZHMucHVzaChsYXllci50b0dlb0pTT04oKS5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIEwuR2VvSlNPTi5nZXRGZWF0dXJlKHRoaXMsIHtcclxuXHRcdFx0XHR0eXBlOiB0eXBlLFxyXG5cdFx0XHRcdGNvb3JkaW5hdGVzOiBjb29yZHNcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0TC5NdWx0aVBvbHlsaW5lLmluY2x1ZGUoe3RvR2VvSlNPTjogbXVsdGlUb0dlb0pTT04oJ011bHRpTGluZVN0cmluZycpfSk7XHJcblx0TC5NdWx0aVBvbHlnb24uaW5jbHVkZSh7dG9HZW9KU09OOiBtdWx0aVRvR2VvSlNPTignTXVsdGlQb2x5Z29uJyl9KTtcclxuXHJcblx0TC5MYXllckdyb3VwLmluY2x1ZGUoe1xyXG5cdFx0dG9HZW9KU09OOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0XHR2YXIgZ2VvbWV0cnkgPSB0aGlzLmZlYXR1cmUgJiYgdGhpcy5mZWF0dXJlLmdlb21ldHJ5LFxyXG5cdFx0XHRcdGpzb25zID0gW10sXHJcblx0XHRcdFx0anNvbjtcclxuXHJcblx0XHRcdGlmIChnZW9tZXRyeSAmJiBnZW9tZXRyeS50eXBlID09PSAnTXVsdGlQb2ludCcpIHtcclxuXHRcdFx0XHRyZXR1cm4gbXVsdGlUb0dlb0pTT04oJ011bHRpUG9pbnQnKS5jYWxsKHRoaXMpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgaXNHZW9tZXRyeUNvbGxlY3Rpb24gPSBnZW9tZXRyeSAmJiBnZW9tZXRyeS50eXBlID09PSAnR2VvbWV0cnlDb2xsZWN0aW9uJztcclxuXHJcblx0XHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHRcdGlmIChsYXllci50b0dlb0pTT04pIHtcclxuXHRcdFx0XHRcdGpzb24gPSBsYXllci50b0dlb0pTT04oKTtcclxuXHRcdFx0XHRcdGpzb25zLnB1c2goaXNHZW9tZXRyeUNvbGxlY3Rpb24gPyBqc29uLmdlb21ldHJ5IDogTC5HZW9KU09OLmFzRmVhdHVyZShqc29uKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmIChpc0dlb21ldHJ5Q29sbGVjdGlvbikge1xyXG5cdFx0XHRcdHJldHVybiBMLkdlb0pTT04uZ2V0RmVhdHVyZSh0aGlzLCB7XHJcblx0XHRcdFx0XHRnZW9tZXRyaWVzOiBqc29ucyxcclxuXHRcdFx0XHRcdHR5cGU6ICdHZW9tZXRyeUNvbGxlY3Rpb24nXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0dHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcclxuXHRcdFx0XHRmZWF0dXJlczoganNvbnNcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9KTtcclxufSgpKTtcclxuXHJcbkwuZ2VvSnNvbiA9IGZ1bmN0aW9uIChnZW9qc29uLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkdlb0pTT04oZ2VvanNvbiwgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkRvbUV2ZW50IGNvbnRhaW5zIGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoIERPTSBldmVudHMuXHJcbiAqL1xyXG5cclxuTC5Eb21FdmVudCA9IHtcclxuXHQvKiBpbnNwaXJlZCBieSBKb2huIFJlc2lnLCBEZWFuIEVkd2FyZHMgYW5kIFlVSSBhZGRFdmVudCBpbXBsZW1lbnRhdGlvbnMgKi9cclxuXHRhZGRMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgdHlwZSwgZm4sIGNvbnRleHQpIHsgLy8gKEhUTUxFbGVtZW50LCBTdHJpbmcsIEZ1bmN0aW9uWywgT2JqZWN0XSlcclxuXHJcblx0XHR2YXIgaWQgPSBMLnN0YW1wKGZuKSxcclxuXHRcdCAgICBrZXkgPSAnX2xlYWZsZXRfJyArIHR5cGUgKyBpZCxcclxuXHRcdCAgICBoYW5kbGVyLCBvcmlnaW5hbEhhbmRsZXIsIG5ld1R5cGU7XHJcblxyXG5cdFx0aWYgKG9ialtrZXldKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0aGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdHJldHVybiBmbi5jYWxsKGNvbnRleHQgfHwgb2JqLCBlIHx8IEwuRG9tRXZlbnQuX2dldEV2ZW50KCkpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIgJiYgdHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZFBvaW50ZXJMaXN0ZW5lcihvYmosIHR5cGUsIGhhbmRsZXIsIGlkKTtcclxuXHRcdH1cclxuXHRcdGlmIChMLkJyb3dzZXIudG91Y2ggJiYgKHR5cGUgPT09ICdkYmxjbGljaycpICYmIHRoaXMuYWRkRG91YmxlVGFwTGlzdGVuZXIpIHtcclxuXHRcdFx0dGhpcy5hZGREb3VibGVUYXBMaXN0ZW5lcihvYmosIGhhbmRsZXIsIGlkKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIG9iaikge1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgPT09ICdtb3VzZXdoZWVsJykge1xyXG5cdFx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYgKCh0eXBlID09PSAnbW91c2VlbnRlcicpIHx8ICh0eXBlID09PSAnbW91c2VsZWF2ZScpKSB7XHJcblxyXG5cdFx0XHRcdG9yaWdpbmFsSGFuZGxlciA9IGhhbmRsZXI7XHJcblx0XHRcdFx0bmV3VHlwZSA9ICh0eXBlID09PSAnbW91c2VlbnRlcicgPyAnbW91c2VvdmVyJyA6ICdtb3VzZW91dCcpO1xyXG5cclxuXHRcdFx0XHRoYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdGlmICghTC5Eb21FdmVudC5fY2hlY2tNb3VzZShvYmosIGUpKSB7IHJldHVybjsgfVxyXG5cdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsSGFuZGxlcihlKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcihuZXdUeXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdjbGljaycgJiYgTC5Ccm93c2VyLmFuZHJvaWQpIHtcclxuXHRcdFx0XHRvcmlnaW5hbEhhbmRsZXIgPSBoYW5kbGVyO1xyXG5cdFx0XHRcdGhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIEwuRG9tRXZlbnQuX2ZpbHRlckNsaWNrKGUsIG9yaWdpbmFsSGFuZGxlcik7XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gZWxzZSBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBvYmopIHtcclxuXHRcdFx0b2JqLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBoYW5kbGVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRvYmpba2V5XSA9IGhhbmRsZXI7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZuKSB7ICAvLyAoSFRNTEVsZW1lbnQsIFN0cmluZywgRnVuY3Rpb24pXHJcblxyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChmbiksXHJcblx0XHQgICAga2V5ID0gJ19sZWFmbGV0XycgKyB0eXBlICsgaWQsXHJcblx0XHQgICAgaGFuZGxlciA9IG9ialtrZXldO1xyXG5cclxuXHRcdGlmICghaGFuZGxlcikgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIucG9pbnRlciAmJiB0eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcclxuXHRcdFx0dGhpcy5yZW1vdmVQb2ludGVyTGlzdGVuZXIob2JqLCB0eXBlLCBpZCk7XHJcblx0XHR9IGVsc2UgaWYgKEwuQnJvd3Nlci50b3VjaCAmJiAodHlwZSA9PT0gJ2RibGNsaWNrJykgJiYgdGhpcy5yZW1vdmVEb3VibGVUYXBMaXN0ZW5lcikge1xyXG5cdFx0XHR0aGlzLnJlbW92ZURvdWJsZVRhcExpc3RlbmVyKG9iaiwgaWQpO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAoJ3JlbW92ZUV2ZW50TGlzdGVuZXInIGluIG9iaikge1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgPT09ICdtb3VzZXdoZWVsJykge1xyXG5cdFx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYgKCh0eXBlID09PSAnbW91c2VlbnRlcicpIHx8ICh0eXBlID09PSAnbW91c2VsZWF2ZScpKSB7XHJcblx0XHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoKHR5cGUgPT09ICdtb3VzZWVudGVyJyA/ICdtb3VzZW92ZXInIDogJ21vdXNlb3V0JyksIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoJ2RldGFjaEV2ZW50JyBpbiBvYmopIHtcclxuXHRcdFx0b2JqLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBoYW5kbGVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRvYmpba2V5XSA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c3RvcFByb3BhZ2F0aW9uOiBmdW5jdGlvbiAoZSkge1xyXG5cclxuXHRcdGlmIChlLnN0b3BQcm9wYWdhdGlvbikge1xyXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0TC5Eb21FdmVudC5fc2tpcHBlZChlKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRkaXNhYmxlU2Nyb2xsUHJvcGFnYXRpb246IGZ1bmN0aW9uIChlbCkge1xyXG5cdFx0dmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcclxuXHJcblx0XHRyZXR1cm4gTC5Eb21FdmVudFxyXG5cdFx0XHQub24oZWwsICdtb3VzZXdoZWVsJywgc3RvcClcclxuXHRcdFx0Lm9uKGVsLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIHN0b3ApO1xyXG5cdH0sXHJcblxyXG5cdGRpc2FibGVDbGlja1Byb3BhZ2F0aW9uOiBmdW5jdGlvbiAoZWwpIHtcclxuXHRcdHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IEwuRHJhZ2dhYmxlLlNUQVJULmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQub24oZWwsIEwuRHJhZ2dhYmxlLlNUQVJUW2ldLCBzdG9wKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gTC5Eb21FdmVudFxyXG5cdFx0XHQub24oZWwsICdjbGljaycsIEwuRG9tRXZlbnQuX2Zha2VTdG9wKVxyXG5cdFx0XHQub24oZWwsICdkYmxjbGljaycsIHN0b3ApO1xyXG5cdH0sXHJcblxyXG5cdHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbiAoZSkge1xyXG5cclxuXHRcdGlmIChlLnByZXZlbnREZWZhdWx0KSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHN0b3A6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRyZXR1cm4gTC5Eb21FdmVudFxyXG5cdFx0XHQucHJldmVudERlZmF1bHQoZSlcclxuXHRcdFx0LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHR9LFxyXG5cclxuXHRnZXRNb3VzZVBvc2l0aW9uOiBmdW5jdGlvbiAoZSwgY29udGFpbmVyKSB7XHJcblx0XHRpZiAoIWNvbnRhaW5lcikge1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciByZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludChcclxuXHRcdFx0ZS5jbGllbnRYIC0gcmVjdC5sZWZ0IC0gY29udGFpbmVyLmNsaWVudExlZnQsXHJcblx0XHRcdGUuY2xpZW50WSAtIHJlY3QudG9wIC0gY29udGFpbmVyLmNsaWVudFRvcCk7XHJcblx0fSxcclxuXHJcblx0Z2V0V2hlZWxEZWx0YTogZnVuY3Rpb24gKGUpIHtcclxuXHJcblx0XHR2YXIgZGVsdGEgPSAwO1xyXG5cclxuXHRcdGlmIChlLndoZWVsRGVsdGEpIHtcclxuXHRcdFx0ZGVsdGEgPSBlLndoZWVsRGVsdGEgLyAxMjA7XHJcblx0XHR9XHJcblx0XHRpZiAoZS5kZXRhaWwpIHtcclxuXHRcdFx0ZGVsdGEgPSAtZS5kZXRhaWwgLyAzO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlbHRhO1xyXG5cdH0sXHJcblxyXG5cdF9za2lwRXZlbnRzOiB7fSxcclxuXHJcblx0X2Zha2VTdG9wOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0Ly8gZmFrZXMgc3RvcFByb3BhZ2F0aW9uIGJ5IHNldHRpbmcgYSBzcGVjaWFsIGV2ZW50IGZsYWcsIGNoZWNrZWQvcmVzZXQgd2l0aCBMLkRvbUV2ZW50Ll9za2lwcGVkKGUpXHJcblx0XHRMLkRvbUV2ZW50Ll9za2lwRXZlbnRzW2UudHlwZV0gPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdF9za2lwcGVkOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIHNraXBwZWQgPSB0aGlzLl9za2lwRXZlbnRzW2UudHlwZV07XHJcblx0XHQvLyByZXNldCB3aGVuIGNoZWNraW5nLCBhcyBpdCdzIG9ubHkgdXNlZCBpbiBtYXAgY29udGFpbmVyIGFuZCBwcm9wYWdhdGVzIG91dHNpZGUgb2YgdGhlIG1hcFxyXG5cdFx0dGhpcy5fc2tpcEV2ZW50c1tlLnR5cGVdID0gZmFsc2U7XHJcblx0XHRyZXR1cm4gc2tpcHBlZDtcclxuXHR9LFxyXG5cclxuXHQvLyBjaGVjayBpZiBlbGVtZW50IHJlYWxseSBsZWZ0L2VudGVyZWQgdGhlIGV2ZW50IHRhcmdldCAoZm9yIG1vdXNlZW50ZXIvbW91c2VsZWF2ZSlcclxuXHRfY2hlY2tNb3VzZTogZnVuY3Rpb24gKGVsLCBlKSB7XHJcblxyXG5cdFx0dmFyIHJlbGF0ZWQgPSBlLnJlbGF0ZWRUYXJnZXQ7XHJcblxyXG5cdFx0aWYgKCFyZWxhdGVkKSB7IHJldHVybiB0cnVlOyB9XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0d2hpbGUgKHJlbGF0ZWQgJiYgKHJlbGF0ZWQgIT09IGVsKSkge1xyXG5cdFx0XHRcdHJlbGF0ZWQgPSByZWxhdGVkLnBhcmVudE5vZGU7XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKHJlbGF0ZWQgIT09IGVsKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0RXZlbnQ6IGZ1bmN0aW9uICgpIHsgLy8gZXZpbCBtYWdpYyBmb3IgSUVcclxuXHRcdC8qanNoaW50IG5vYXJnOmZhbHNlICovXHJcblx0XHR2YXIgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdGlmICghZSkge1xyXG5cdFx0XHR2YXIgY2FsbGVyID0gYXJndW1lbnRzLmNhbGxlZS5jYWxsZXI7XHJcblx0XHRcdHdoaWxlIChjYWxsZXIpIHtcclxuXHRcdFx0XHRlID0gY2FsbGVyWydhcmd1bWVudHMnXVswXTtcclxuXHRcdFx0XHRpZiAoZSAmJiB3aW5kb3cuRXZlbnQgPT09IGUuY29uc3RydWN0b3IpIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWxsZXIgPSBjYWxsZXIuY2FsbGVyO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZTtcclxuXHR9LFxyXG5cclxuXHQvLyB0aGlzIGlzIGEgaG9ycmlibGUgd29ya2Fyb3VuZCBmb3IgYSBidWcgaW4gQW5kcm9pZCB3aGVyZSBhIHNpbmdsZSB0b3VjaCB0cmlnZ2VycyB0d28gY2xpY2sgZXZlbnRzXHJcblx0X2ZpbHRlckNsaWNrOiBmdW5jdGlvbiAoZSwgaGFuZGxlcikge1xyXG5cdFx0dmFyIHRpbWVTdGFtcCA9IChlLnRpbWVTdGFtcCB8fCBlLm9yaWdpbmFsRXZlbnQudGltZVN0YW1wKSxcclxuXHRcdFx0ZWxhcHNlZCA9IEwuRG9tRXZlbnQuX2xhc3RDbGljayAmJiAodGltZVN0YW1wIC0gTC5Eb21FdmVudC5fbGFzdENsaWNrKTtcclxuXHJcblx0XHQvLyBhcmUgdGhleSBjbG9zZXIgdG9nZXRoZXIgdGhhbiA1MDBtcyB5ZXQgbW9yZSB0aGFuIDEwMG1zP1xyXG5cdFx0Ly8gQW5kcm9pZCB0eXBpY2FsbHkgdHJpZ2dlcnMgdGhlbSB+MzAwbXMgYXBhcnQgd2hpbGUgbXVsdGlwbGUgbGlzdGVuZXJzXHJcblx0XHQvLyBvbiB0aGUgc2FtZSBldmVudCBzaG91bGQgYmUgdHJpZ2dlcmVkIGZhciBmYXN0ZXI7XHJcblx0XHQvLyBvciBjaGVjayBpZiBjbGljayBpcyBzaW11bGF0ZWQgb24gdGhlIGVsZW1lbnQsIGFuZCBpZiBpdCBpcywgcmVqZWN0IGFueSBub24tc2ltdWxhdGVkIGV2ZW50c1xyXG5cclxuXHRcdGlmICgoZWxhcHNlZCAmJiBlbGFwc2VkID4gMTAwICYmIGVsYXBzZWQgPCA1MDApIHx8IChlLnRhcmdldC5fc2ltdWxhdGVkQ2xpY2sgJiYgIWUuX3NpbXVsYXRlZCkpIHtcclxuXHRcdFx0TC5Eb21FdmVudC5zdG9wKGUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRMLkRvbUV2ZW50Ll9sYXN0Q2xpY2sgPSB0aW1lU3RhbXA7XHJcblxyXG5cdFx0cmV0dXJuIGhhbmRsZXIoZSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5Eb21FdmVudC5vbiA9IEwuRG9tRXZlbnQuYWRkTGlzdGVuZXI7XHJcbkwuRG9tRXZlbnQub2ZmID0gTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcjtcclxuXG5cbi8qXHJcbiAqIEwuRHJhZ2dhYmxlIGFsbG93cyB5b3UgdG8gYWRkIGRyYWdnaW5nIGNhcGFiaWxpdGllcyB0byBhbnkgZWxlbWVudC4gU3VwcG9ydHMgbW9iaWxlIGRldmljZXMgdG9vLlxyXG4gKi9cclxuXHJcbkwuRHJhZ2dhYmxlID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0c3RhdGljczoge1xyXG5cdFx0U1RBUlQ6IEwuQnJvd3Nlci50b3VjaCA/IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSA6IFsnbW91c2Vkb3duJ10sXHJcblx0XHRFTkQ6IHtcclxuXHRcdFx0bW91c2Vkb3duOiAnbW91c2V1cCcsXHJcblx0XHRcdHRvdWNoc3RhcnQ6ICd0b3VjaGVuZCcsXHJcblx0XHRcdHBvaW50ZXJkb3duOiAndG91Y2hlbmQnLFxyXG5cdFx0XHRNU1BvaW50ZXJEb3duOiAndG91Y2hlbmQnXHJcblx0XHR9LFxyXG5cdFx0TU9WRToge1xyXG5cdFx0XHRtb3VzZWRvd246ICdtb3VzZW1vdmUnLFxyXG5cdFx0XHR0b3VjaHN0YXJ0OiAndG91Y2htb3ZlJyxcclxuXHRcdFx0cG9pbnRlcmRvd246ICd0b3VjaG1vdmUnLFxyXG5cdFx0XHRNU1BvaW50ZXJEb3duOiAndG91Y2htb3ZlJ1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChlbGVtZW50LCBkcmFnU3RhcnRUYXJnZXQpIHtcclxuXHRcdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xyXG5cdFx0dGhpcy5fZHJhZ1N0YXJ0VGFyZ2V0ID0gZHJhZ1N0YXJ0VGFyZ2V0IHx8IGVsZW1lbnQ7XHJcblx0fSxcclxuXHJcblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRmb3IgKHZhciBpID0gTC5EcmFnZ2FibGUuU1RBUlQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbih0aGlzLl9kcmFnU3RhcnRUYXJnZXQsIEwuRHJhZ2dhYmxlLlNUQVJUW2ldLCB0aGlzLl9vbkRvd24sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRmb3IgKHZhciBpID0gTC5EcmFnZ2FibGUuU1RBUlQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fZHJhZ1N0YXJ0VGFyZ2V0LCBMLkRyYWdnYWJsZS5TVEFSVFtpXSwgdGhpcy5fb25Eb3duLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9lbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdF9vbkRvd246IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChlLnNoaWZ0S2V5IHx8ICgoZS53aGljaCAhPT0gMSkgJiYgKGUuYnV0dG9uICE9PSAxKSAmJiAhZS50b3VjaGVzKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHJcblx0XHRpZiAoTC5EcmFnZ2FibGUuX2Rpc2FibGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdEwuRG9tVXRpbC5kaXNhYmxlSW1hZ2VEcmFnKCk7XHJcblx0XHRMLkRvbVV0aWwuZGlzYWJsZVRleHRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbW92aW5nKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGU7XHJcblxyXG5cdFx0dGhpcy5fc3RhcnRQb2ludCA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpO1xyXG5cdFx0dGhpcy5fc3RhcnRQb3MgPSB0aGlzLl9uZXdQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fZWxlbWVudCk7XHJcblxyXG5cdFx0TC5Eb21FdmVudFxyXG5cdFx0ICAgIC5vbihkb2N1bWVudCwgTC5EcmFnZ2FibGUuTU9WRVtlLnR5cGVdLCB0aGlzLl9vbk1vdmUsIHRoaXMpXHJcblx0XHQgICAgLm9uKGRvY3VtZW50LCBMLkRyYWdnYWJsZS5FTkRbZS50eXBlXSwgdGhpcy5fb25VcCwgdGhpcyk7XHJcblx0fSxcclxuXHJcblx0X29uTW92ZTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0dGhpcy5fbW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGZpcnN0ID0gKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID09PSAxID8gZS50b3VjaGVzWzBdIDogZSksXHJcblx0XHQgICAgbmV3UG9pbnQgPSBuZXcgTC5Qb2ludChmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZKSxcclxuXHRcdCAgICBvZmZzZXQgPSBuZXdQb2ludC5zdWJ0cmFjdCh0aGlzLl9zdGFydFBvaW50KTtcclxuXHJcblx0XHRpZiAoIW9mZnNldC54ICYmICFvZmZzZXQueSkgeyByZXR1cm47IH1cclxuXHRcdGlmIChMLkJyb3dzZXIudG91Y2ggJiYgTWF0aC5hYnMob2Zmc2V0LngpICsgTWF0aC5hYnMob2Zmc2V0LnkpIDwgMykgeyByZXR1cm47IH1cclxuXHJcblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xyXG5cclxuXHRcdGlmICghdGhpcy5fbW92ZWQpIHtcclxuXHRcdFx0dGhpcy5maXJlKCdkcmFnc3RhcnQnKTtcclxuXHJcblx0XHRcdHRoaXMuX21vdmVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5fc3RhcnRQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fZWxlbWVudCkuc3VidHJhY3Qob2Zmc2V0KTtcclxuXHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAnbGVhZmxldC1kcmFnZ2luZycpO1xyXG5cdFx0XHR0aGlzLl9sYXN0VGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fbGFzdFRhcmdldCwgJ2xlYWZsZXQtZHJhZy10YXJnZXQnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9uZXdQb3MgPSB0aGlzLl9zdGFydFBvcy5hZGQob2Zmc2V0KTtcclxuXHRcdHRoaXMuX21vdmluZyA9IHRydWU7XHJcblxyXG5cdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltUmVxdWVzdCk7XHJcblx0XHR0aGlzLl9hbmltUmVxdWVzdCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKHRoaXMuX3VwZGF0ZVBvc2l0aW9uLCB0aGlzLCB0cnVlLCB0aGlzLl9kcmFnU3RhcnRUYXJnZXQpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5maXJlKCdwcmVkcmFnJyk7XHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fZWxlbWVudCwgdGhpcy5fbmV3UG9zKTtcclxuXHRcdHRoaXMuZmlyZSgnZHJhZycpO1xyXG5cdH0sXHJcblxyXG5cdF9vblVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ2xlYWZsZXQtZHJhZ2dpbmcnKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbGFzdFRhcmdldCkge1xyXG5cdFx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fbGFzdFRhcmdldCwgJ2xlYWZsZXQtZHJhZy10YXJnZXQnKTtcclxuXHRcdFx0dGhpcy5fbGFzdFRhcmdldCA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiBMLkRyYWdnYWJsZS5NT1ZFKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRcclxuXHRcdFx0ICAgIC5vZmYoZG9jdW1lbnQsIEwuRHJhZ2dhYmxlLk1PVkVbaV0sIHRoaXMuX29uTW92ZSlcclxuXHRcdFx0ICAgIC5vZmYoZG9jdW1lbnQsIEwuRHJhZ2dhYmxlLkVORFtpXSwgdGhpcy5fb25VcCk7XHJcblx0XHR9XHJcblxyXG5cdFx0TC5Eb21VdGlsLmVuYWJsZUltYWdlRHJhZygpO1xyXG5cdFx0TC5Eb21VdGlsLmVuYWJsZVRleHRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbW92ZWQgJiYgdGhpcy5fbW92aW5nKSB7XHJcblx0XHRcdC8vIGVuc3VyZSBkcmFnIGlzIG5vdCBmaXJlZCBhZnRlciBkcmFnZW5kXHJcblx0XHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fYW5pbVJlcXVlc3QpO1xyXG5cclxuXHRcdFx0dGhpcy5maXJlKCdkcmFnZW5kJywge1xyXG5cdFx0XHRcdGRpc3RhbmNlOiB0aGlzLl9uZXdQb3MuZGlzdGFuY2VUbyh0aGlzLl9zdGFydFBvcylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fbW92aW5nID0gZmFsc2U7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXG5cdEwuSGFuZGxlciBpcyBhIGJhc2UgY2xhc3MgZm9yIGhhbmRsZXIgY2xhc3NlcyB0aGF0IGFyZSB1c2VkIGludGVybmFsbHkgdG8gaW5qZWN0XG5cdGludGVyYWN0aW9uIGZlYXR1cmVzIGxpa2UgZHJhZ2dpbmcgdG8gY2xhc3NlcyBsaWtlIE1hcCBhbmQgTWFya2VyLlxuKi9cblxuTC5IYW5kbGVyID0gTC5DbGFzcy5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobWFwKSB7XG5cdFx0dGhpcy5fbWFwID0gbWFwO1xuXHR9LFxuXG5cdGVuYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLl9lbmFibGVkKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy5fZW5hYmxlZCA9IHRydWU7XG5cdFx0dGhpcy5hZGRIb29rcygpO1xuXHR9LFxuXG5cdGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXRoaXMuX2VuYWJsZWQpIHsgcmV0dXJuOyB9XG5cblx0XHR0aGlzLl9lbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5yZW1vdmVIb29rcygpO1xuXHR9LFxuXG5cdGVuYWJsZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gISF0aGlzLl9lbmFibGVkO1xuXHR9XG59KTtcblxuXG4vKlxuICogTC5IYW5kbGVyLk1hcERyYWcgaXMgdXNlZCB0byBtYWtlIHRoZSBtYXAgZHJhZ2dhYmxlICh3aXRoIHBhbm5pbmcgaW5lcnRpYSksIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRkcmFnZ2luZzogdHJ1ZSxcblxuXHRpbmVydGlhOiAhTC5Ccm93c2VyLmFuZHJvaWQyMyxcblx0aW5lcnRpYURlY2VsZXJhdGlvbjogMzQwMCwgLy8gcHgvc14yXG5cdGluZXJ0aWFNYXhTcGVlZDogSW5maW5pdHksIC8vIHB4L3Ncblx0aW5lcnRpYVRocmVzaG9sZDogTC5Ccm93c2VyLnRvdWNoID8gMzIgOiAxOCwgLy8gbXNcblx0ZWFzZUxpbmVhcml0eTogMC4yNSxcblxuXHQvLyBUT0RPIHJlZmFjdG9yLCBtb3ZlIHRvIENSU1xuXHR3b3JsZENvcHlKdW1wOiBmYWxzZVxufSk7XG5cbkwuTWFwLkRyYWcgPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXRoaXMuX2RyYWdnYWJsZSkge1xuXHRcdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdFx0dGhpcy5fZHJhZ2dhYmxlID0gbmV3IEwuRHJhZ2dhYmxlKG1hcC5fbWFwUGFuZSwgbWFwLl9jb250YWluZXIpO1xuXG5cdFx0XHR0aGlzLl9kcmFnZ2FibGUub24oe1xuXHRcdFx0XHQnZHJhZ3N0YXJ0JzogdGhpcy5fb25EcmFnU3RhcnQsXG5cdFx0XHRcdCdkcmFnJzogdGhpcy5fb25EcmFnLFxuXHRcdFx0XHQnZHJhZ2VuZCc6IHRoaXMuX29uRHJhZ0VuZFxuXHRcdFx0fSwgdGhpcyk7XG5cblx0XHRcdGlmIChtYXAub3B0aW9ucy53b3JsZENvcHlKdW1wKSB7XG5cdFx0XHRcdHRoaXMuX2RyYWdnYWJsZS5vbigncHJlZHJhZycsIHRoaXMuX29uUHJlRHJhZywgdGhpcyk7XG5cdFx0XHRcdG1hcC5vbigndmlld3Jlc2V0JywgdGhpcy5fb25WaWV3UmVzZXQsIHRoaXMpO1xuXG5cdFx0XHRcdG1hcC53aGVuUmVhZHkodGhpcy5fb25WaWV3UmVzZXQsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9kcmFnZ2FibGUuZW5hYmxlKCk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9kcmFnZ2FibGUuZGlzYWJsZSgpO1xuXHR9LFxuXG5cdG1vdmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RyYWdnYWJsZSAmJiB0aGlzLl9kcmFnZ2FibGUuX21vdmVkO1xuXHR9LFxuXG5cdF9vbkRyYWdTdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRpZiAobWFwLl9wYW5BbmltKSB7XG5cdFx0XHRtYXAuX3BhbkFuaW0uc3RvcCgpO1xuXHRcdH1cblxuXHRcdG1hcFxuXHRcdCAgICAuZmlyZSgnbW92ZXN0YXJ0Jylcblx0XHQgICAgLmZpcmUoJ2RyYWdzdGFydCcpO1xuXG5cdFx0aWYgKG1hcC5vcHRpb25zLmluZXJ0aWEpIHtcblx0XHRcdHRoaXMuX3Bvc2l0aW9ucyA9IFtdO1xuXHRcdFx0dGhpcy5fdGltZXMgPSBbXTtcblx0XHR9XG5cdH0sXG5cblx0X29uRHJhZzogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLl9tYXAub3B0aW9ucy5pbmVydGlhKSB7XG5cdFx0XHR2YXIgdGltZSA9IHRoaXMuX2xhc3RUaW1lID0gK25ldyBEYXRlKCksXG5cdFx0XHQgICAgcG9zID0gdGhpcy5fbGFzdFBvcyA9IHRoaXMuX2RyYWdnYWJsZS5fbmV3UG9zO1xuXG5cdFx0XHR0aGlzLl9wb3NpdGlvbnMucHVzaChwb3MpO1xuXHRcdFx0dGhpcy5fdGltZXMucHVzaCh0aW1lKTtcblxuXHRcdFx0aWYgKHRpbWUgLSB0aGlzLl90aW1lc1swXSA+IDIwMCkge1xuXHRcdFx0XHR0aGlzLl9wb3NpdGlvbnMuc2hpZnQoKTtcblx0XHRcdFx0dGhpcy5fdGltZXMuc2hpZnQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9tYXBcblx0XHQgICAgLmZpcmUoJ21vdmUnKVxuXHRcdCAgICAuZmlyZSgnZHJhZycpO1xuXHR9LFxuXG5cdF9vblZpZXdSZXNldDogZnVuY3Rpb24gKCkge1xuXHRcdC8vIFRPRE8gZml4IGhhcmRjb2RlZCBFYXJ0aCB2YWx1ZXNcblx0XHR2YXIgcHhDZW50ZXIgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpLl9kaXZpZGVCeSgyKSxcblx0XHQgICAgcHhXb3JsZENlbnRlciA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQoWzAsIDBdKTtcblxuXHRcdHRoaXMuX2luaXRpYWxXb3JsZE9mZnNldCA9IHB4V29ybGRDZW50ZXIuc3VidHJhY3QocHhDZW50ZXIpLng7XG5cdFx0dGhpcy5fd29ybGRXaWR0aCA9IHRoaXMuX21hcC5wcm9qZWN0KFswLCAxODBdKS54O1xuXHR9LFxuXG5cdF9vblByZURyYWc6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBUT0RPIHJlZmFjdG9yIHRvIGJlIGFibGUgdG8gYWRqdXN0IG1hcCBwYW5lIHBvc2l0aW9uIGFmdGVyIHpvb21cblx0XHR2YXIgd29ybGRXaWR0aCA9IHRoaXMuX3dvcmxkV2lkdGgsXG5cdFx0ICAgIGhhbGZXaWR0aCA9IE1hdGgucm91bmQod29ybGRXaWR0aCAvIDIpLFxuXHRcdCAgICBkeCA9IHRoaXMuX2luaXRpYWxXb3JsZE9mZnNldCxcblx0XHQgICAgeCA9IHRoaXMuX2RyYWdnYWJsZS5fbmV3UG9zLngsXG5cdFx0ICAgIG5ld1gxID0gKHggLSBoYWxmV2lkdGggKyBkeCkgJSB3b3JsZFdpZHRoICsgaGFsZldpZHRoIC0gZHgsXG5cdFx0ICAgIG5ld1gyID0gKHggKyBoYWxmV2lkdGggKyBkeCkgJSB3b3JsZFdpZHRoIC0gaGFsZldpZHRoIC0gZHgsXG5cdFx0ICAgIG5ld1ggPSBNYXRoLmFicyhuZXdYMSArIGR4KSA8IE1hdGguYWJzKG5ld1gyICsgZHgpID8gbmV3WDEgOiBuZXdYMjtcblxuXHRcdHRoaXMuX2RyYWdnYWJsZS5fbmV3UG9zLnggPSBuZXdYO1xuXHR9LFxuXG5cdF9vbkRyYWdFbmQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcblx0XHQgICAgb3B0aW9ucyA9IG1hcC5vcHRpb25zLFxuXHRcdCAgICBkZWxheSA9ICtuZXcgRGF0ZSgpIC0gdGhpcy5fbGFzdFRpbWUsXG5cblx0XHQgICAgbm9JbmVydGlhID0gIW9wdGlvbnMuaW5lcnRpYSB8fCBkZWxheSA+IG9wdGlvbnMuaW5lcnRpYVRocmVzaG9sZCB8fCAhdGhpcy5fcG9zaXRpb25zWzBdO1xuXG5cdFx0bWFwLmZpcmUoJ2RyYWdlbmQnLCBlKTtcblxuXHRcdGlmIChub0luZXJ0aWEpIHtcblx0XHRcdG1hcC5maXJlKCdtb3ZlZW5kJyk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGhpcy5fbGFzdFBvcy5zdWJ0cmFjdCh0aGlzLl9wb3NpdGlvbnNbMF0pLFxuXHRcdFx0ICAgIGR1cmF0aW9uID0gKHRoaXMuX2xhc3RUaW1lICsgZGVsYXkgLSB0aGlzLl90aW1lc1swXSkgLyAxMDAwLFxuXHRcdFx0ICAgIGVhc2UgPSBvcHRpb25zLmVhc2VMaW5lYXJpdHksXG5cblx0XHRcdCAgICBzcGVlZFZlY3RvciA9IGRpcmVjdGlvbi5tdWx0aXBseUJ5KGVhc2UgLyBkdXJhdGlvbiksXG5cdFx0XHQgICAgc3BlZWQgPSBzcGVlZFZlY3Rvci5kaXN0YW5jZVRvKFswLCAwXSksXG5cblx0XHRcdCAgICBsaW1pdGVkU3BlZWQgPSBNYXRoLm1pbihvcHRpb25zLmluZXJ0aWFNYXhTcGVlZCwgc3BlZWQpLFxuXHRcdFx0ICAgIGxpbWl0ZWRTcGVlZFZlY3RvciA9IHNwZWVkVmVjdG9yLm11bHRpcGx5QnkobGltaXRlZFNwZWVkIC8gc3BlZWQpLFxuXG5cdFx0XHQgICAgZGVjZWxlcmF0aW9uRHVyYXRpb24gPSBsaW1pdGVkU3BlZWQgLyAob3B0aW9ucy5pbmVydGlhRGVjZWxlcmF0aW9uICogZWFzZSksXG5cdFx0XHQgICAgb2Zmc2V0ID0gbGltaXRlZFNwZWVkVmVjdG9yLm11bHRpcGx5QnkoLWRlY2VsZXJhdGlvbkR1cmF0aW9uIC8gMikucm91bmQoKTtcblxuXHRcdFx0aWYgKCFvZmZzZXQueCB8fCAhb2Zmc2V0LnkpIHtcblx0XHRcdFx0bWFwLmZpcmUoJ21vdmVlbmQnKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b2Zmc2V0ID0gbWFwLl9saW1pdE9mZnNldChvZmZzZXQsIG1hcC5vcHRpb25zLm1heEJvdW5kcyk7XG5cblx0XHRcdFx0TC5VdGlsLnJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG1hcC5wYW5CeShvZmZzZXQsIHtcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkZWNlbGVyYXRpb25EdXJhdGlvbixcblx0XHRcdFx0XHRcdGVhc2VMaW5lYXJpdHk6IGVhc2UsXG5cdFx0XHRcdFx0XHRub01vdmVTdGFydDogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuXG5MLk1hcC5hZGRJbml0SG9vaygnYWRkSGFuZGxlcicsICdkcmFnZ2luZycsIEwuTWFwLkRyYWcpO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuRG91YmxlQ2xpY2tab29tIGlzIHVzZWQgdG8gaGFuZGxlIGRvdWJsZS1jbGljayB6b29tIG9uIHRoZSBtYXAsIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRkb3VibGVDbGlja1pvb206IHRydWVcbn0pO1xuXG5MLk1hcC5Eb3VibGVDbGlja1pvb20gPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9tYXAub24oJ2RibGNsaWNrJywgdGhpcy5fb25Eb3VibGVDbGljaywgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9tYXAub2ZmKCdkYmxjbGljaycsIHRoaXMuX29uRG91YmxlQ2xpY2ssIHRoaXMpO1xuXHR9LFxuXG5cdF9vbkRvdWJsZUNsaWNrOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpICsgKGUub3JpZ2luYWxFdmVudC5zaGlmdEtleSA/IC0xIDogMSk7XG5cblx0XHRpZiAobWFwLm9wdGlvbnMuZG91YmxlQ2xpY2tab29tID09PSAnY2VudGVyJykge1xuXHRcdFx0bWFwLnNldFpvb20oem9vbSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1hcC5zZXRab29tQXJvdW5kKGUuY29udGFpbmVyUG9pbnQsIHpvb20pO1xuXHRcdH1cblx0fVxufSk7XG5cbkwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ2RvdWJsZUNsaWNrWm9vbScsIEwuTWFwLkRvdWJsZUNsaWNrWm9vbSk7XG5cblxuLypcbiAqIEwuSGFuZGxlci5TY3JvbGxXaGVlbFpvb20gaXMgdXNlZCBieSBMLk1hcCB0byBlbmFibGUgbW91c2Ugc2Nyb2xsIHdoZWVsIHpvb20gb24gdGhlIG1hcC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRzY3JvbGxXaGVlbFpvb206IHRydWVcbn0pO1xuXG5MLk1hcC5TY3JvbGxXaGVlbFpvb20gPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX21hcC5fY29udGFpbmVyLCAnbW91c2V3aGVlbCcsIHRoaXMuX29uV2hlZWxTY3JvbGwsIHRoaXMpO1xuXHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwLl9jb250YWluZXIsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG5cdFx0dGhpcy5fZGVsdGEgPSAwO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fbWFwLl9jb250YWluZXIsICdtb3VzZXdoZWVsJywgdGhpcy5fb25XaGVlbFNjcm9sbCk7XG5cdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fbWFwLl9jb250YWluZXIsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG5cdH0sXG5cblx0X29uV2hlZWxTY3JvbGw6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRlbHRhID0gTC5Eb21FdmVudC5nZXRXaGVlbERlbHRhKGUpO1xuXG5cdFx0dGhpcy5fZGVsdGEgKz0gZGVsdGE7XG5cdFx0dGhpcy5fbGFzdE1vdXNlUG9zID0gdGhpcy5fbWFwLm1vdXNlRXZlbnRUb0NvbnRhaW5lclBvaW50KGUpO1xuXG5cdFx0aWYgKCF0aGlzLl9zdGFydFRpbWUpIHtcblx0XHRcdHRoaXMuX3N0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXHRcdH1cblxuXHRcdHZhciBsZWZ0ID0gTWF0aC5tYXgoNDAgLSAoK25ldyBEYXRlKCkgLSB0aGlzLl9zdGFydFRpbWUpLCAwKTtcblxuXHRcdGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG5cdFx0dGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KEwuYmluZCh0aGlzLl9wZXJmb3JtWm9vbSwgdGhpcyksIGxlZnQpO1xuXG5cdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcblx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcblx0fSxcblxuXHRfcGVyZm9ybVpvb206IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICBkZWx0YSA9IHRoaXMuX2RlbHRhLFxuXHRcdCAgICB6b29tID0gbWFwLmdldFpvb20oKTtcblxuXHRcdGRlbHRhID0gZGVsdGEgPiAwID8gTWF0aC5jZWlsKGRlbHRhKSA6IE1hdGguZmxvb3IoZGVsdGEpO1xuXHRcdGRlbHRhID0gTWF0aC5tYXgoTWF0aC5taW4oZGVsdGEsIDQpLCAtNCk7XG5cdFx0ZGVsdGEgPSBtYXAuX2xpbWl0Wm9vbSh6b29tICsgZGVsdGEpIC0gem9vbTtcblxuXHRcdHRoaXMuX2RlbHRhID0gMDtcblx0XHR0aGlzLl9zdGFydFRpbWUgPSBudWxsO1xuXG5cdFx0aWYgKCFkZWx0YSkgeyByZXR1cm47IH1cblxuXHRcdGlmIChtYXAub3B0aW9ucy5zY3JvbGxXaGVlbFpvb20gPT09ICdjZW50ZXInKSB7XG5cdFx0XHRtYXAuc2V0Wm9vbSh6b29tICsgZGVsdGEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtYXAuc2V0Wm9vbUFyb3VuZCh0aGlzLl9sYXN0TW91c2VQb3MsIHpvb20gKyBkZWx0YSk7XG5cdFx0fVxuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAnc2Nyb2xsV2hlZWxab29tJywgTC5NYXAuU2Nyb2xsV2hlZWxab29tKTtcblxuXG4vKlxyXG4gKiBFeHRlbmRzIHRoZSBldmVudCBoYW5kbGluZyBjb2RlIHdpdGggZG91YmxlIHRhcCBzdXBwb3J0IGZvciBtb2JpbGUgYnJvd3NlcnMuXHJcbiAqL1xyXG5cclxuTC5leHRlbmQoTC5Eb21FdmVudCwge1xyXG5cclxuXHRfdG91Y2hzdGFydDogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJEb3duJyA6IEwuQnJvd3Nlci5wb2ludGVyID8gJ3BvaW50ZXJkb3duJyA6ICd0b3VjaHN0YXJ0JyxcclxuXHRfdG91Y2hlbmQ6IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyVXAnIDogTC5Ccm93c2VyLnBvaW50ZXIgPyAncG9pbnRlcnVwJyA6ICd0b3VjaGVuZCcsXHJcblxyXG5cdC8vIGluc3BpcmVkIGJ5IFplcHRvIHRvdWNoIGNvZGUgYnkgVGhvbWFzIEZ1Y2hzXHJcblx0YWRkRG91YmxlVGFwTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIGhhbmRsZXIsIGlkKSB7XHJcblx0XHR2YXIgbGFzdCxcclxuXHRcdCAgICBkb3VibGVUYXAgPSBmYWxzZSxcclxuXHRcdCAgICBkZWxheSA9IDI1MCxcclxuXHRcdCAgICB0b3VjaCxcclxuXHRcdCAgICBwcmUgPSAnX2xlYWZsZXRfJyxcclxuXHRcdCAgICB0b3VjaHN0YXJ0ID0gdGhpcy5fdG91Y2hzdGFydCxcclxuXHRcdCAgICB0b3VjaGVuZCA9IHRoaXMuX3RvdWNoZW5kLFxyXG5cdFx0ICAgIHRyYWNrZWRUb3VjaGVzID0gW107XHJcblxyXG5cdFx0ZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcclxuXHRcdFx0dmFyIGNvdW50O1xyXG5cclxuXHRcdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyKSB7XHJcblx0XHRcdFx0dHJhY2tlZFRvdWNoZXMucHVzaChlLnBvaW50ZXJJZCk7XHJcblx0XHRcdFx0Y291bnQgPSB0cmFja2VkVG91Y2hlcy5sZW5ndGg7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y291bnQgPSBlLnRvdWNoZXMubGVuZ3RoO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChjb3VudCA+IDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBub3cgPSBEYXRlLm5vdygpLFxyXG5cdFx0XHRcdGRlbHRhID0gbm93IC0gKGxhc3QgfHwgbm93KTtcclxuXHJcblx0XHRcdHRvdWNoID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdIDogZTtcclxuXHRcdFx0ZG91YmxlVGFwID0gKGRlbHRhID4gMCAmJiBkZWx0YSA8PSBkZWxheSk7XHJcblx0XHRcdGxhc3QgPSBub3c7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gb25Ub3VjaEVuZChlKSB7XHJcblx0XHRcdGlmIChMLkJyb3dzZXIucG9pbnRlcikge1xyXG5cdFx0XHRcdHZhciBpZHggPSB0cmFja2VkVG91Y2hlcy5pbmRleE9mKGUucG9pbnRlcklkKTtcclxuXHRcdFx0XHRpZiAoaWR4ID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0cmFja2VkVG91Y2hlcy5zcGxpY2UoaWR4LCAxKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGRvdWJsZVRhcCkge1xyXG5cdFx0XHRcdGlmIChMLkJyb3dzZXIucG9pbnRlcikge1xyXG5cdFx0XHRcdFx0Ly8gd29yayBhcm91bmQgLnR5cGUgYmVpbmcgcmVhZG9ubHkgd2l0aCBNU1BvaW50ZXIqIGV2ZW50c1xyXG5cdFx0XHRcdFx0dmFyIG5ld1RvdWNoID0geyB9LFxyXG5cdFx0XHRcdFx0XHRwcm9wO1xyXG5cclxuXHRcdFx0XHRcdC8vIGpzaGludCBmb3JpbjpmYWxzZVxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSBpbiB0b3VjaCkge1xyXG5cdFx0XHRcdFx0XHRwcm9wID0gdG91Y2hbaV07XHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1RvdWNoW2ldID0gcHJvcC5iaW5kKHRvdWNoKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRuZXdUb3VjaFtpXSA9IHByb3A7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRvdWNoID0gbmV3VG91Y2g7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRvdWNoLnR5cGUgPSAnZGJsY2xpY2snO1xyXG5cdFx0XHRcdGhhbmRsZXIodG91Y2gpO1xyXG5cdFx0XHRcdGxhc3QgPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRvYmpbcHJlICsgdG91Y2hzdGFydCArIGlkXSA9IG9uVG91Y2hTdGFydDtcclxuXHRcdG9ialtwcmUgKyB0b3VjaGVuZCArIGlkXSA9IG9uVG91Y2hFbmQ7XHJcblxyXG5cdFx0Ly8gb24gcG9pbnRlciB3ZSBuZWVkIHRvIGxpc3RlbiBvbiB0aGUgZG9jdW1lbnQsIG90aGVyd2lzZSBhIGRyYWcgc3RhcnRpbmcgb24gdGhlIG1hcCBhbmQgbW92aW5nIG9mZiBzY3JlZW5cclxuXHRcdC8vIHdpbGwgbm90IGNvbWUgdGhyb3VnaCB0byB1cywgc28gd2Ugd2lsbCBsb3NlIHRyYWNrIG9mIGhvdyBtYW55IHRvdWNoZXMgYXJlIG9uZ29pbmdcclxuXHRcdHZhciBlbmRFbGVtZW50ID0gTC5Ccm93c2VyLnBvaW50ZXIgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBvYmo7XHJcblxyXG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodG91Y2hzdGFydCwgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XHJcblx0XHRlbmRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodG91Y2hlbmQsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIpIHtcclxuXHRcdFx0ZW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKEwuRG9tRXZlbnQuUE9JTlRFUl9DQU5DRUwsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVEb3VibGVUYXBMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgaWQpIHtcclxuXHRcdHZhciBwcmUgPSAnX2xlYWZsZXRfJztcclxuXHJcblx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLl90b3VjaHN0YXJ0LCBvYmpbcHJlICsgdGhpcy5fdG91Y2hzdGFydCArIGlkXSwgZmFsc2UpO1xyXG5cdFx0KEwuQnJvd3Nlci5wb2ludGVyID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogb2JqKS5yZW1vdmVFdmVudExpc3RlbmVyKFxyXG5cdFx0ICAgICAgICB0aGlzLl90b3VjaGVuZCwgb2JqW3ByZSArIHRoaXMuX3RvdWNoZW5kICsgaWRdLCBmYWxzZSk7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyKSB7XHJcblx0XHRcdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKEwuRG9tRXZlbnQuUE9JTlRFUl9DQU5DRUwsIG9ialtwcmUgKyB0aGlzLl90b3VjaGVuZCArIGlkXSxcclxuXHRcdFx0XHRmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXG4gKiBFeHRlbmRzIEwuRG9tRXZlbnQgdG8gcHJvdmlkZSB0b3VjaCBzdXBwb3J0IGZvciBJbnRlcm5ldCBFeHBsb3JlciBhbmQgV2luZG93cy1iYXNlZCBkZXZpY2VzLlxuICovXG5cbkwuZXh0ZW5kKEwuRG9tRXZlbnQsIHtcblxuXHQvL3N0YXRpY1xuXHRQT0lOVEVSX0RPV046IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyRG93bicgOiAncG9pbnRlcmRvd24nLFxuXHRQT0lOVEVSX01PVkU6IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyTW92ZScgOiAncG9pbnRlcm1vdmUnLFxuXHRQT0lOVEVSX1VQOiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlclVwJyA6ICdwb2ludGVydXAnLFxuXHRQT0lOVEVSX0NBTkNFTDogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJDYW5jZWwnIDogJ3BvaW50ZXJjYW5jZWwnLFxuXG5cdF9wb2ludGVyczogW10sXG5cdF9wb2ludGVyRG9jdW1lbnRMaXN0ZW5lcjogZmFsc2UsXG5cblx0Ly8gUHJvdmlkZXMgYSB0b3VjaCBldmVudHMgd3JhcHBlciBmb3IgKG1zKXBvaW50ZXIgZXZlbnRzLlxuXHQvLyBCYXNlZCBvbiBjaGFuZ2VzIGJ5IHZlcHJvemEgaHR0cHM6Ly9naXRodWIuY29tL0Nsb3VkTWFkZS9MZWFmbGV0L3B1bGwvMTAxOVxuXHQvL3JlZiBodHRwOi8vd3d3LnczLm9yZy9UUi9wb2ludGVyZXZlbnRzLyBodHRwczovL3d3dy53My5vcmcvQnVncy9QdWJsaWMvc2hvd19idWcuY2dpP2lkPTIyODkwXG5cblx0YWRkUG9pbnRlckxpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCkge1xuXG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0Y2FzZSAndG91Y2hzdGFydCc6XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRQb2ludGVyTGlzdGVuZXJTdGFydChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKTtcblx0XHRjYXNlICd0b3VjaGVuZCc6XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRQb2ludGVyTGlzdGVuZXJFbmQob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCk7XG5cdFx0Y2FzZSAndG91Y2htb3ZlJzpcblx0XHRcdHJldHVybiB0aGlzLmFkZFBvaW50ZXJMaXN0ZW5lck1vdmUob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93ICdVbmtub3duIHRvdWNoIGV2ZW50IHR5cGUnO1xuXHRcdH1cblx0fSxcblxuXHRhZGRQb2ludGVyTGlzdGVuZXJTdGFydDogZnVuY3Rpb24gKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpIHtcblx0XHR2YXIgcHJlID0gJ19sZWFmbGV0XycsXG5cdFx0ICAgIHBvaW50ZXJzID0gdGhpcy5fcG9pbnRlcnM7XG5cblx0XHR2YXIgY2IgPSBmdW5jdGlvbiAoZSkge1xuXG5cdFx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXG5cdFx0XHR2YXIgYWxyZWFkeUluQXJyYXkgPSBmYWxzZTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHBvaW50ZXJzW2ldLnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQpIHtcblx0XHRcdFx0XHRhbHJlYWR5SW5BcnJheSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghYWxyZWFkeUluQXJyYXkpIHtcblx0XHRcdFx0cG9pbnRlcnMucHVzaChlKTtcblx0XHRcdH1cblxuXHRcdFx0ZS50b3VjaGVzID0gcG9pbnRlcnMuc2xpY2UoKTtcblx0XHRcdGUuY2hhbmdlZFRvdWNoZXMgPSBbZV07XG5cblx0XHRcdGhhbmRsZXIoZSk7XG5cdFx0fTtcblxuXHRcdG9ialtwcmUgKyAndG91Y2hzdGFydCcgKyBpZF0gPSBjYjtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfRE9XTiwgY2IsIGZhbHNlKTtcblxuXHRcdC8vIG5lZWQgdG8gYWxzbyBsaXN0ZW4gZm9yIGVuZCBldmVudHMgdG8ga2VlcCB0aGUgX3BvaW50ZXJzIGxpc3QgYWNjdXJhdGVcblx0XHQvLyB0aGlzIG5lZWRzIHRvIGJlIG9uIHRoZSBib2R5IGFuZCBuZXZlciBnbyBhd2F5XG5cdFx0aWYgKCF0aGlzLl9wb2ludGVyRG9jdW1lbnRMaXN0ZW5lcikge1xuXHRcdFx0dmFyIGludGVybmFsQ2IgPSBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKHBvaW50ZXJzW2ldLnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQpIHtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdC8vV2UgbGlzdGVuIG9uIHRoZSBkb2N1bWVudEVsZW1lbnQgYXMgYW55IGRyYWdzIHRoYXQgZW5kIGJ5IG1vdmluZyB0aGUgdG91Y2ggb2ZmIHRoZSBzY3JlZW4gZ2V0IGZpcmVkIHRoZXJlXG5cdFx0XHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfVVAsIGludGVybmFsQ2IsIGZhbHNlKTtcblx0XHRcdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9DQU5DRUwsIGludGVybmFsQ2IsIGZhbHNlKTtcblxuXHRcdFx0dGhpcy5fcG9pbnRlckRvY3VtZW50TGlzdGVuZXIgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZFBvaW50ZXJMaXN0ZW5lck1vdmU6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKSB7XG5cdFx0dmFyIHByZSA9ICdfbGVhZmxldF8nLFxuXHRcdCAgICB0b3VjaGVzID0gdGhpcy5fcG9pbnRlcnM7XG5cblx0XHRmdW5jdGlvbiBjYihlKSB7XG5cblx0XHRcdC8vIGRvbid0IGZpcmUgdG91Y2ggbW92ZXMgd2hlbiBtb3VzZSBpc24ndCBkb3duXG5cdFx0XHRpZiAoKGUucG9pbnRlclR5cGUgPT09IGUuTVNQT0lOVEVSX1RZUEVfTU9VU0UgfHwgZS5wb2ludGVyVHlwZSA9PT0gJ21vdXNlJykgJiYgZS5idXR0b25zID09PSAwKSB7IHJldHVybjsgfVxuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHRvdWNoZXNbaV0ucG9pbnRlcklkID09PSBlLnBvaW50ZXJJZCkge1xuXHRcdFx0XHRcdHRvdWNoZXNbaV0gPSBlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGUudG91Y2hlcyA9IHRvdWNoZXMuc2xpY2UoKTtcblx0XHRcdGUuY2hhbmdlZFRvdWNoZXMgPSBbZV07XG5cblx0XHRcdGhhbmRsZXIoZSk7XG5cdFx0fVxuXG5cdFx0b2JqW3ByZSArICd0b3VjaG1vdmUnICsgaWRdID0gY2I7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX01PVkUsIGNiLCBmYWxzZSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRhZGRQb2ludGVyTGlzdGVuZXJFbmQ6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKSB7XG5cdFx0dmFyIHByZSA9ICdfbGVhZmxldF8nLFxuXHRcdCAgICB0b3VjaGVzID0gdGhpcy5fcG9pbnRlcnM7XG5cblx0XHR2YXIgY2IgPSBmdW5jdGlvbiAoZSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICh0b3VjaGVzW2ldLnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQpIHtcblx0XHRcdFx0XHR0b3VjaGVzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRlLnRvdWNoZXMgPSB0b3VjaGVzLnNsaWNlKCk7XG5cdFx0XHRlLmNoYW5nZWRUb3VjaGVzID0gW2VdO1xuXG5cdFx0XHRoYW5kbGVyKGUpO1xuXHRcdH07XG5cblx0XHRvYmpbcHJlICsgJ3RvdWNoZW5kJyArIGlkXSA9IGNiO1xuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9VUCwgY2IsIGZhbHNlKTtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfQ0FOQ0VMLCBjYiwgZmFsc2UpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVtb3ZlUG9pbnRlckxpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBpZCkge1xuXHRcdHZhciBwcmUgPSAnX2xlYWZsZXRfJyxcblx0XHQgICAgY2IgPSBvYmpbcHJlICsgdHlwZSArIGlkXTtcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdGNhc2UgJ3RvdWNoc3RhcnQnOlxuXHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX0RPV04sIGNiLCBmYWxzZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICd0b3VjaG1vdmUnOlxuXHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX01PVkUsIGNiLCBmYWxzZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICd0b3VjaGVuZCc6XG5cdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfVVAsIGNiLCBmYWxzZSk7XG5cdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfQ0FOQ0VMLCBjYiwgZmFsc2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuVG91Y2hab29tIGlzIHVzZWQgYnkgTC5NYXAgdG8gYWRkIHBpbmNoIHpvb20gb24gc3VwcG9ydGVkIG1vYmlsZSBicm93c2Vycy5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHR0b3VjaFpvb206IEwuQnJvd3Nlci50b3VjaCAmJiAhTC5Ccm93c2VyLmFuZHJvaWQyMyxcblx0Ym91bmNlQXRab29tTGltaXRzOiB0cnVlXG59KTtcblxuTC5NYXAuVG91Y2hab29tID0gTC5IYW5kbGVyLmV4dGVuZCh7XG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQsIHRoaXMpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fbWFwLl9jb250YWluZXIsICd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0LCB0aGlzKTtcblx0fSxcblxuXHRfb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRpZiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoICE9PSAyIHx8IG1hcC5fYW5pbWF0aW5nWm9vbSB8fCB0aGlzLl96b29taW5nKSB7IHJldHVybjsgfVxuXG5cdFx0dmFyIHAxID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZS50b3VjaGVzWzBdKSxcblx0XHQgICAgcDIgPSBtYXAubW91c2VFdmVudFRvTGF5ZXJQb2ludChlLnRvdWNoZXNbMV0pLFxuXHRcdCAgICB2aWV3Q2VudGVyID0gbWFwLl9nZXRDZW50ZXJMYXllclBvaW50KCk7XG5cblx0XHR0aGlzLl9zdGFydENlbnRlciA9IHAxLmFkZChwMikuX2RpdmlkZUJ5KDIpO1xuXHRcdHRoaXMuX3N0YXJ0RGlzdCA9IHAxLmRpc3RhbmNlVG8ocDIpO1xuXG5cdFx0dGhpcy5fbW92ZWQgPSBmYWxzZTtcblx0XHR0aGlzLl96b29taW5nID0gdHJ1ZTtcblxuXHRcdHRoaXMuX2NlbnRlck9mZnNldCA9IHZpZXdDZW50ZXIuc3VidHJhY3QodGhpcy5fc3RhcnRDZW50ZXIpO1xuXG5cdFx0aWYgKG1hcC5fcGFuQW5pbSkge1xuXHRcdFx0bWFwLl9wYW5BbmltLnN0b3AoKTtcblx0XHR9XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vbihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlLCB0aGlzKVxuXHRcdCAgICAub24oZG9jdW1lbnQsICd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQsIHRoaXMpO1xuXG5cdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcblx0fSxcblxuXHRfb25Ub3VjaE1vdmU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmICghZS50b3VjaGVzIHx8IGUudG91Y2hlcy5sZW5ndGggIT09IDIgfHwgIXRoaXMuX3pvb21pbmcpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgcDEgPSBtYXAubW91c2VFdmVudFRvTGF5ZXJQb2ludChlLnRvdWNoZXNbMF0pLFxuXHRcdCAgICBwMiA9IG1hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUudG91Y2hlc1sxXSk7XG5cblx0XHR0aGlzLl9zY2FsZSA9IHAxLmRpc3RhbmNlVG8ocDIpIC8gdGhpcy5fc3RhcnREaXN0O1xuXHRcdHRoaXMuX2RlbHRhID0gcDEuX2FkZChwMikuX2RpdmlkZUJ5KDIpLl9zdWJ0cmFjdCh0aGlzLl9zdGFydENlbnRlcik7XG5cblx0XHRpZiAodGhpcy5fc2NhbGUgPT09IDEpIHsgcmV0dXJuOyB9XG5cblx0XHRpZiAoIW1hcC5vcHRpb25zLmJvdW5jZUF0Wm9vbUxpbWl0cykge1xuXHRcdFx0aWYgKChtYXAuZ2V0Wm9vbSgpID09PSBtYXAuZ2V0TWluWm9vbSgpICYmIHRoaXMuX3NjYWxlIDwgMSkgfHxcblx0XHRcdCAgICAobWFwLmdldFpvb20oKSA9PT0gbWFwLmdldE1heFpvb20oKSAmJiB0aGlzLl9zY2FsZSA+IDEpKSB7IHJldHVybjsgfVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fbW92ZWQpIHtcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhtYXAuX21hcFBhbmUsICdsZWFmbGV0LXRvdWNoaW5nJyk7XG5cblx0XHRcdG1hcFxuXHRcdFx0ICAgIC5maXJlKCdtb3Zlc3RhcnQnKVxuXHRcdFx0ICAgIC5maXJlKCd6b29tc3RhcnQnKTtcblxuXHRcdFx0dGhpcy5fbW92ZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fYW5pbVJlcXVlc3QpO1xuXHRcdHRoaXMuX2FuaW1SZXF1ZXN0ID0gTC5VdGlsLnJlcXVlc3RBbmltRnJhbWUoXG5cdFx0ICAgICAgICB0aGlzLl91cGRhdGVPbk1vdmUsIHRoaXMsIHRydWUsIHRoaXMuX21hcC5fY29udGFpbmVyKTtcblxuXHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG5cdH0sXG5cblx0X3VwZGF0ZU9uTW92ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXG5cdFx0ICAgIG9yaWdpbiA9IHRoaXMuX2dldFNjYWxlT3JpZ2luKCksXG5cdFx0ICAgIGNlbnRlciA9IG1hcC5sYXllclBvaW50VG9MYXRMbmcob3JpZ2luKSxcblx0XHQgICAgem9vbSA9IG1hcC5nZXRTY2FsZVpvb20odGhpcy5fc2NhbGUpO1xuXG5cdFx0bWFwLl9hbmltYXRlWm9vbShjZW50ZXIsIHpvb20sIHRoaXMuX3N0YXJ0Q2VudGVyLCB0aGlzLl9zY2FsZSwgdGhpcy5fZGVsdGEsIGZhbHNlLCB0cnVlKTtcblx0fSxcblxuXHRfb25Ub3VjaEVuZDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5fbW92ZWQgfHwgIXRoaXMuX3pvb21pbmcpIHtcblx0XHRcdHRoaXMuX3pvb21pbmcgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0dGhpcy5fem9vbWluZyA9IGZhbHNlO1xuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhtYXAuX21hcFBhbmUsICdsZWFmbGV0LXRvdWNoaW5nJyk7XG5cdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltUmVxdWVzdCk7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSlcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG5cblx0XHR2YXIgb3JpZ2luID0gdGhpcy5fZ2V0U2NhbGVPcmlnaW4oKSxcblx0XHQgICAgY2VudGVyID0gbWFwLmxheWVyUG9pbnRUb0xhdExuZyhvcmlnaW4pLFxuXG5cdFx0ICAgIG9sZFpvb20gPSBtYXAuZ2V0Wm9vbSgpLFxuXHRcdCAgICBmbG9hdFpvb21EZWx0YSA9IG1hcC5nZXRTY2FsZVpvb20odGhpcy5fc2NhbGUpIC0gb2xkWm9vbSxcblx0XHQgICAgcm91bmRab29tRGVsdGEgPSAoZmxvYXRab29tRGVsdGEgPiAwID9cblx0XHQgICAgICAgICAgICBNYXRoLmNlaWwoZmxvYXRab29tRGVsdGEpIDogTWF0aC5mbG9vcihmbG9hdFpvb21EZWx0YSkpLFxuXG5cdFx0ICAgIHpvb20gPSBtYXAuX2xpbWl0Wm9vbShvbGRab29tICsgcm91bmRab29tRGVsdGEpLFxuXHRcdCAgICBzY2FsZSA9IG1hcC5nZXRab29tU2NhbGUoem9vbSkgLyB0aGlzLl9zY2FsZTtcblxuXHRcdG1hcC5fYW5pbWF0ZVpvb20oY2VudGVyLCB6b29tLCBvcmlnaW4sIHNjYWxlKTtcblx0fSxcblxuXHRfZ2V0U2NhbGVPcmlnaW46IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgY2VudGVyT2Zmc2V0ID0gdGhpcy5fY2VudGVyT2Zmc2V0LnN1YnRyYWN0KHRoaXMuX2RlbHRhKS5kaXZpZGVCeSh0aGlzLl9zY2FsZSk7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXJ0Q2VudGVyLmFkZChjZW50ZXJPZmZzZXQpO1xuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAndG91Y2hab29tJywgTC5NYXAuVG91Y2hab29tKTtcblxuXG4vKlxuICogTC5NYXAuVGFwIGlzIHVzZWQgdG8gZW5hYmxlIG1vYmlsZSBoYWNrcyBsaWtlIHF1aWNrIHRhcHMgYW5kIGxvbmcgaG9sZC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHR0YXA6IHRydWUsXG5cdHRhcFRvbGVyYW5jZTogMTVcbn0pO1xuXG5MLk1hcC5UYXAgPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX21hcC5fY29udGFpbmVyLCAndG91Y2hzdGFydCcsIHRoaXMuX29uRG93biwgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCB0aGlzLl9vbkRvd24sIHRoaXMpO1xuXHR9LFxuXG5cdF9vbkRvd246IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCFlLnRvdWNoZXMpIHsgcmV0dXJuOyB9XG5cblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXG5cdFx0dGhpcy5fZmlyZUNsaWNrID0gdHJ1ZTtcblxuXHRcdC8vIGRvbid0IHNpbXVsYXRlIGNsaWNrIG9yIHRyYWNrIGxvbmdwcmVzcyBpZiBtb3JlIHRoYW4gMSB0b3VjaFxuXHRcdGlmIChlLnRvdWNoZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0dGhpcy5fZmlyZUNsaWNrID0gZmFsc2U7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5faG9sZFRpbWVvdXQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlc1swXSxcblx0XHQgICAgZWwgPSBmaXJzdC50YXJnZXQ7XG5cblx0XHR0aGlzLl9zdGFydFBvcyA9IHRoaXMuX25ld1BvcyA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpO1xuXG5cdFx0Ly8gaWYgdG91Y2hpbmcgYSBsaW5rLCBoaWdobGlnaHQgaXRcblx0XHRpZiAoZWwudGFnTmFtZSAmJiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhJykge1xuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKGVsLCAnbGVhZmxldC1hY3RpdmUnKTtcblx0XHR9XG5cblx0XHQvLyBzaW11bGF0ZSBsb25nIGhvbGQgYnV0IHNldHRpbmcgYSB0aW1lb3V0XG5cdFx0dGhpcy5faG9sZFRpbWVvdXQgPSBzZXRUaW1lb3V0KEwuYmluZChmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodGhpcy5faXNUYXBWYWxpZCgpKSB7XG5cdFx0XHRcdHRoaXMuX2ZpcmVDbGljayA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLl9vblVwKCk7XG5cdFx0XHRcdHRoaXMuX3NpbXVsYXRlRXZlbnQoJ2NvbnRleHRtZW51JywgZmlyc3QpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpLCAxMDAwKTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHRcdC5vbihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uTW92ZSwgdGhpcylcblx0XHRcdC5vbihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fb25VcCwgdGhpcyk7XG5cdH0sXG5cblx0X29uVXA6IGZ1bmN0aW9uIChlKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2hvbGRUaW1lb3V0KTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHRcdC5vZmYoZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9vbk1vdmUsIHRoaXMpXG5cdFx0XHQub2ZmKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vblVwLCB0aGlzKTtcblxuXHRcdGlmICh0aGlzLl9maXJlQ2xpY2sgJiYgZSAmJiBlLmNoYW5nZWRUb3VjaGVzKSB7XG5cblx0XHRcdHZhciBmaXJzdCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0sXG5cdFx0XHQgICAgZWwgPSBmaXJzdC50YXJnZXQ7XG5cblx0XHRcdGlmIChlbCAmJiBlbC50YWdOYW1lICYmIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2EnKSB7XG5cdFx0XHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhlbCwgJ2xlYWZsZXQtYWN0aXZlJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNpbXVsYXRlIGNsaWNrIGlmIHRoZSB0b3VjaCBkaWRuJ3QgbW92ZSB0b28gbXVjaFxuXHRcdFx0aWYgKHRoaXMuX2lzVGFwVmFsaWQoKSkge1xuXHRcdFx0XHR0aGlzLl9zaW11bGF0ZUV2ZW50KCdjbGljaycsIGZpcnN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X2lzVGFwVmFsaWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fbmV3UG9zLmRpc3RhbmNlVG8odGhpcy5fc3RhcnRQb3MpIDw9IHRoaXMuX21hcC5vcHRpb25zLnRhcFRvbGVyYW5jZTtcblx0fSxcblxuXHRfb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlc1swXTtcblx0XHR0aGlzLl9uZXdQb3MgPSBuZXcgTC5Qb2ludChmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZKTtcblx0fSxcblxuXHRfc2ltdWxhdGVFdmVudDogZnVuY3Rpb24gKHR5cGUsIGUpIHtcblx0XHR2YXIgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcblxuXHRcdHNpbXVsYXRlZEV2ZW50Ll9zaW11bGF0ZWQgPSB0cnVlO1xuXHRcdGUudGFyZ2V0Ll9zaW11bGF0ZWRDbGljayA9IHRydWU7XG5cblx0XHRzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudChcblx0XHQgICAgICAgIHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSxcblx0XHQgICAgICAgIGUuc2NyZWVuWCwgZS5zY3JlZW5ZLFxuXHRcdCAgICAgICAgZS5jbGllbnRYLCBlLmNsaWVudFksXG5cdFx0ICAgICAgICBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG5cblx0XHRlLnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcblx0fVxufSk7XG5cbmlmIChMLkJyb3dzZXIudG91Y2ggJiYgIUwuQnJvd3Nlci5wb2ludGVyKSB7XG5cdEwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ3RhcCcsIEwuTWFwLlRhcCk7XG59XG5cblxuLypcbiAqIEwuSGFuZGxlci5TaGlmdERyYWdab29tIGlzIHVzZWQgdG8gYWRkIHNoaWZ0LWRyYWcgem9vbSBpbnRlcmFjdGlvbiB0byB0aGUgbWFwXG4gICogKHpvb20gdG8gYSBzZWxlY3RlZCBib3VuZGluZyBib3gpLCBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0Ym94Wm9vbTogdHJ1ZVxufSk7XG5cbkwuTWFwLkJveFpvb20gPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdHRoaXMuX21hcCA9IG1hcDtcblx0XHR0aGlzLl9jb250YWluZXIgPSBtYXAuX2NvbnRhaW5lcjtcblx0XHR0aGlzLl9wYW5lID0gbWFwLl9wYW5lcy5vdmVybGF5UGFuZTtcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuXHR9LFxuXG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbih0aGlzLl9jb250YWluZXIsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9jb250YWluZXIsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG5cdFx0dGhpcy5fbW92ZWQgPSBmYWxzZTtcblx0fSxcblxuXHRtb3ZlZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLl9tb3ZlZDtcblx0fSxcblxuXHRfb25Nb3VzZURvd246IGZ1bmN0aW9uIChlKSB7XG5cdFx0dGhpcy5fbW92ZWQgPSBmYWxzZTtcblxuXHRcdGlmICghZS5zaGlmdEtleSB8fCAoKGUud2hpY2ggIT09IDEpICYmIChlLmJ1dHRvbiAhPT0gMSkpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0TC5Eb21VdGlsLmRpc2FibGVUZXh0U2VsZWN0aW9uKCk7XG5cdFx0TC5Eb21VdGlsLmRpc2FibGVJbWFnZURyYWcoKTtcblxuXHRcdHRoaXMuX3N0YXJ0TGF5ZXJQb2ludCA9IHRoaXMuX21hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpO1xuXG5cdFx0TC5Eb21FdmVudFxuXHRcdCAgICAub24oZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcylcblx0XHQgICAgLm9uKGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCwgdGhpcylcblx0XHQgICAgLm9uKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX29uS2V5RG93biwgdGhpcyk7XG5cdH0sXG5cblx0X29uTW91c2VNb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICghdGhpcy5fbW92ZWQpIHtcblx0XHRcdHRoaXMuX2JveCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXpvb20tYm94JywgdGhpcy5fcGFuZSk7XG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fYm94LCB0aGlzLl9zdGFydExheWVyUG9pbnQpO1xuXG5cdFx0XHQvL1RPRE8gcmVmYWN0b3I6IG1vdmUgY3Vyc29yIHRvIHN0eWxlc1xuXHRcdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInO1xuXHRcdFx0dGhpcy5fbWFwLmZpcmUoJ2JveHpvb21zdGFydCcpO1xuXHRcdH1cblxuXHRcdHZhciBzdGFydFBvaW50ID0gdGhpcy5fc3RhcnRMYXllclBvaW50LFxuXHRcdCAgICBib3ggPSB0aGlzLl9ib3gsXG5cblx0XHQgICAgbGF5ZXJQb2ludCA9IHRoaXMuX21hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpLFxuXHRcdCAgICBvZmZzZXQgPSBsYXllclBvaW50LnN1YnRyYWN0KHN0YXJ0UG9pbnQpLFxuXG5cdFx0ICAgIG5ld1BvcyA9IG5ldyBMLlBvaW50KFxuXHRcdCAgICAgICAgTWF0aC5taW4obGF5ZXJQb2ludC54LCBzdGFydFBvaW50LngpLFxuXHRcdCAgICAgICAgTWF0aC5taW4obGF5ZXJQb2ludC55LCBzdGFydFBvaW50LnkpKTtcblxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihib3gsIG5ld1Bvcyk7XG5cblx0XHR0aGlzLl9tb3ZlZCA9IHRydWU7XG5cblx0XHQvLyBUT0RPIHJlZmFjdG9yOiByZW1vdmUgaGFyZGNvZGVkIDQgcGl4ZWxzXG5cdFx0Ym94LnN0eWxlLndpZHRoICA9IChNYXRoLm1heCgwLCBNYXRoLmFicyhvZmZzZXQueCkgLSA0KSkgKyAncHgnO1xuXHRcdGJveC5zdHlsZS5oZWlnaHQgPSAoTWF0aC5tYXgoMCwgTWF0aC5hYnMob2Zmc2V0LnkpIC0gNCkpICsgJ3B4Jztcblx0fSxcblxuXHRfZmluaXNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX21vdmVkKSB7XG5cdFx0XHR0aGlzLl9wYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2JveCk7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJyc7XG5cdFx0fVxuXG5cdFx0TC5Eb21VdGlsLmVuYWJsZVRleHRTZWxlY3Rpb24oKTtcblx0XHRMLkRvbVV0aWwuZW5hYmxlSW1hZ2VEcmFnKCk7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSlcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApXG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duKTtcblx0fSxcblxuXHRfb25Nb3VzZVVwOiBmdW5jdGlvbiAoZSkge1xuXG5cdFx0dGhpcy5fZmluaXNoKCk7XG5cblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICBsYXllclBvaW50ID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZSk7XG5cblx0XHRpZiAodGhpcy5fc3RhcnRMYXllclBvaW50LmVxdWFscyhsYXllclBvaW50KSkgeyByZXR1cm47IH1cblxuXHRcdHZhciBib3VuZHMgPSBuZXcgTC5MYXRMbmdCb3VuZHMoXG5cdFx0ICAgICAgICBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKHRoaXMuX3N0YXJ0TGF5ZXJQb2ludCksXG5cdFx0ICAgICAgICBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKGxheWVyUG9pbnQpKTtcblxuXHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblxuXHRcdG1hcC5maXJlKCdib3h6b29tZW5kJywge1xuXHRcdFx0Ym94Wm9vbUJvdW5kczogYm91bmRzXG5cdFx0fSk7XG5cdH0sXG5cblx0X29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0dGhpcy5fZmluaXNoKCk7XG5cdFx0fVxuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAnYm94Wm9vbScsIEwuTWFwLkJveFpvb20pO1xuXG5cbi8qXG4gKiBMLk1hcC5LZXlib2FyZCBpcyBoYW5kbGluZyBrZXlib2FyZCBpbnRlcmFjdGlvbiB3aXRoIHRoZSBtYXAsIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRrZXlib2FyZDogdHJ1ZSxcblx0a2V5Ym9hcmRQYW5PZmZzZXQ6IDgwLFxuXHRrZXlib2FyZFpvb21PZmZzZXQ6IDFcbn0pO1xuXG5MLk1hcC5LZXlib2FyZCA9IEwuSGFuZGxlci5leHRlbmQoe1xuXG5cdGtleUNvZGVzOiB7XG5cdFx0bGVmdDogICAgWzM3XSxcblx0XHRyaWdodDogICBbMzldLFxuXHRcdGRvd246ICAgIFs0MF0sXG5cdFx0dXA6ICAgICAgWzM4XSxcblx0XHR6b29tSW46ICBbMTg3LCAxMDcsIDYxLCAxNzFdLFxuXHRcdHpvb21PdXQ6IFsxODksIDEwOSwgMTczXVxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChtYXApIHtcblx0XHR0aGlzLl9tYXAgPSBtYXA7XG5cblx0XHR0aGlzLl9zZXRQYW5PZmZzZXQobWFwLm9wdGlvbnMua2V5Ym9hcmRQYW5PZmZzZXQpO1xuXHRcdHRoaXMuX3NldFpvb21PZmZzZXQobWFwLm9wdGlvbnMua2V5Ym9hcmRab29tT2Zmc2V0KTtcblx0fSxcblxuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9tYXAuX2NvbnRhaW5lcjtcblxuXHRcdC8vIG1ha2UgdGhlIGNvbnRhaW5lciBmb2N1c2FibGUgYnkgdGFiYmluZ1xuXHRcdGlmIChjb250YWluZXIudGFiSW5kZXggPT09IC0xKSB7XG5cdFx0XHRjb250YWluZXIudGFiSW5kZXggPSAnMCc7XG5cdFx0fVxuXG5cdFx0TC5Eb21FdmVudFxuXHRcdCAgICAub24oY29udGFpbmVyLCAnZm9jdXMnLCB0aGlzLl9vbkZvY3VzLCB0aGlzKVxuXHRcdCAgICAub24oY29udGFpbmVyLCAnYmx1cicsIHRoaXMuX29uQmx1ciwgdGhpcylcblx0XHQgICAgLm9uKGNvbnRhaW5lciwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLCB0aGlzKTtcblxuXHRcdHRoaXMuX21hcFxuXHRcdCAgICAub24oJ2ZvY3VzJywgdGhpcy5fYWRkSG9va3MsIHRoaXMpXG5cdFx0ICAgIC5vbignYmx1cicsIHRoaXMuX3JlbW92ZUhvb2tzLCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX3JlbW92ZUhvb2tzKCk7XG5cblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fbWFwLl9jb250YWluZXI7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoY29udGFpbmVyLCAnZm9jdXMnLCB0aGlzLl9vbkZvY3VzLCB0aGlzKVxuXHRcdCAgICAub2ZmKGNvbnRhaW5lciwgJ2JsdXInLCB0aGlzLl9vbkJsdXIsIHRoaXMpXG5cdFx0ICAgIC5vZmYoY29udGFpbmVyLCAnbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24sIHRoaXMpO1xuXG5cdFx0dGhpcy5fbWFwXG5cdFx0ICAgIC5vZmYoJ2ZvY3VzJywgdGhpcy5fYWRkSG9va3MsIHRoaXMpXG5cdFx0ICAgIC5vZmYoJ2JsdXInLCB0aGlzLl9yZW1vdmVIb29rcywgdGhpcyk7XG5cdH0sXG5cblx0X29uTW91c2VEb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX2ZvY3VzZWQpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG5cdFx0ICAgIGRvY0VsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXHRcdCAgICB0b3AgPSBib2R5LnNjcm9sbFRvcCB8fCBkb2NFbC5zY3JvbGxUb3AsXG5cdFx0ICAgIGxlZnQgPSBib2R5LnNjcm9sbExlZnQgfHwgZG9jRWwuc2Nyb2xsTGVmdDtcblxuXHRcdHRoaXMuX21hcC5fY29udGFpbmVyLmZvY3VzKCk7XG5cblx0XHR3aW5kb3cuc2Nyb2xsVG8obGVmdCwgdG9wKTtcblx0fSxcblxuXHRfb25Gb2N1czogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2ZvY3VzZWQgPSB0cnVlO1xuXHRcdHRoaXMuX21hcC5maXJlKCdmb2N1cycpO1xuXHR9LFxuXG5cdF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9mb2N1c2VkID0gZmFsc2U7XG5cdFx0dGhpcy5fbWFwLmZpcmUoJ2JsdXInKTtcblx0fSxcblxuXHRfc2V0UGFuT2Zmc2V0OiBmdW5jdGlvbiAocGFuKSB7XG5cdFx0dmFyIGtleXMgPSB0aGlzLl9wYW5LZXlzID0ge30sXG5cdFx0ICAgIGNvZGVzID0gdGhpcy5rZXlDb2Rlcyxcblx0XHQgICAgaSwgbGVuO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29kZXMubGVmdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0a2V5c1tjb2Rlcy5sZWZ0W2ldXSA9IFstMSAqIHBhbiwgMF07XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnJpZ2h0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLnJpZ2h0W2ldXSA9IFtwYW4sIDBdO1xuXHRcdH1cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb2Rlcy5kb3duLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLmRvd25baV1dID0gWzAsIHBhbl07XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnVwLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLnVwW2ldXSA9IFswLCAtMSAqIHBhbl07XG5cdFx0fVxuXHR9LFxuXG5cdF9zZXRab29tT2Zmc2V0OiBmdW5jdGlvbiAoem9vbSkge1xuXHRcdHZhciBrZXlzID0gdGhpcy5fem9vbUtleXMgPSB7fSxcblx0XHQgICAgY29kZXMgPSB0aGlzLmtleUNvZGVzLFxuXHRcdCAgICBpLCBsZW47XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb2Rlcy56b29tSW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMuem9vbUluW2ldXSA9IHpvb207XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnpvb21PdXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMuem9vbU91dFtpXV0gPSAtem9vbTtcblx0XHR9XG5cdH0sXG5cblx0X2FkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbihkb2N1bWVudCwgJ2tleWRvd24nLCB0aGlzLl9vbktleURvd24sIHRoaXMpO1xuXHR9LFxuXG5cdF9yZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX29uS2V5RG93biwgdGhpcyk7XG5cdH0sXG5cblx0X29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIga2V5ID0gZS5rZXlDb2RlLFxuXHRcdCAgICBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRpZiAoa2V5IGluIHRoaXMuX3BhbktleXMpIHtcblxuXHRcdFx0aWYgKG1hcC5fcGFuQW5pbSAmJiBtYXAuX3BhbkFuaW0uX2luUHJvZ3Jlc3MpIHsgcmV0dXJuOyB9XG5cblx0XHRcdG1hcC5wYW5CeSh0aGlzLl9wYW5LZXlzW2tleV0pO1xuXG5cdFx0XHRpZiAobWFwLm9wdGlvbnMubWF4Qm91bmRzKSB7XG5cdFx0XHRcdG1hcC5wYW5JbnNpZGVCb3VuZHMobWFwLm9wdGlvbnMubWF4Qm91bmRzKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoa2V5IGluIHRoaXMuX3pvb21LZXlzKSB7XG5cdFx0XHRtYXAuc2V0Wm9vbShtYXAuZ2V0Wm9vbSgpICsgdGhpcy5fem9vbUtleXNba2V5XSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdEwuRG9tRXZlbnQuc3RvcChlKTtcblx0fVxufSk7XG5cbkwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ2tleWJvYXJkJywgTC5NYXAuS2V5Ym9hcmQpO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuTWFya2VyRHJhZyBpcyB1c2VkIGludGVybmFsbHkgYnkgTC5NYXJrZXIgdG8gbWFrZSB0aGUgbWFya2VycyBkcmFnZ2FibGUuXG4gKi9cblxuTC5IYW5kbGVyLk1hcmtlckRyYWcgPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcmtlcikge1xuXHRcdHRoaXMuX21hcmtlciA9IG1hcmtlcjtcblx0fSxcblxuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpY29uID0gdGhpcy5fbWFya2VyLl9pY29uO1xuXHRcdGlmICghdGhpcy5fZHJhZ2dhYmxlKSB7XG5cdFx0XHR0aGlzLl9kcmFnZ2FibGUgPSBuZXcgTC5EcmFnZ2FibGUoaWNvbiwgaWNvbik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fZHJhZ2dhYmxlXG5cdFx0XHQub24oJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0LCB0aGlzKVxuXHRcdFx0Lm9uKCdkcmFnJywgdGhpcy5fb25EcmFnLCB0aGlzKVxuXHRcdFx0Lm9uKCdkcmFnZW5kJywgdGhpcy5fb25EcmFnRW5kLCB0aGlzKTtcblx0XHR0aGlzLl9kcmFnZ2FibGUuZW5hYmxlKCk7XG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX21hcmtlci5faWNvbiwgJ2xlYWZsZXQtbWFya2VyLWRyYWdnYWJsZScpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fZHJhZ2dhYmxlXG5cdFx0XHQub2ZmKCdkcmFnc3RhcnQnLCB0aGlzLl9vbkRyYWdTdGFydCwgdGhpcylcblx0XHRcdC5vZmYoJ2RyYWcnLCB0aGlzLl9vbkRyYWcsIHRoaXMpXG5cdFx0XHQub2ZmKCdkcmFnZW5kJywgdGhpcy5fb25EcmFnRW5kLCB0aGlzKTtcblxuXHRcdHRoaXMuX2RyYWdnYWJsZS5kaXNhYmxlKCk7XG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX21hcmtlci5faWNvbiwgJ2xlYWZsZXQtbWFya2VyLWRyYWdnYWJsZScpO1xuXHR9LFxuXG5cdG1vdmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RyYWdnYWJsZSAmJiB0aGlzLl9kcmFnZ2FibGUuX21vdmVkO1xuXHR9LFxuXG5cdF9vbkRyYWdTdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX21hcmtlclxuXHRcdCAgICAuY2xvc2VQb3B1cCgpXG5cdFx0ICAgIC5maXJlKCdtb3Zlc3RhcnQnKVxuXHRcdCAgICAuZmlyZSgnZHJhZ3N0YXJ0Jyk7XG5cdH0sXG5cblx0X29uRHJhZzogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXJrZXIgPSB0aGlzLl9tYXJrZXIsXG5cdFx0ICAgIHNoYWRvdyA9IG1hcmtlci5fc2hhZG93LFxuXHRcdCAgICBpY29uUG9zID0gTC5Eb21VdGlsLmdldFBvc2l0aW9uKG1hcmtlci5faWNvbiksXG5cdFx0ICAgIGxhdGxuZyA9IG1hcmtlci5fbWFwLmxheWVyUG9pbnRUb0xhdExuZyhpY29uUG9zKTtcblxuXHRcdC8vIHVwZGF0ZSBzaGFkb3cgcG9zaXRpb25cblx0XHRpZiAoc2hhZG93KSB7XG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24oc2hhZG93LCBpY29uUG9zKTtcblx0XHR9XG5cblx0XHRtYXJrZXIuX2xhdGxuZyA9IGxhdGxuZztcblxuXHRcdG1hcmtlclxuXHRcdCAgICAuZmlyZSgnbW92ZScsIHtsYXRsbmc6IGxhdGxuZ30pXG5cdFx0ICAgIC5maXJlKCdkcmFnJyk7XG5cdH0sXG5cblx0X29uRHJhZ0VuZDogZnVuY3Rpb24gKGUpIHtcblx0XHR0aGlzLl9tYXJrZXJcblx0XHQgICAgLmZpcmUoJ21vdmVlbmQnKVxuXHRcdCAgICAuZmlyZSgnZHJhZ2VuZCcsIGUpO1xuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wgaXMgYSBiYXNlIGNsYXNzIGZvciBpbXBsZW1lbnRpbmcgbWFwIGNvbnRyb2xzLiBIYW5kbGVzIHBvc2l0aW9uaW5nLlxyXG4gKiBBbGwgb3RoZXIgY29udHJvbHMgZXh0ZW5kIGZyb20gdGhpcyBjbGFzcy5cclxuICovXHJcblxyXG5MLkNvbnRyb2wgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0cG9zaXRpb246ICd0b3ByaWdodCdcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvc2l0aW9uOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XHJcblxyXG5cdFx0aWYgKG1hcCkge1xyXG5cdFx0XHRtYXAucmVtb3ZlQ29udHJvbCh0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcblx0XHRpZiAobWFwKSB7XHJcblx0XHRcdG1hcC5hZGRDb250cm9sKHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSB0aGlzLm9uQWRkKG1hcCksXHJcblx0XHQgICAgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpLFxyXG5cdFx0ICAgIGNvcm5lciA9IG1hcC5fY29udHJvbENvcm5lcnNbcG9zXTtcclxuXHJcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC1jb250cm9sJyk7XHJcblxyXG5cdFx0aWYgKHBvcy5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpIHtcclxuXHRcdFx0Y29ybmVyLmluc2VydEJlZm9yZShjb250YWluZXIsIGNvcm5lci5maXJzdENoaWxkKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvcm5lci5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUZyb206IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHZhciBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCksXHJcblx0XHQgICAgY29ybmVyID0gbWFwLl9jb250cm9sQ29ybmVyc1twb3NdO1xyXG5cclxuXHRcdGNvcm5lci5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5vblJlbW92ZSkge1xyXG5cdFx0XHR0aGlzLm9uUmVtb3ZlKG1hcCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X3JlZm9jdXNPbk1hcDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9tYXAuZ2V0Q29udGFpbmVyKCkuZm9jdXMoKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ29udHJvbChvcHRpb25zKTtcclxufTtcclxuXHJcblxyXG4vLyBhZGRzIGNvbnRyb2wtcmVsYXRlZCBtZXRob2RzIHRvIEwuTWFwXHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRhZGRDb250cm9sOiBmdW5jdGlvbiAoY29udHJvbCkge1xyXG5cdFx0Y29udHJvbC5hZGRUbyh0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUNvbnRyb2w6IGZ1bmN0aW9uIChjb250cm9sKSB7XHJcblx0XHRjb250cm9sLnJlbW92ZUZyb20odGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfaW5pdENvbnRyb2xQb3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb3JuZXJzID0gdGhpcy5fY29udHJvbENvcm5lcnMgPSB7fSxcclxuXHRcdCAgICBsID0gJ2xlYWZsZXQtJyxcclxuXHRcdCAgICBjb250YWluZXIgPSB0aGlzLl9jb250cm9sQ29udGFpbmVyID1cclxuXHRcdCAgICAgICAgICAgIEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGwgKyAnY29udHJvbC1jb250YWluZXInLCB0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIGNyZWF0ZUNvcm5lcih2U2lkZSwgaFNpZGUpIHtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IGwgKyB2U2lkZSArICcgJyArIGwgKyBoU2lkZTtcclxuXHJcblx0XHRcdGNvcm5lcnNbdlNpZGUgKyBoU2lkZV0gPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIGNvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0Y3JlYXRlQ29ybmVyKCd0b3AnLCAnbGVmdCcpO1xyXG5cdFx0Y3JlYXRlQ29ybmVyKCd0b3AnLCAncmlnaHQnKTtcclxuXHRcdGNyZWF0ZUNvcm5lcignYm90dG9tJywgJ2xlZnQnKTtcclxuXHRcdGNyZWF0ZUNvcm5lcignYm90dG9tJywgJ3JpZ2h0Jyk7XHJcblx0fSxcclxuXHJcblx0X2NsZWFyQ29udHJvbFBvczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRyb2xDb250YWluZXIpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wuWm9vbSBpcyB1c2VkIGZvciB0aGUgZGVmYXVsdCB6b29tIGJ1dHRvbnMgb24gdGhlIG1hcC5cclxuICovXHJcblxyXG5MLkNvbnRyb2wuWm9vbSA9IEwuQ29udHJvbC5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdHBvc2l0aW9uOiAndG9wbGVmdCcsXHJcblx0XHR6b29tSW5UZXh0OiAnKycsXHJcblx0XHR6b29tSW5UaXRsZTogJ1pvb20gaW4nLFxyXG5cdFx0em9vbU91dFRleHQ6ICctJyxcclxuXHRcdHpvb21PdXRUaXRsZTogJ1pvb20gb3V0J1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR2YXIgem9vbU5hbWUgPSAnbGVhZmxldC1jb250cm9sLXpvb20nLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHpvb21OYW1lICsgJyBsZWFmbGV0LWJhcicpO1xyXG5cclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHR0aGlzLl96b29tSW5CdXR0b24gID0gdGhpcy5fY3JlYXRlQnV0dG9uKFxyXG5cdFx0ICAgICAgICB0aGlzLm9wdGlvbnMuem9vbUluVGV4dCwgdGhpcy5vcHRpb25zLnpvb21JblRpdGxlLFxyXG5cdFx0ICAgICAgICB6b29tTmFtZSArICctaW4nLCAgY29udGFpbmVyLCB0aGlzLl96b29tSW4sICB0aGlzKTtcclxuXHRcdHRoaXMuX3pvb21PdXRCdXR0b24gPSB0aGlzLl9jcmVhdGVCdXR0b24oXHJcblx0XHQgICAgICAgIHRoaXMub3B0aW9ucy56b29tT3V0VGV4dCwgdGhpcy5vcHRpb25zLnpvb21PdXRUaXRsZSxcclxuXHRcdCAgICAgICAgem9vbU5hbWUgKyAnLW91dCcsIGNvbnRhaW5lciwgdGhpcy5fem9vbU91dCwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlRGlzYWJsZWQoKTtcclxuXHRcdG1hcC5vbignem9vbWVuZCB6b29tbGV2ZWxzY2hhbmdlJywgdGhpcy5fdXBkYXRlRGlzYWJsZWQsIHRoaXMpO1xyXG5cclxuXHRcdHJldHVybiBjb250YWluZXI7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5vZmYoJ3pvb21lbmQgem9vbWxldmVsc2NoYW5nZScsIHRoaXMuX3VwZGF0ZURpc2FibGVkLCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRfem9vbUluOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fbWFwLnpvb21JbihlLnNoaWZ0S2V5ID8gMyA6IDEpO1xyXG5cdH0sXHJcblxyXG5cdF96b29tT3V0OiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fbWFwLnpvb21PdXQoZS5zaGlmdEtleSA/IDMgOiAxKTtcclxuXHR9LFxyXG5cclxuXHRfY3JlYXRlQnV0dG9uOiBmdW5jdGlvbiAoaHRtbCwgdGl0bGUsIGNsYXNzTmFtZSwgY29udGFpbmVyLCBmbiwgY29udGV4dCkge1xyXG5cdFx0dmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgY2xhc3NOYW1lLCBjb250YWluZXIpO1xyXG5cdFx0bGluay5pbm5lckhUTUwgPSBodG1sO1xyXG5cdFx0bGluay5ocmVmID0gJyMnO1xyXG5cdFx0bGluay50aXRsZSA9IHRpdGxlO1xyXG5cclxuXHRcdHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XHJcblxyXG5cdFx0TC5Eb21FdmVudFxyXG5cdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxyXG5cdFx0ICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcclxuXHRcdCAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcclxuXHRcdCAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdClcclxuXHRcdCAgICAub24obGluaywgJ2NsaWNrJywgZm4sIGNvbnRleHQpXHJcblx0XHQgICAgLm9uKGxpbmssICdjbGljaycsIHRoaXMuX3JlZm9jdXNPbk1hcCwgY29udGV4dCk7XHJcblxyXG5cdFx0cmV0dXJuIGxpbms7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZURpc2FibGVkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0XHRjbGFzc05hbWUgPSAnbGVhZmxldC1kaXNhYmxlZCc7XHJcblxyXG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3pvb21JbkJ1dHRvbiwgY2xhc3NOYW1lKTtcclxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl96b29tT3V0QnV0dG9uLCBjbGFzc05hbWUpO1xyXG5cclxuXHRcdGlmIChtYXAuX3pvb20gPT09IG1hcC5nZXRNaW5ab29tKCkpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3pvb21PdXRCdXR0b24sIGNsYXNzTmFtZSk7XHJcblx0XHR9XHJcblx0XHRpZiAobWFwLl96b29tID09PSBtYXAuZ2V0TWF4Wm9vbSgpKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl96b29tSW5CdXR0b24sIGNsYXNzTmFtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXHJcbkwuTWFwLm1lcmdlT3B0aW9ucyh7XHJcblx0em9vbUNvbnRyb2w6IHRydWVcclxufSk7XHJcblxyXG5MLk1hcC5hZGRJbml0SG9vayhmdW5jdGlvbiAoKSB7XHJcblx0aWYgKHRoaXMub3B0aW9ucy56b29tQ29udHJvbCkge1xyXG5cdFx0dGhpcy56b29tQ29udHJvbCA9IG5ldyBMLkNvbnRyb2wuWm9vbSgpO1xyXG5cdFx0dGhpcy5hZGRDb250cm9sKHRoaXMuem9vbUNvbnRyb2wpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNvbnRyb2wuem9vbSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkNvbnRyb2wuWm9vbShvcHRpb25zKTtcclxufTtcclxuXHJcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wuQXR0cmlidXRpb24gaXMgdXNlZCBmb3IgZGlzcGxheWluZyBhdHRyaWJ1dGlvbiBvbiB0aGUgbWFwIChhZGRlZCBieSBkZWZhdWx0KS5cclxuICovXHJcblxyXG5MLkNvbnRyb2wuQXR0cmlidXRpb24gPSBMLkNvbnRyb2wuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRwb3NpdGlvbjogJ2JvdHRvbXJpZ2h0JyxcclxuXHRcdHByZWZpeDogJzxhIGhyZWY9XCJodHRwOi8vbGVhZmxldGpzLmNvbVwiIHRpdGxlPVwiQSBKUyBsaWJyYXJ5IGZvciBpbnRlcmFjdGl2ZSBtYXBzXCI+TGVhZmxldDwvYT4nXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9hdHRyaWJ1dGlvbnMgPSB7fTtcclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtY29udHJvbC1hdHRyaWJ1dGlvbicpO1xyXG5cdFx0TC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gbWFwLl9sYXllcnMpIHtcclxuXHRcdFx0aWYgKG1hcC5fbGF5ZXJzW2ldLmdldEF0dHJpYnV0aW9uKSB7XHJcblx0XHRcdFx0dGhpcy5hZGRBdHRyaWJ1dGlvbihtYXAuX2xheWVyc1tpXS5nZXRBdHRyaWJ1dGlvbigpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRtYXBcclxuXHRcdCAgICAub24oJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckFkZCwgdGhpcylcclxuXHRcdCAgICAub24oJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwXHJcblx0XHQgICAgLm9mZignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQWRkKVxyXG5cdFx0ICAgIC5vZmYoJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldFByZWZpeDogZnVuY3Rpb24gKHByZWZpeCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLnByZWZpeCA9IHByZWZpeDtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkQXR0cmlidXRpb246IGZ1bmN0aW9uICh0ZXh0KSB7XHJcblx0XHRpZiAoIXRleHQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0pIHtcclxuXHRcdFx0dGhpcy5fYXR0cmlidXRpb25zW3RleHRdID0gMDtcclxuXHRcdH1cclxuXHRcdHRoaXMuX2F0dHJpYnV0aW9uc1t0ZXh0XSsrO1xyXG5cclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUF0dHJpYnV0aW9uOiBmdW5jdGlvbiAodGV4dCkge1xyXG5cdFx0aWYgKCF0ZXh0KSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmICh0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0pIHtcclxuXHRcdFx0dGhpcy5fYXR0cmlidXRpb25zW3RleHRdLS07XHJcblx0XHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBhdHRyaWJzID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9hdHRyaWJ1dGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2F0dHJpYnV0aW9uc1tpXSkge1xyXG5cdFx0XHRcdGF0dHJpYnMucHVzaChpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBwcmVmaXhBbmRBdHRyaWJzID0gW107XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5wcmVmaXgpIHtcclxuXHRcdFx0cHJlZml4QW5kQXR0cmlicy5wdXNoKHRoaXMub3B0aW9ucy5wcmVmaXgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGF0dHJpYnMubGVuZ3RoKSB7XHJcblx0XHRcdHByZWZpeEFuZEF0dHJpYnMucHVzaChhdHRyaWJzLmpvaW4oJywgJykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBwcmVmaXhBbmRBdHRyaWJzLmpvaW4oJyB8ICcpO1xyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyQWRkOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcclxuXHRcdFx0dGhpcy5hZGRBdHRyaWJ1dGlvbihlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyUmVtb3ZlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcclxuXHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGlvbihlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xyXG5cdGF0dHJpYnV0aW9uQ29udHJvbDogdHJ1ZVxyXG59KTtcclxuXHJcbkwuTWFwLmFkZEluaXRIb29rKGZ1bmN0aW9uICgpIHtcclxuXHRpZiAodGhpcy5vcHRpb25zLmF0dHJpYnV0aW9uQ29udHJvbCkge1xyXG5cdFx0dGhpcy5hdHRyaWJ1dGlvbkNvbnRyb2wgPSAobmV3IEwuQ29udHJvbC5BdHRyaWJ1dGlvbigpKS5hZGRUbyh0aGlzKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sLmF0dHJpYnV0aW9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ29udHJvbC5BdHRyaWJ1dGlvbihvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXG4gKiBMLkNvbnRyb2wuU2NhbGUgaXMgdXNlZCBmb3IgZGlzcGxheWluZyBtZXRyaWMvaW1wZXJpYWwgc2NhbGUgb24gdGhlIG1hcC5cbiAqL1xuXG5MLkNvbnRyb2wuU2NhbGUgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcblx0b3B0aW9uczoge1xuXHRcdHBvc2l0aW9uOiAnYm90dG9tbGVmdCcsXG5cdFx0bWF4V2lkdGg6IDEwMCxcblx0XHRtZXRyaWM6IHRydWUsXG5cdFx0aW1wZXJpYWw6IHRydWUsXG5cdFx0dXBkYXRlV2hlbklkbGU6IGZhbHNlXG5cdH0sXG5cblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcblx0XHR0aGlzLl9tYXAgPSBtYXA7XG5cblx0XHR2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtY29udHJvbC1zY2FsZScsXG5cdFx0ICAgIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSksXG5cdFx0ICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHR0aGlzLl9hZGRTY2FsZXMob3B0aW9ucywgY2xhc3NOYW1lLCBjb250YWluZXIpO1xuXG5cdFx0bWFwLm9uKG9wdGlvbnMudXBkYXRlV2hlbklkbGUgPyAnbW92ZWVuZCcgOiAnbW92ZScsIHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG5cdFx0bWFwLndoZW5SZWFkeSh0aGlzLl91cGRhdGUsIHRoaXMpO1xuXG5cdFx0cmV0dXJuIGNvbnRhaW5lcjtcblx0fSxcblxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdG1hcC5vZmYodGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlID8gJ21vdmVlbmQnIDogJ21vdmUnLCB0aGlzLl91cGRhdGUsIHRoaXMpO1xuXHR9LFxuXG5cdF9hZGRTY2FsZXM6IGZ1bmN0aW9uIChvcHRpb25zLCBjbGFzc05hbWUsIGNvbnRhaW5lcikge1xuXHRcdGlmIChvcHRpb25zLm1ldHJpYykge1xuXHRcdFx0dGhpcy5fbVNjYWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1saW5lJywgY29udGFpbmVyKTtcblx0XHR9XG5cdFx0aWYgKG9wdGlvbnMuaW1wZXJpYWwpIHtcblx0XHRcdHRoaXMuX2lTY2FsZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctbGluZScsIGNvbnRhaW5lcik7XG5cdFx0fVxuXHR9LFxuXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpLFxuXHRcdCAgICBjZW50ZXJMYXQgPSBib3VuZHMuZ2V0Q2VudGVyKCkubGF0LFxuXHRcdCAgICBoYWxmV29ybGRNZXRlcnMgPSA2Mzc4MTM3ICogTWF0aC5QSSAqIE1hdGguY29zKGNlbnRlckxhdCAqIE1hdGguUEkgLyAxODApLFxuXHRcdCAgICBkaXN0ID0gaGFsZldvcmxkTWV0ZXJzICogKGJvdW5kcy5nZXROb3J0aEVhc3QoKS5sbmcgLSBib3VuZHMuZ2V0U291dGhXZXN0KCkubG5nKSAvIDE4MCxcblxuXHRcdCAgICBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKSxcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHQgICAgbWF4TWV0ZXJzID0gMDtcblxuXHRcdGlmIChzaXplLnggPiAwKSB7XG5cdFx0XHRtYXhNZXRlcnMgPSBkaXN0ICogKG9wdGlvbnMubWF4V2lkdGggLyBzaXplLngpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3VwZGF0ZVNjYWxlcyhvcHRpb25zLCBtYXhNZXRlcnMpO1xuXHR9LFxuXG5cdF91cGRhdGVTY2FsZXM6IGZ1bmN0aW9uIChvcHRpb25zLCBtYXhNZXRlcnMpIHtcblx0XHRpZiAob3B0aW9ucy5tZXRyaWMgJiYgbWF4TWV0ZXJzKSB7XG5cdFx0XHR0aGlzLl91cGRhdGVNZXRyaWMobWF4TWV0ZXJzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5pbXBlcmlhbCAmJiBtYXhNZXRlcnMpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUltcGVyaWFsKG1heE1ldGVycyk7XG5cdFx0fVxuXHR9LFxuXG5cdF91cGRhdGVNZXRyaWM6IGZ1bmN0aW9uIChtYXhNZXRlcnMpIHtcblx0XHR2YXIgbWV0ZXJzID0gdGhpcy5fZ2V0Um91bmROdW0obWF4TWV0ZXJzKTtcblxuXHRcdHRoaXMuX21TY2FsZS5zdHlsZS53aWR0aCA9IHRoaXMuX2dldFNjYWxlV2lkdGgobWV0ZXJzIC8gbWF4TWV0ZXJzKSArICdweCc7XG5cdFx0dGhpcy5fbVNjYWxlLmlubmVySFRNTCA9IG1ldGVycyA8IDEwMDAgPyBtZXRlcnMgKyAnIG0nIDogKG1ldGVycyAvIDEwMDApICsgJyBrbSc7XG5cdH0sXG5cblx0X3VwZGF0ZUltcGVyaWFsOiBmdW5jdGlvbiAobWF4TWV0ZXJzKSB7XG5cdFx0dmFyIG1heEZlZXQgPSBtYXhNZXRlcnMgKiAzLjI4MDgzOTksXG5cdFx0ICAgIHNjYWxlID0gdGhpcy5faVNjYWxlLFxuXHRcdCAgICBtYXhNaWxlcywgbWlsZXMsIGZlZXQ7XG5cblx0XHRpZiAobWF4RmVldCA+IDUyODApIHtcblx0XHRcdG1heE1pbGVzID0gbWF4RmVldCAvIDUyODA7XG5cdFx0XHRtaWxlcyA9IHRoaXMuX2dldFJvdW5kTnVtKG1heE1pbGVzKTtcblxuXHRcdFx0c2NhbGUuc3R5bGUud2lkdGggPSB0aGlzLl9nZXRTY2FsZVdpZHRoKG1pbGVzIC8gbWF4TWlsZXMpICsgJ3B4Jztcblx0XHRcdHNjYWxlLmlubmVySFRNTCA9IG1pbGVzICsgJyBtaSc7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmVldCA9IHRoaXMuX2dldFJvdW5kTnVtKG1heEZlZXQpO1xuXG5cdFx0XHRzY2FsZS5zdHlsZS53aWR0aCA9IHRoaXMuX2dldFNjYWxlV2lkdGgoZmVldCAvIG1heEZlZXQpICsgJ3B4Jztcblx0XHRcdHNjYWxlLmlubmVySFRNTCA9IGZlZXQgKyAnIGZ0Jztcblx0XHR9XG5cdH0sXG5cblx0X2dldFNjYWxlV2lkdGg6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAqIHJhdGlvKSAtIDEwO1xuXHR9LFxuXG5cdF9nZXRSb3VuZE51bTogZnVuY3Rpb24gKG51bSkge1xuXHRcdHZhciBwb3cxMCA9IE1hdGgucG93KDEwLCAoTWF0aC5mbG9vcihudW0pICsgJycpLmxlbmd0aCAtIDEpLFxuXHRcdCAgICBkID0gbnVtIC8gcG93MTA7XG5cblx0XHRkID0gZCA+PSAxMCA/IDEwIDogZCA+PSA1ID8gNSA6IGQgPj0gMyA/IDMgOiBkID49IDIgPyAyIDogMTtcblxuXHRcdHJldHVybiBwb3cxMCAqIGQ7XG5cdH1cbn0pO1xuXG5MLmNvbnRyb2wuc2NhbGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRyZXR1cm4gbmV3IEwuQ29udHJvbC5TY2FsZShvcHRpb25zKTtcbn07XG5cblxuLypcclxuICogTC5Db250cm9sLkxheWVycyBpcyBhIGNvbnRyb2wgdG8gYWxsb3cgdXNlcnMgdG8gc3dpdGNoIGJldHdlZW4gZGlmZmVyZW50IGxheWVycyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuQ29udHJvbC5MYXllcnMgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRjb2xsYXBzZWQ6IHRydWUsXHJcblx0XHRwb3NpdGlvbjogJ3RvcHJpZ2h0JyxcclxuXHRcdGF1dG9aSW5kZXg6IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAoYmFzZUxheWVycywgb3ZlcmxheXMsIG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHRcdHRoaXMuX2xhc3RaSW5kZXggPSAwO1xyXG5cdFx0dGhpcy5faGFuZGxpbmdDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gYmFzZUxheWVycykge1xyXG5cdFx0XHR0aGlzLl9hZGRMYXllcihiYXNlTGF5ZXJzW2ldLCBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgaW4gb3ZlcmxheXMpIHtcclxuXHRcdFx0dGhpcy5fYWRkTGF5ZXIob3ZlcmxheXNbaV0sIGksIHRydWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9pbml0TGF5b3V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHJcblx0XHRtYXBcclxuXHRcdCAgICAub24oJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckNoYW5nZSwgdGhpcylcclxuXHRcdCAgICAub24oJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllckNoYW5nZSwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwXHJcblx0XHQgICAgLm9mZignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQ2hhbmdlLCB0aGlzKVxyXG5cdFx0ICAgIC5vZmYoJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllckNoYW5nZSwgdGhpcyk7XHJcblx0fSxcclxuXHJcblx0YWRkQmFzZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIsIG5hbWUpIHtcclxuXHRcdHRoaXMuX2FkZExheWVyKGxheWVyLCBuYW1lKTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkT3ZlcmxheTogZnVuY3Rpb24gKGxheWVyLCBuYW1lKSB7XHJcblx0XHR0aGlzLl9hZGRMYXllcihsYXllciwgbmFtZSwgdHJ1ZSk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cdFx0ZGVsZXRlIHRoaXMuX2xheWVyc1tpZF07XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0TGF5b3V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtY29udHJvbC1sYXllcnMnLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSk7XHJcblxyXG5cdFx0Ly9NYWtlcyB0aGlzIHdvcmsgb24gSUUxMCBUb3VjaCBkZXZpY2VzIGJ5IHN0b3BwaW5nIGl0IGZyb20gZmlyaW5nIGEgbW91c2VvdXQgZXZlbnQgd2hlbiB0aGUgdG91Y2ggaXMgcmVsZWFzZWRcclxuXHRcdGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCB0cnVlKTtcclxuXHJcblx0XHRpZiAoIUwuQnJvd3Nlci50b3VjaCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdFx0LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKGNvbnRhaW5lcilcclxuXHRcdFx0XHQuZGlzYWJsZVNjcm9sbFByb3BhZ2F0aW9uKGNvbnRhaW5lcik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGNvbnRhaW5lciwgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2Zvcm0nLCBjbGFzc05hbWUgKyAnLWxpc3QnKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNvbGxhcHNlZCkge1xyXG5cdFx0XHRpZiAoIUwuQnJvd3Nlci5hbmRyb2lkKSB7XHJcblx0XHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdCAgICAub24oY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fZXhwYW5kLCB0aGlzKVxyXG5cdFx0XHRcdCAgICAub24oY29udGFpbmVyLCAnbW91c2VvdXQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIGxpbmsgPSB0aGlzLl9sYXllcnNMaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsIGNsYXNzTmFtZSArICctdG9nZ2xlJywgY29udGFpbmVyKTtcclxuXHRcdFx0bGluay5ocmVmID0gJyMnO1xyXG5cdFx0XHRsaW5rLnRpdGxlID0gJ0xheWVycyc7XHJcblxyXG5cdFx0XHRpZiAoTC5Ccm93c2VyLnRvdWNoKSB7XHJcblx0XHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdCAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wKVxyXG5cdFx0XHRcdCAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fZXhwYW5kLCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50Lm9uKGxpbmssICdmb2N1cycsIHRoaXMuX2V4cGFuZCwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly9Xb3JrIGFyb3VuZCBmb3IgRmlyZWZveCBhbmRyb2lkIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvaXNzdWVzLzIwMzNcclxuXHRcdFx0TC5Eb21FdmVudC5vbihmb3JtLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2V0VGltZW91dChMLmJpbmQodGhpcy5fb25JbnB1dENsaWNrLCB0aGlzKSwgMCk7XHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdFx0dGhpcy5fbWFwLm9uKCdjbGljaycsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcclxuXHRcdFx0Ly8gVE9ETyBrZXlib2FyZCBhY2Nlc3NpYmlsaXR5XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9leHBhbmQoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9iYXNlTGF5ZXJzTGlzdCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctYmFzZScsIGZvcm0pO1xyXG5cdFx0dGhpcy5fc2VwYXJhdG9yID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1zZXBhcmF0b3InLCBmb3JtKTtcclxuXHRcdHRoaXMuX292ZXJsYXlzTGlzdCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctb3ZlcmxheXMnLCBmb3JtKTtcclxuXHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XHJcblx0fSxcclxuXHJcblx0X2FkZExheWVyOiBmdW5jdGlvbiAobGF5ZXIsIG5hbWUsIG92ZXJsYXkpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdHRoaXMuX2xheWVyc1tpZF0gPSB7XHJcblx0XHRcdGxheWVyOiBsYXllcixcclxuXHRcdFx0bmFtZTogbmFtZSxcclxuXHRcdFx0b3ZlcmxheTogb3ZlcmxheVxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmF1dG9aSW5kZXggJiYgbGF5ZXIuc2V0WkluZGV4KSB7XHJcblx0XHRcdHRoaXMuX2xhc3RaSW5kZXgrKztcclxuXHRcdFx0bGF5ZXIuc2V0WkluZGV4KHRoaXMuX2xhc3RaSW5kZXgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9iYXNlTGF5ZXJzTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHRcdHRoaXMuX292ZXJsYXlzTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcblx0XHR2YXIgYmFzZUxheWVyc1ByZXNlbnQgPSBmYWxzZSxcclxuXHRcdCAgICBvdmVybGF5c1ByZXNlbnQgPSBmYWxzZSxcclxuXHRcdCAgICBpLCBvYmo7XHJcblxyXG5cdFx0Zm9yIChpIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRvYmogPSB0aGlzLl9sYXllcnNbaV07XHJcblx0XHRcdHRoaXMuX2FkZEl0ZW0ob2JqKTtcclxuXHRcdFx0b3ZlcmxheXNQcmVzZW50ID0gb3ZlcmxheXNQcmVzZW50IHx8IG9iai5vdmVybGF5O1xyXG5cdFx0XHRiYXNlTGF5ZXJzUHJlc2VudCA9IGJhc2VMYXllcnNQcmVzZW50IHx8ICFvYmoub3ZlcmxheTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9zZXBhcmF0b3Iuc3R5bGUuZGlzcGxheSA9IG92ZXJsYXlzUHJlc2VudCAmJiBiYXNlTGF5ZXJzUHJlc2VudCA/ICcnIDogJ25vbmUnO1xyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIG9iaiA9IHRoaXMuX2xheWVyc1tMLnN0YW1wKGUubGF5ZXIpXTtcclxuXHJcblx0XHRpZiAoIW9iaikgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX2hhbmRsaW5nQ2xpY2spIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHR5cGUgPSBvYmoub3ZlcmxheSA/XHJcblx0XHRcdChlLnR5cGUgPT09ICdsYXllcmFkZCcgPyAnb3ZlcmxheWFkZCcgOiAnb3ZlcmxheXJlbW92ZScpIDpcclxuXHRcdFx0KGUudHlwZSA9PT0gJ2xheWVyYWRkJyA/ICdiYXNlbGF5ZXJjaGFuZ2UnIDogbnVsbCk7XHJcblxyXG5cdFx0aWYgKHR5cGUpIHtcclxuXHRcdFx0dGhpcy5fbWFwLmZpcmUodHlwZSwgb2JqKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBJRTcgYnVncyBvdXQgaWYgeW91IGNyZWF0ZSBhIHJhZGlvIGR5bmFtaWNhbGx5LCBzbyB5b3UgaGF2ZSB0byBkbyBpdCB0aGlzIGhhY2t5IHdheSAoc2VlIGh0dHA6Ly9iaXQubHkvUHFZTEJlKVxyXG5cdF9jcmVhdGVSYWRpb0VsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBjaGVja2VkKSB7XHJcblxyXG5cdFx0dmFyIHJhZGlvSHRtbCA9ICc8aW5wdXQgdHlwZT1cInJhZGlvXCIgY2xhc3M9XCJsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLXNlbGVjdG9yXCIgbmFtZT1cIicgKyBuYW1lICsgJ1wiJztcclxuXHRcdGlmIChjaGVja2VkKSB7XHJcblx0XHRcdHJhZGlvSHRtbCArPSAnIGNoZWNrZWQ9XCJjaGVja2VkXCInO1xyXG5cdFx0fVxyXG5cdFx0cmFkaW9IdG1sICs9ICcvPic7XHJcblxyXG5cdFx0dmFyIHJhZGlvRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdHJhZGlvRnJhZ21lbnQuaW5uZXJIVE1MID0gcmFkaW9IdG1sO1xyXG5cclxuXHRcdHJldHVybiByYWRpb0ZyYWdtZW50LmZpcnN0Q2hpbGQ7XHJcblx0fSxcclxuXHJcblx0X2FkZEl0ZW06IGZ1bmN0aW9uIChvYmopIHtcclxuXHRcdHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyksXHJcblx0XHQgICAgaW5wdXQsXHJcblx0XHQgICAgY2hlY2tlZCA9IHRoaXMuX21hcC5oYXNMYXllcihvYmoubGF5ZXIpO1xyXG5cclxuXHRcdGlmIChvYmoub3ZlcmxheSkge1xyXG5cdFx0XHRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblx0XHRcdGlucHV0LnR5cGUgPSAnY2hlY2tib3gnO1xyXG5cdFx0XHRpbnB1dC5jbGFzc05hbWUgPSAnbGVhZmxldC1jb250cm9sLWxheWVycy1zZWxlY3Rvcic7XHJcblx0XHRcdGlucHV0LmRlZmF1bHRDaGVja2VkID0gY2hlY2tlZDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlucHV0ID0gdGhpcy5fY3JlYXRlUmFkaW9FbGVtZW50KCdsZWFmbGV0LWJhc2UtbGF5ZXJzJywgY2hlY2tlZCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aW5wdXQubGF5ZXJJZCA9IEwuc3RhbXAob2JqLmxheWVyKTtcclxuXHJcblx0XHRMLkRvbUV2ZW50Lm9uKGlucHV0LCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2ssIHRoaXMpO1xyXG5cclxuXHRcdHZhciBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cdFx0bmFtZS5pbm5lckhUTUwgPSAnICcgKyBvYmoubmFtZTtcclxuXHJcblx0XHRsYWJlbC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcblx0XHRsYWJlbC5hcHBlbmRDaGlsZChuYW1lKTtcclxuXHJcblx0XHR2YXIgY29udGFpbmVyID0gb2JqLm92ZXJsYXkgPyB0aGlzLl9vdmVybGF5c0xpc3QgOiB0aGlzLl9iYXNlTGF5ZXJzTGlzdDtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChsYWJlbCk7XHJcblxyXG5cdFx0cmV0dXJuIGxhYmVsO1xyXG5cdH0sXHJcblxyXG5cdF9vbklucHV0Q2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBpLCBpbnB1dCwgb2JqLFxyXG5cdFx0ICAgIGlucHV0cyA9IHRoaXMuX2Zvcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JyksXHJcblx0XHQgICAgaW5wdXRzTGVuID0gaW5wdXRzLmxlbmd0aDtcclxuXHJcblx0XHR0aGlzLl9oYW5kbGluZ0NsaWNrID0gdHJ1ZTtcclxuXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgaW5wdXRzTGVuOyBpKyspIHtcclxuXHRcdFx0aW5wdXQgPSBpbnB1dHNbaV07XHJcblx0XHRcdG9iaiA9IHRoaXMuX2xheWVyc1tpbnB1dC5sYXllcklkXTtcclxuXHJcblx0XHRcdGlmIChpbnB1dC5jaGVja2VkICYmICF0aGlzLl9tYXAuaGFzTGF5ZXIob2JqLmxheWVyKSkge1xyXG5cdFx0XHRcdHRoaXMuX21hcC5hZGRMYXllcihvYmoubGF5ZXIpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmICghaW5wdXQuY2hlY2tlZCAmJiB0aGlzLl9tYXAuaGFzTGF5ZXIob2JqLmxheWVyKSkge1xyXG5cdFx0XHRcdHRoaXMuX21hcC5yZW1vdmVMYXllcihvYmoubGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faGFuZGxpbmdDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuX3JlZm9jdXNPbk1hcCgpO1xyXG5cdH0sXHJcblxyXG5cdF9leHBhbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLWV4cGFuZGVkJyk7XHJcblx0fSxcclxuXHJcblx0X2NvbGxhcHNlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9jb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5fY29udGFpbmVyLmNsYXNzTmFtZS5yZXBsYWNlKCcgbGVhZmxldC1jb250cm9sLWxheWVycy1leHBhbmRlZCcsICcnKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sLmxheWVycyA9IGZ1bmN0aW9uIChiYXNlTGF5ZXJzLCBvdmVybGF5cywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Db250cm9sLkxheWVycyhiYXNlTGF5ZXJzLCBvdmVybGF5cywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxuICogTC5Qb3NBbmltYXRpb24gaXMgdXNlZCBieSBMZWFmbGV0IGludGVybmFsbHkgZm9yIHBhbiBhbmltYXRpb25zLlxuICovXG5cbkwuUG9zQW5pbWF0aW9uID0gTC5DbGFzcy5leHRlbmQoe1xuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXG5cblx0cnVuOiBmdW5jdGlvbiAoZWwsIG5ld1BvcywgZHVyYXRpb24sIGVhc2VMaW5lYXJpdHkpIHsgLy8gKEhUTUxFbGVtZW50LCBQb2ludFssIE51bWJlciwgTnVtYmVyXSlcblx0XHR0aGlzLnN0b3AoKTtcblxuXHRcdHRoaXMuX2VsID0gZWw7XG5cdFx0dGhpcy5faW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0dGhpcy5fbmV3UG9zID0gbmV3UG9zO1xuXG5cdFx0dGhpcy5maXJlKCdzdGFydCcpO1xuXG5cdFx0ZWwuc3R5bGVbTC5Eb21VdGlsLlRSQU5TSVRJT05dID0gJ2FsbCAnICsgKGR1cmF0aW9uIHx8IDAuMjUpICtcblx0XHQgICAgICAgICdzIGN1YmljLWJlemllcigwLDAsJyArIChlYXNlTGluZWFyaXR5IHx8IDAuNSkgKyAnLDEpJztcblxuXHRcdEwuRG9tRXZlbnQub24oZWwsIEwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCwgdGhpcy5fb25UcmFuc2l0aW9uRW5kLCB0aGlzKTtcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24oZWwsIG5ld1Bvcyk7XG5cblx0XHQvLyB0b2dnbGUgcmVmbG93LCBDaHJvbWUgZmxpY2tlcnMgZm9yIHNvbWUgcmVhc29uIGlmIHlvdSBkb24ndCBkbyB0aGlzXG5cdFx0TC5VdGlsLmZhbHNlRm4oZWwub2Zmc2V0V2lkdGgpO1xuXG5cdFx0Ly8gdGhlcmUncyBubyBuYXRpdmUgd2F5IHRvIHRyYWNrIHZhbHVlIHVwZGF0ZXMgb2YgdHJhbnNpdGlvbmVkIHByb3BlcnRpZXMsIHNvIHdlIGltaXRhdGUgdGhpc1xuXHRcdHRoaXMuX3N0ZXBUaW1lciA9IHNldEludGVydmFsKEwuYmluZCh0aGlzLl9vblN0ZXAsIHRoaXMpLCA1MCk7XG5cdH0sXG5cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5faW5Qcm9ncmVzcykgeyByZXR1cm47IH1cblxuXHRcdC8vIGlmIHdlIGp1c3QgcmVtb3ZlZCB0aGUgdHJhbnNpdGlvbiBwcm9wZXJ0eSwgdGhlIGVsZW1lbnQgd291bGQganVtcCB0byBpdHMgZmluYWwgcG9zaXRpb24sXG5cdFx0Ly8gc28gd2UgbmVlZCB0byBtYWtlIGl0IHN0YXkgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cblxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9lbCwgdGhpcy5fZ2V0UG9zKCkpO1xuXHRcdHRoaXMuX29uVHJhbnNpdGlvbkVuZCgpO1xuXHRcdEwuVXRpbC5mYWxzZUZuKHRoaXMuX2VsLm9mZnNldFdpZHRoKTsgLy8gZm9yY2UgcmVmbG93IGluIGNhc2Ugd2UgYXJlIGFib3V0IHRvIHN0YXJ0IGEgbmV3IGFuaW1hdGlvblxuXHR9LFxuXG5cdF9vblN0ZXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RlcFBvcyA9IHRoaXMuX2dldFBvcygpO1xuXHRcdGlmICghc3RlcFBvcykge1xuXHRcdFx0dGhpcy5fb25UcmFuc2l0aW9uRW5kKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXG5cdFx0Ly8gbWFrZSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24gcmV0dXJuIGludGVybWVkaWF0ZSBwb3NpdGlvbiB2YWx1ZSBkdXJpbmcgYW5pbWF0aW9uXG5cdFx0dGhpcy5fZWwuX2xlYWZsZXRfcG9zID0gc3RlcFBvcztcblxuXHRcdHRoaXMuZmlyZSgnc3RlcCcpO1xuXHR9LFxuXG5cdC8vIHlvdSBjYW4ndCBlYXNpbHkgZ2V0IGludGVybWVkaWF0ZSB2YWx1ZXMgb2YgcHJvcGVydGllcyBhbmltYXRlZCB3aXRoIENTUzMgVHJhbnNpdGlvbnMsXG5cdC8vIHdlIG5lZWQgdG8gcGFyc2UgY29tcHV0ZWQgc3R5bGUgKGluIGNhc2Ugb2YgdHJhbnNmb3JtIGl0IHJldHVybnMgbWF0cml4IHN0cmluZylcblxuXHRfdHJhbnNmb3JtUmU6IC8oWy0rXT8oPzpcXGQqXFwuKT9cXGQrKVxcRCosIChbLStdPyg/OlxcZCpcXC4pP1xcZCspXFxEKlxcKS8sXG5cblx0X2dldFBvczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBsZWZ0LCB0b3AsIG1hdGNoZXMsXG5cdFx0ICAgIGVsID0gdGhpcy5fZWwsXG5cdFx0ICAgIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG5cdFx0aWYgKEwuQnJvd3Nlci5hbnkzZCkge1xuXHRcdFx0bWF0Y2hlcyA9IHN0eWxlW0wuRG9tVXRpbC5UUkFOU0ZPUk1dLm1hdGNoKHRoaXMuX3RyYW5zZm9ybVJlKTtcblx0XHRcdGlmICghbWF0Y2hlcykgeyByZXR1cm47IH1cblx0XHRcdGxlZnQgPSBwYXJzZUZsb2F0KG1hdGNoZXNbMV0pO1xuXHRcdFx0dG9wICA9IHBhcnNlRmxvYXQobWF0Y2hlc1syXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxlZnQgPSBwYXJzZUZsb2F0KHN0eWxlLmxlZnQpO1xuXHRcdFx0dG9wICA9IHBhcnNlRmxvYXQoc3R5bGUudG9wKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGVmdCwgdG9wLCB0cnVlKTtcblx0fSxcblxuXHRfb25UcmFuc2l0aW9uRW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fZWwsIEwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCwgdGhpcy5fb25UcmFuc2l0aW9uRW5kLCB0aGlzKTtcblxuXHRcdGlmICghdGhpcy5faW5Qcm9ncmVzcykgeyByZXR1cm47IH1cblx0XHR0aGlzLl9pblByb2dyZXNzID0gZmFsc2U7XG5cblx0XHR0aGlzLl9lbC5zdHlsZVtMLkRvbVV0aWwuVFJBTlNJVElPTl0gPSAnJztcblxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXG5cdFx0Ly8gbWFrZSBzdXJlIEwuRG9tVXRpbC5nZXRQb3NpdGlvbiByZXR1cm5zIHRoZSBmaW5hbCBwb3NpdGlvbiB2YWx1ZSBhZnRlciBhbmltYXRpb25cblx0XHR0aGlzLl9lbC5fbGVhZmxldF9wb3MgPSB0aGlzLl9uZXdQb3M7XG5cblx0XHRjbGVhckludGVydmFsKHRoaXMuX3N0ZXBUaW1lcik7XG5cblx0XHR0aGlzLmZpcmUoJ3N0ZXAnKS5maXJlKCdlbmQnKTtcblx0fVxuXG59KTtcblxuXG4vKlxuICogRXh0ZW5kcyBMLk1hcCB0byBoYW5kbGUgcGFubmluZyBhbmltYXRpb25zLlxuICovXG5cbkwuTWFwLmluY2x1ZGUoe1xuXG5cdHNldFZpZXc6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9wdGlvbnMpIHtcblxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLl96b29tIDogdGhpcy5fbGltaXRab29tKHpvb20pO1xuXHRcdGNlbnRlciA9IHRoaXMuX2xpbWl0Q2VudGVyKEwubGF0TG5nKGNlbnRlciksIHpvb20sIHRoaXMub3B0aW9ucy5tYXhCb3VuZHMpO1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKHRoaXMuX3BhbkFuaW0pIHtcblx0XHRcdHRoaXMuX3BhbkFuaW0uc3RvcCgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9sb2FkZWQgJiYgIW9wdGlvbnMucmVzZXQgJiYgb3B0aW9ucyAhPT0gdHJ1ZSkge1xuXG5cdFx0XHRpZiAob3B0aW9ucy5hbmltYXRlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0b3B0aW9ucy56b29tID0gTC5leHRlbmQoe2FuaW1hdGU6IG9wdGlvbnMuYW5pbWF0ZX0sIG9wdGlvbnMuem9vbSk7XG5cdFx0XHRcdG9wdGlvbnMucGFuID0gTC5leHRlbmQoe2FuaW1hdGU6IG9wdGlvbnMuYW5pbWF0ZX0sIG9wdGlvbnMucGFuKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdHJ5IGFuaW1hdGluZyBwYW4gb3Igem9vbVxuXHRcdFx0dmFyIGFuaW1hdGVkID0gKHRoaXMuX3pvb20gIT09IHpvb20pID9cblx0XHRcdFx0dGhpcy5fdHJ5QW5pbWF0ZWRab29tICYmIHRoaXMuX3RyeUFuaW1hdGVkWm9vbShjZW50ZXIsIHpvb20sIG9wdGlvbnMuem9vbSkgOlxuXHRcdFx0XHR0aGlzLl90cnlBbmltYXRlZFBhbihjZW50ZXIsIG9wdGlvbnMucGFuKTtcblxuXHRcdFx0aWYgKGFuaW1hdGVkKSB7XG5cdFx0XHRcdC8vIHByZXZlbnQgcmVzaXplIGhhbmRsZXIgY2FsbCwgdGhlIHZpZXcgd2lsbCByZWZyZXNoIGFmdGVyIGFuaW1hdGlvbiBhbnl3YXlcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NpemVUaW1lcik7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFuaW1hdGlvbiBkaWRuJ3Qgc3RhcnQsIGp1c3QgcmVzZXQgdGhlIG1hcCB2aWV3XG5cdFx0dGhpcy5fcmVzZXRWaWV3KGNlbnRlciwgem9vbSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRwYW5CeTogZnVuY3Rpb24gKG9mZnNldCwgb3B0aW9ucykge1xuXHRcdG9mZnNldCA9IEwucG9pbnQob2Zmc2V0KS5yb3VuZCgpO1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKCFvZmZzZXQueCAmJiAhb2Zmc2V0LnkpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fcGFuQW5pbSkge1xuXHRcdFx0dGhpcy5fcGFuQW5pbSA9IG5ldyBMLlBvc0FuaW1hdGlvbigpO1xuXG5cdFx0XHR0aGlzLl9wYW5BbmltLm9uKHtcblx0XHRcdFx0J3N0ZXAnOiB0aGlzLl9vblBhblRyYW5zaXRpb25TdGVwLFxuXHRcdFx0XHQnZW5kJzogdGhpcy5fb25QYW5UcmFuc2l0aW9uRW5kXG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9XG5cblx0XHQvLyBkb24ndCBmaXJlIG1vdmVzdGFydCBpZiBhbmltYXRpbmcgaW5lcnRpYVxuXHRcdGlmICghb3B0aW9ucy5ub01vdmVTdGFydCkge1xuXHRcdFx0dGhpcy5maXJlKCdtb3Zlc3RhcnQnKTtcblx0XHR9XG5cblx0XHQvLyBhbmltYXRlIHBhbiB1bmxlc3MgYW5pbWF0ZTogZmFsc2Ugc3BlY2lmaWVkXG5cdFx0aWYgKG9wdGlvbnMuYW5pbWF0ZSAhPT0gZmFsc2UpIHtcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9tYXBQYW5lLCAnbGVhZmxldC1wYW4tYW5pbScpO1xuXG5cdFx0XHR2YXIgbmV3UG9zID0gdGhpcy5fZ2V0TWFwUGFuZVBvcygpLnN1YnRyYWN0KG9mZnNldCk7XG5cdFx0XHR0aGlzLl9wYW5BbmltLnJ1bih0aGlzLl9tYXBQYW5lLCBuZXdQb3MsIG9wdGlvbnMuZHVyYXRpb24gfHwgMC4yNSwgb3B0aW9ucy5lYXNlTGluZWFyaXR5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fcmF3UGFuQnkob2Zmc2V0KTtcblx0XHRcdHRoaXMuZmlyZSgnbW92ZScpLmZpcmUoJ21vdmVlbmQnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfb25QYW5UcmFuc2l0aW9uU3RlcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZmlyZSgnbW92ZScpO1xuXHR9LFxuXG5cdF9vblBhblRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fbWFwUGFuZSwgJ2xlYWZsZXQtcGFuLWFuaW0nKTtcblx0XHR0aGlzLmZpcmUoJ21vdmVlbmQnKTtcblx0fSxcblxuXHRfdHJ5QW5pbWF0ZWRQYW46IGZ1bmN0aW9uIChjZW50ZXIsIG9wdGlvbnMpIHtcblx0XHQvLyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG5ldyBhbmQgY3VycmVudCBjZW50ZXJzIGluIHBpeGVsc1xuXHRcdHZhciBvZmZzZXQgPSB0aGlzLl9nZXRDZW50ZXJPZmZzZXQoY2VudGVyKS5fZmxvb3IoKTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgdG9vIGZhciB1bmxlc3MgYW5pbWF0ZTogdHJ1ZSBzcGVjaWZpZWQgaW4gb3B0aW9uc1xuXHRcdGlmICgob3B0aW9ucyAmJiBvcHRpb25zLmFuaW1hdGUpICE9PSB0cnVlICYmICF0aGlzLmdldFNpemUoKS5jb250YWlucyhvZmZzZXQpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0dGhpcy5wYW5CeShvZmZzZXQsIG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBMLlBvc0FuaW1hdGlvbiBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiB0aGF0IHBvd2VycyBMZWFmbGV0IHBhbiBhbmltYXRpb25zXG4gKiBpbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgQ1NTMyBUcmFuc2l0aW9ucy5cbiAqL1xuXG5MLlBvc0FuaW1hdGlvbiA9IEwuRG9tVXRpbC5UUkFOU0lUSU9OID8gTC5Qb3NBbmltYXRpb24gOiBMLlBvc0FuaW1hdGlvbi5leHRlbmQoe1xuXG5cdHJ1bjogZnVuY3Rpb24gKGVsLCBuZXdQb3MsIGR1cmF0aW9uLCBlYXNlTGluZWFyaXR5KSB7IC8vIChIVE1MRWxlbWVudCwgUG9pbnRbLCBOdW1iZXIsIE51bWJlcl0pXG5cdFx0dGhpcy5zdG9wKCk7XG5cblx0XHR0aGlzLl9lbCA9IGVsO1xuXHRcdHRoaXMuX2luUHJvZ3Jlc3MgPSB0cnVlO1xuXHRcdHRoaXMuX2R1cmF0aW9uID0gZHVyYXRpb24gfHwgMC4yNTtcblx0XHR0aGlzLl9lYXNlT3V0UG93ZXIgPSAxIC8gTWF0aC5tYXgoZWFzZUxpbmVhcml0eSB8fCAwLjUsIDAuMik7XG5cblx0XHR0aGlzLl9zdGFydFBvcyA9IEwuRG9tVXRpbC5nZXRQb3NpdGlvbihlbCk7XG5cdFx0dGhpcy5fb2Zmc2V0ID0gbmV3UG9zLnN1YnRyYWN0KHRoaXMuX3N0YXJ0UG9zKTtcblx0XHR0aGlzLl9zdGFydFRpbWUgPSArbmV3IERhdGUoKTtcblxuXHRcdHRoaXMuZmlyZSgnc3RhcnQnKTtcblxuXHRcdHRoaXMuX2FuaW1hdGUoKTtcblx0fSxcblxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9pblByb2dyZXNzKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy5fc3RlcCgpO1xuXHRcdHRoaXMuX2NvbXBsZXRlKCk7XG5cdH0sXG5cblx0X2FuaW1hdGU6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBhbmltYXRpb24gbG9vcFxuXHRcdHRoaXMuX2FuaW1JZCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKHRoaXMuX2FuaW1hdGUsIHRoaXMpO1xuXHRcdHRoaXMuX3N0ZXAoKTtcblx0fSxcblxuXHRfc3RlcDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlbGFwc2VkID0gKCtuZXcgRGF0ZSgpKSAtIHRoaXMuX3N0YXJ0VGltZSxcblx0XHQgICAgZHVyYXRpb24gPSB0aGlzLl9kdXJhdGlvbiAqIDEwMDA7XG5cblx0XHRpZiAoZWxhcHNlZCA8IGR1cmF0aW9uKSB7XG5cdFx0XHR0aGlzLl9ydW5GcmFtZSh0aGlzLl9lYXNlT3V0KGVsYXBzZWQgLyBkdXJhdGlvbikpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9ydW5GcmFtZSgxKTtcblx0XHRcdHRoaXMuX2NvbXBsZXRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9ydW5GcmFtZTogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIHBvcyA9IHRoaXMuX3N0YXJ0UG9zLmFkZCh0aGlzLl9vZmZzZXQubXVsdGlwbHlCeShwcm9ncmVzcykpO1xuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9lbCwgcG9zKTtcblxuXHRcdHRoaXMuZmlyZSgnc3RlcCcpO1xuXHR9LFxuXG5cdF9jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuXHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fYW5pbUlkKTtcblxuXHRcdHRoaXMuX2luUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHR0aGlzLmZpcmUoJ2VuZCcpO1xuXHR9LFxuXG5cdF9lYXNlT3V0OiBmdW5jdGlvbiAodCkge1xuXHRcdHJldHVybiAxIC0gTWF0aC5wb3coMSAtIHQsIHRoaXMuX2Vhc2VPdXRQb3dlcik7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBFeHRlbmRzIEwuTWFwIHRvIGhhbmRsZSB6b29tIGFuaW1hdGlvbnMuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0em9vbUFuaW1hdGlvbjogdHJ1ZSxcblx0em9vbUFuaW1hdGlvblRocmVzaG9sZDogNFxufSk7XG5cbmlmIChMLkRvbVV0aWwuVFJBTlNJVElPTikge1xuXG5cdEwuTWFwLmFkZEluaXRIb29rKGZ1bmN0aW9uICgpIHtcblx0XHQvLyBkb24ndCBhbmltYXRlIG9uIGJyb3dzZXJzIHdpdGhvdXQgaGFyZHdhcmUtYWNjZWxlcmF0ZWQgdHJhbnNpdGlvbnMgb3Igb2xkIEFuZHJvaWQvT3BlcmFcblx0XHR0aGlzLl96b29tQW5pbWF0ZWQgPSB0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvbiAmJiBMLkRvbVV0aWwuVFJBTlNJVElPTiAmJlxuXHRcdFx0XHRMLkJyb3dzZXIuYW55M2QgJiYgIUwuQnJvd3Nlci5hbmRyb2lkMjMgJiYgIUwuQnJvd3Nlci5tb2JpbGVPcGVyYTtcblxuXHRcdC8vIHpvb20gdHJhbnNpdGlvbnMgcnVuIHdpdGggdGhlIHNhbWUgZHVyYXRpb24gZm9yIGFsbCBsYXllcnMsIHNvIGlmIG9uZSBvZiB0cmFuc2l0aW9uZW5kIGV2ZW50c1xuXHRcdC8vIGhhcHBlbnMgYWZ0ZXIgc3RhcnRpbmcgem9vbSBhbmltYXRpb24gKHByb3BhZ2F0aW5nIHRvIHRoZSBtYXAgcGFuZSksIHdlIGtub3cgdGhhdCBpdCBlbmRlZCBnbG9iYWxseVxuXHRcdGlmICh0aGlzLl96b29tQW5pbWF0ZWQpIHtcblx0XHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwUGFuZSwgTC5Eb21VdGlsLlRSQU5TSVRJT05fRU5ELCB0aGlzLl9jYXRjaFRyYW5zaXRpb25FbmQsIHRoaXMpO1xuXHRcdH1cblx0fSk7XG59XG5cbkwuTWFwLmluY2x1ZGUoIUwuRG9tVXRpbC5UUkFOU0lUSU9OID8ge30gOiB7XG5cblx0X2NhdGNoVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAodGhpcy5fYW5pbWF0aW5nWm9vbSAmJiBlLnByb3BlcnR5TmFtZS5pbmRleE9mKCd0cmFuc2Zvcm0nKSA+PSAwKSB7XG5cdFx0XHR0aGlzLl9vblpvb21UcmFuc2l0aW9uRW5kKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9ub3RoaW5nVG9BbmltYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICF0aGlzLl9jb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGVhZmxldC16b29tLWFuaW1hdGVkJykubGVuZ3RoO1xuXHR9LFxuXG5cdF90cnlBbmltYXRlZFpvb206IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9wdGlvbnMpIHtcblxuXHRcdGlmICh0aGlzLl9hbmltYXRpbmdab29tKSB7IHJldHVybiB0cnVlOyB9XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgaWYgZGlzYWJsZWQsIG5vdCBzdXBwb3J0ZWQgb3Igem9vbSBkaWZmZXJlbmNlIGlzIHRvbyBsYXJnZVxuXHRcdGlmICghdGhpcy5fem9vbUFuaW1hdGVkIHx8IG9wdGlvbnMuYW5pbWF0ZSA9PT0gZmFsc2UgfHwgdGhpcy5fbm90aGluZ1RvQW5pbWF0ZSgpIHx8XG5cdFx0ICAgICAgICBNYXRoLmFicyh6b29tIC0gdGhpcy5fem9vbSkgPiB0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvblRocmVzaG9sZCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdC8vIG9mZnNldCBpcyB0aGUgcGl4ZWwgY29vcmRzIG9mIHRoZSB6b29tIG9yaWdpbiByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBjZW50ZXJcblx0XHR2YXIgc2NhbGUgPSB0aGlzLmdldFpvb21TY2FsZSh6b29tKSxcblx0XHQgICAgb2Zmc2V0ID0gdGhpcy5fZ2V0Q2VudGVyT2Zmc2V0KGNlbnRlcikuX2RpdmlkZUJ5KDEgLSAxIC8gc2NhbGUpLFxuXHRcdFx0b3JpZ2luID0gdGhpcy5fZ2V0Q2VudGVyTGF5ZXJQb2ludCgpLl9hZGQob2Zmc2V0KTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgaWYgdGhlIHpvb20gb3JpZ2luIGlzbid0IHdpdGhpbiBvbmUgc2NyZWVuIGZyb20gdGhlIGN1cnJlbnQgY2VudGVyLCB1bmxlc3MgZm9yY2VkXG5cdFx0aWYgKG9wdGlvbnMuYW5pbWF0ZSAhPT0gdHJ1ZSAmJiAhdGhpcy5nZXRTaXplKCkuY29udGFpbnMob2Zmc2V0KSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdHRoaXNcblx0XHQgICAgLmZpcmUoJ21vdmVzdGFydCcpXG5cdFx0ICAgIC5maXJlKCd6b29tc3RhcnQnKTtcblxuXHRcdHRoaXMuX2FuaW1hdGVab29tKGNlbnRlciwgem9vbSwgb3JpZ2luLCBzY2FsZSwgbnVsbCwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRfYW5pbWF0ZVpvb206IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9yaWdpbiwgc2NhbGUsIGRlbHRhLCBiYWNrd2FyZHMsIGZvclRvdWNoWm9vbSkge1xuXG5cdFx0aWYgKCFmb3JUb3VjaFpvb20pIHtcblx0XHRcdHRoaXMuX2FuaW1hdGluZ1pvb20gPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIHB1dCB0cmFuc2Zvcm0gdHJhbnNpdGlvbiBvbiBhbGwgbGF5ZXJzIHdpdGggbGVhZmxldC16b29tLWFuaW1hdGVkIGNsYXNzXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX21hcFBhbmUsICdsZWFmbGV0LXpvb20tYW5pbScpO1xuXG5cdFx0Ly8gcmVtZW1iZXIgd2hhdCBjZW50ZXIvem9vbSB0byBzZXQgYWZ0ZXIgYW5pbWF0aW9uXG5cdFx0dGhpcy5fYW5pbWF0ZVRvQ2VudGVyID0gY2VudGVyO1xuXHRcdHRoaXMuX2FuaW1hdGVUb1pvb20gPSB6b29tO1xuXG5cdFx0Ly8gZGlzYWJsZSBhbnkgZHJhZ2dpbmcgZHVyaW5nIGFuaW1hdGlvblxuXHRcdGlmIChMLkRyYWdnYWJsZSkge1xuXHRcdFx0TC5EcmFnZ2FibGUuX2Rpc2FibGVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRMLlV0aWwucmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLmZpcmUoJ3pvb21hbmltJywge1xuXHRcdFx0XHRjZW50ZXI6IGNlbnRlcixcblx0XHRcdFx0em9vbTogem9vbSxcblx0XHRcdFx0b3JpZ2luOiBvcmlnaW4sXG5cdFx0XHRcdHNjYWxlOiBzY2FsZSxcblx0XHRcdFx0ZGVsdGE6IGRlbHRhLFxuXHRcdFx0XHRiYWNrd2FyZHM6IGJhY2t3YXJkc1xuXHRcdFx0fSk7XG5cdFx0fSwgdGhpcyk7XG5cdH0sXG5cblx0X29uWm9vbVRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHRoaXMuX2FuaW1hdGluZ1pvb20gPSBmYWxzZTtcblxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9tYXBQYW5lLCAnbGVhZmxldC16b29tLWFuaW0nKTtcblxuXHRcdHRoaXMuX3Jlc2V0Vmlldyh0aGlzLl9hbmltYXRlVG9DZW50ZXIsIHRoaXMuX2FuaW1hdGVUb1pvb20sIHRydWUsIHRydWUpO1xuXG5cdFx0aWYgKEwuRHJhZ2dhYmxlKSB7XG5cdFx0XHRMLkRyYWdnYWJsZS5fZGlzYWJsZWQgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn0pO1xuXG5cbi8qXG5cdFpvb20gYW5pbWF0aW9uIGxvZ2ljIGZvciBMLlRpbGVMYXllci5cbiovXG5cbkwuVGlsZUxheWVyLmluY2x1ZGUoe1xuXHRfYW5pbWF0ZVpvb206IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCF0aGlzLl9hbmltYXRpbmcpIHtcblx0XHRcdHRoaXMuX2FuaW1hdGluZyA9IHRydWU7XG5cdFx0XHR0aGlzLl9wcmVwYXJlQmdCdWZmZXIoKTtcblx0XHR9XG5cblx0XHR2YXIgYmcgPSB0aGlzLl9iZ0J1ZmZlcixcblx0XHQgICAgdHJhbnNmb3JtID0gTC5Eb21VdGlsLlRSQU5TRk9STSxcblx0XHQgICAgaW5pdGlhbFRyYW5zZm9ybSA9IGUuZGVsdGEgPyBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKGUuZGVsdGEpIDogYmcuc3R5bGVbdHJhbnNmb3JtXSxcblx0XHQgICAgc2NhbGVTdHIgPSBMLkRvbVV0aWwuZ2V0U2NhbGVTdHJpbmcoZS5zY2FsZSwgZS5vcmlnaW4pO1xuXG5cdFx0Ymcuc3R5bGVbdHJhbnNmb3JtXSA9IGUuYmFja3dhcmRzID9cblx0XHRcdFx0c2NhbGVTdHIgKyAnICcgKyBpbml0aWFsVHJhbnNmb3JtIDpcblx0XHRcdFx0aW5pdGlhbFRyYW5zZm9ybSArICcgJyArIHNjYWxlU3RyO1xuXHR9LFxuXG5cdF9lbmRab29tQW5pbTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBmcm9udCA9IHRoaXMuX3RpbGVDb250YWluZXIsXG5cdFx0ICAgIGJnID0gdGhpcy5fYmdCdWZmZXI7XG5cblx0XHRmcm9udC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cdFx0ZnJvbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChmcm9udCk7IC8vIEJyaW5nIHRvIGZvcmVcblxuXHRcdC8vIGZvcmNlIHJlZmxvd1xuXHRcdEwuVXRpbC5mYWxzZUZuKGJnLm9mZnNldFdpZHRoKTtcblxuXHRcdHRoaXMuX2FuaW1hdGluZyA9IGZhbHNlO1xuXHR9LFxuXG5cdF9jbGVhckJnQnVmZmVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmIChtYXAgJiYgIW1hcC5fYW5pbWF0aW5nWm9vbSAmJiAhbWFwLnRvdWNoWm9vbS5fem9vbWluZykge1xuXHRcdFx0dGhpcy5fYmdCdWZmZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR0aGlzLl9iZ0J1ZmZlci5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9ICcnO1xuXHRcdH1cblx0fSxcblxuXHRfcHJlcGFyZUJnQnVmZmVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZnJvbnQgPSB0aGlzLl90aWxlQ29udGFpbmVyLFxuXHRcdCAgICBiZyA9IHRoaXMuX2JnQnVmZmVyO1xuXG5cdFx0Ly8gaWYgZm9yZWdyb3VuZCBsYXllciBkb2Vzbid0IGhhdmUgbWFueSB0aWxlcyBidXQgYmcgbGF5ZXIgZG9lcyxcblx0XHQvLyBrZWVwIHRoZSBleGlzdGluZyBiZyBsYXllciBhbmQganVzdCB6b29tIGl0IHNvbWUgbW9yZVxuXG5cdFx0dmFyIGJnTG9hZGVkID0gdGhpcy5fZ2V0TG9hZGVkVGlsZXNQZXJjZW50YWdlKGJnKSxcblx0XHQgICAgZnJvbnRMb2FkZWQgPSB0aGlzLl9nZXRMb2FkZWRUaWxlc1BlcmNlbnRhZ2UoZnJvbnQpO1xuXG5cdFx0aWYgKGJnICYmIGJnTG9hZGVkID4gMC41ICYmIGZyb250TG9hZGVkIDwgMC41KSB7XG5cblx0XHRcdGZyb250LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdHRoaXMuX3N0b3BMb2FkaW5nSW1hZ2VzKGZyb250KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBwcmVwYXJlIHRoZSBidWZmZXIgdG8gYmVjb21lIHRoZSBmcm9udCB0aWxlIHBhbmVcblx0XHRiZy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cdFx0Ymcuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPSAnJztcblxuXHRcdC8vIHN3aXRjaCBvdXQgdGhlIGN1cnJlbnQgbGF5ZXIgdG8gYmUgdGhlIG5ldyBiZyBsYXllciAoYW5kIHZpY2UtdmVyc2EpXG5cdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IGJnO1xuXHRcdGJnID0gdGhpcy5fYmdCdWZmZXIgPSBmcm9udDtcblxuXHRcdHRoaXMuX3N0b3BMb2FkaW5nSW1hZ2VzKGJnKTtcblxuXHRcdC8vcHJldmVudCBiZyBidWZmZXIgZnJvbSBjbGVhcmluZyByaWdodCBhZnRlciB6b29tXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2NsZWFyQmdCdWZmZXJUaW1lcik7XG5cdH0sXG5cblx0X2dldExvYWRlZFRpbGVzUGVyY2VudGFnZTogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuXHRcdHZhciB0aWxlcyA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyksXG5cdFx0ICAgIGksIGxlbiwgY291bnQgPSAwO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGlmICh0aWxlc1tpXS5jb21wbGV0ZSkge1xuXHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY291bnQgLyBsZW47XG5cdH0sXG5cblx0Ly8gc3RvcHMgbG9hZGluZyBhbGwgdGlsZXMgaW4gdGhlIGJhY2tncm91bmQgbGF5ZXJcblx0X3N0b3BMb2FkaW5nSW1hZ2VzOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG5cdFx0dmFyIHRpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSksXG5cdFx0ICAgIGksIGxlbiwgdGlsZTtcblxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHR0aWxlID0gdGlsZXNbaV07XG5cblx0XHRcdGlmICghdGlsZS5jb21wbGV0ZSkge1xuXHRcdFx0XHR0aWxlLm9ubG9hZCA9IEwuVXRpbC5mYWxzZUZuO1xuXHRcdFx0XHR0aWxlLm9uZXJyb3IgPSBMLlV0aWwuZmFsc2VGbjtcblx0XHRcdFx0dGlsZS5zcmMgPSBMLlV0aWwuZW1wdHlJbWFnZVVybDtcblxuXHRcdFx0XHR0aWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGlsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBQcm92aWRlcyBMLk1hcCB3aXRoIGNvbnZlbmllbnQgc2hvcnRjdXRzIGZvciB1c2luZyBicm93c2VyIGdlb2xvY2F0aW9uIGZlYXR1cmVzLlxyXG4gKi9cclxuXHJcbkwuTWFwLmluY2x1ZGUoe1xyXG5cdF9kZWZhdWx0TG9jYXRlT3B0aW9uczoge1xyXG5cdFx0d2F0Y2g6IGZhbHNlLFxyXG5cdFx0c2V0VmlldzogZmFsc2UsXHJcblx0XHRtYXhab29tOiBJbmZpbml0eSxcclxuXHRcdHRpbWVvdXQ6IDEwMDAwLFxyXG5cdFx0bWF4aW11bUFnZTogMCxcclxuXHRcdGVuYWJsZUhpZ2hBY2N1cmFjeTogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRsb2NhdGU6IGZ1bmN0aW9uICgvKk9iamVjdCovIG9wdGlvbnMpIHtcclxuXHJcblx0XHRvcHRpb25zID0gdGhpcy5fbG9jYXRlT3B0aW9ucyA9IEwuZXh0ZW5kKHRoaXMuX2RlZmF1bHRMb2NhdGVPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHRpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHR0aGlzLl9oYW5kbGVHZW9sb2NhdGlvbkVycm9yKHtcclxuXHRcdFx0XHRjb2RlOiAwLFxyXG5cdFx0XHRcdG1lc3NhZ2U6ICdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLidcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBvblJlc3BvbnNlID0gTC5iaW5kKHRoaXMuX2hhbmRsZUdlb2xvY2F0aW9uUmVzcG9uc2UsIHRoaXMpLFxyXG5cdFx0XHRvbkVycm9yID0gTC5iaW5kKHRoaXMuX2hhbmRsZUdlb2xvY2F0aW9uRXJyb3IsIHRoaXMpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLndhdGNoKSB7XHJcblx0XHRcdHRoaXMuX2xvY2F0aW9uV2F0Y2hJZCA9XHJcblx0XHRcdCAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLndhdGNoUG9zaXRpb24ob25SZXNwb25zZSwgb25FcnJvciwgb3B0aW9ucyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKG9uUmVzcG9uc2UsIG9uRXJyb3IsIG9wdGlvbnMpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c3RvcExvY2F0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKG5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHRuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh0aGlzLl9sb2NhdGlvbldhdGNoSWQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuX2xvY2F0ZU9wdGlvbnMpIHtcclxuXHRcdFx0dGhpcy5fbG9jYXRlT3B0aW9ucy5zZXRWaWV3ID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfaGFuZGxlR2VvbG9jYXRpb25FcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XHJcblx0XHR2YXIgYyA9IGVycm9yLmNvZGUsXHJcblx0XHQgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHxcclxuXHRcdCAgICAgICAgICAgIChjID09PSAxID8gJ3Blcm1pc3Npb24gZGVuaWVkJyA6XHJcblx0XHQgICAgICAgICAgICAoYyA9PT0gMiA/ICdwb3NpdGlvbiB1bmF2YWlsYWJsZScgOiAndGltZW91dCcpKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbG9jYXRlT3B0aW9ucy5zZXRWaWV3ICYmICF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5maXRXb3JsZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbG9jYXRpb25lcnJvcicsIHtcclxuXHRcdFx0Y29kZTogYyxcclxuXHRcdFx0bWVzc2FnZTogJ0dlb2xvY2F0aW9uIGVycm9yOiAnICsgbWVzc2FnZSArICcuJ1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X2hhbmRsZUdlb2xvY2F0aW9uUmVzcG9uc2U6IGZ1bmN0aW9uIChwb3MpIHtcclxuXHRcdHZhciBsYXQgPSBwb3MuY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0ICAgIGxuZyA9IHBvcy5jb29yZHMubG9uZ2l0dWRlLFxyXG5cdFx0ICAgIGxhdGxuZyA9IG5ldyBMLkxhdExuZyhsYXQsIGxuZyksXHJcblxyXG5cdFx0ICAgIGxhdEFjY3VyYWN5ID0gMTgwICogcG9zLmNvb3Jkcy5hY2N1cmFjeSAvIDQwMDc1MDE3LFxyXG5cdFx0ICAgIGxuZ0FjY3VyYWN5ID0gbGF0QWNjdXJhY3kgLyBNYXRoLmNvcyhMLkxhdExuZy5ERUdfVE9fUkFEICogbGF0KSxcclxuXHJcblx0XHQgICAgYm91bmRzID0gTC5sYXRMbmdCb3VuZHMoXHJcblx0XHQgICAgICAgICAgICBbbGF0IC0gbGF0QWNjdXJhY3ksIGxuZyAtIGxuZ0FjY3VyYWN5XSxcclxuXHRcdCAgICAgICAgICAgIFtsYXQgKyBsYXRBY2N1cmFjeSwgbG5nICsgbG5nQWNjdXJhY3ldKSxcclxuXHJcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMuX2xvY2F0ZU9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc2V0Vmlldykge1xyXG5cdFx0XHR2YXIgem9vbSA9IE1hdGgubWluKHRoaXMuZ2V0Qm91bmRzWm9vbShib3VuZHMpLCBvcHRpb25zLm1heFpvb20pO1xyXG5cdFx0XHR0aGlzLnNldFZpZXcobGF0bG5nLCB6b29tKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0bGF0bG5nOiBsYXRsbmcsXHJcblx0XHRcdGJvdW5kczogYm91bmRzLFxyXG5cdFx0XHR0aW1lc3RhbXA6IHBvcy50aW1lc3RhbXBcclxuXHRcdH07XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiBwb3MuY29vcmRzKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgcG9zLmNvb3Jkc1tpXSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0XHRkYXRhW2ldID0gcG9zLmNvb3Jkc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbG9jYXRpb25mb3VuZCcsIGRhdGEpO1xyXG5cdH1cclxufSk7XHJcblxuXG59KHdpbmRvdywgZG9jdW1lbnQpKTsiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjcuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNy4wJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUNhbGxiYWNrID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgICBzd2l0Y2ggKGFyZ0NvdW50ID09IG51bGwgPyAzIDogYXJnQ291bnQpIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBvdGhlcik7XG4gICAgICB9O1xuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQSBtb3N0bHktaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWRcbiAgLy8gdG8gZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyXG4gIC8vIGlkZW50aXR5LCBhbiBhcmJpdHJhcnkgY2FsbGJhY2ssIGEgcHJvcGVydHkgbWF0Y2hlciwgb3IgYSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAgXy5pdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIGNyZWF0ZUNhbGxiYWNrKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVzKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBpLCBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPT09ICtsZW5ndGgpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudC5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gW107XG4gICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCksXG4gICAgICAgIGN1cnJlbnRLZXk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gMCwgY3VycmVudEtleTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgIGlmICghbGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXgrK10gOiBpbmRleCsrXTtcbiAgICB9XG4gICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCA0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICsgb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgaW5kZXggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgY3VycmVudEtleTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgIGlmICghaW5kZXgpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1stLWluZGV4XSA6IC0taW5kZXhdO1xuICAgIH1cbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5zb21lKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoXy5pdGVyYXRlZShwcmVkaWNhdGUpKSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGluZGV4LCBjdXJyZW50S2V5O1xuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKCFwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCwgY3VycmVudEtleTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgdGFyZ2V0KSA+PSAwO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IEluZmluaXR5ICYmIHJlc3VsdCA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhIGNvbGxlY3Rpb24sIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgc2V0ID0gb2JqICYmIG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0gc2V0Lmxlbmd0aDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgcmFuZDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICBpZiAocmFuZCAhPT0gaW5kZXgpIHNodWZmbGVkW2luZGV4XSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBzZXRbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0ZWUuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIHZhbHVlLCBrZXkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldKys7IGVsc2UgcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gbG93ICsgaGlnaCA+Pj4gMTtcbiAgICAgIGlmIChpdGVyYXRlZShhcnJheVttaWRdKSA8IHZhbHVlKSBsb3cgPSBtaWQgKyAxOyBlbHNlIGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBTcGxpdCBhIGNvbGxlY3Rpb24gaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7XG4gICAgICAocHJlZGljYXRlKHZhbHVlLCBrZXksIG9iaikgPyBwYXNzIDogZmFpbCkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gaW5wdXQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpICYmICFfLmlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICBpZiAoIXN0cmljdCkgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzaGFsbG93KSB7XG4gICAgICAgIHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QsIG91dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSwgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcnJheVtpXTtcbiAgICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgICBpZiAoIWkgfHwgc2VlbiAhPT0gdmFsdWUpIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgc2VlbiA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChpdGVyYXRlZSkge1xuICAgICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpO1xuICAgICAgICBpZiAoXy5pbmRleE9mKHNlZW4sIGNvbXB1dGVkKSA8IDApIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChfLmluZGV4T2YocmVzdWx0LCB2YWx1ZSkgPCAwKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCBbXSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICBpZiAoXy5jb250YWlucyhyZXN1bHQsIGl0ZW0pKSBjb250aW51ZTtcbiAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBmbGF0dGVuKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgdHJ1ZSwgdHJ1ZSwgW10pO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoYXJndW1lbnRzLCAnbGVuZ3RoJykubGVuZ3RoO1xuICAgIHZhciByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gXy5wbHVjayhhcmd1bWVudHMsIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpbiBhbiBhcnJheSxcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSBpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpZHggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBmcm9tID09ICdudW1iZXInKSB7XG4gICAgICBpZHggPSBmcm9tIDwgMCA/IGlkeCArIGZyb20gKyAxIDogTWF0aC5taW4oaWR4LCBmcm9tICsgMSk7XG4gICAgfVxuICAgIHdoaWxlICgtLWlkeCA+PSAwKSBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgaWR4KyssIHN0YXJ0ICs9IHN0ZXApIHtcbiAgICAgIHJhbmdlW2lkeF0gPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBDdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgQ3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IEN0b3I7XG4gICAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCwga2V5O1xuICAgIGlmIChsZW5ndGggPD0gMSkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBhcmd1bWVudHNbaV07XG4gICAgICBvYmpba2V5XSA9IF8uYmluZChvYmpba2V5XSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXk7XG4gICAgICBpZiAoIV8uaGFzKGNhY2hlLCBhZGRyZXNzKSkgY2FjaGVbYWRkcmVzc10gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY2FjaGVbYWRkcmVzc107XG4gICAgfTtcbiAgICBtZW1vaXplLmNhY2hlID0ge307XG4gICAgcmV0dXJuIG1lbW9pemU7XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPiAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmJlZm9yZSA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBwcm9wKSkge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fSwga2V5O1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShbXSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgIG9iaiA9IG5ldyBPYmplY3Qob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgIGlmIChrZXkgaW4gb2JqKSByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLm1hcChjb25jYXQuYXBwbHkoW10sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSksIFN0cmluZyk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKGtleXMsIGtleSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gXy5waWNrKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKG9ialtwcm9wXSA9PT0gdm9pZCAwKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9PSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvZXJjZWQgdG8gc3RyaW5ncyBmb3IgY29tcGFyaXNvbiAoTm90ZTogJycgKyAvYS9pID09PSAnL2EvaScpXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiAnJyArIGEgPT09ICcnICsgYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgICAgIC8vIE9iamVjdChOYU4pIGlzIGVxdWl2YWxlbnQgdG8gTmFOXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoXG4gICAgICBhQ3RvciAhPT0gYkN0b3IgJiZcbiAgICAgIC8vIEhhbmRsZSBPYmplY3QuY3JlYXRlKHgpIGNhc2VzXG4gICAgICAnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiICYmXG4gICAgICAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSwgcmVzdWx0O1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKGEpLCBrZXk7XG4gICAgICBzaXplID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICByZXN1bHQgPSBfLmtleXMoYikubGVuZ3RoID09PSBzaXplO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgICAga2V5ID0ga2V5c1tzaXplXTtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBfLmVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBhbiBJRSAxMSBidWcuXG4gIGlmICh0eXBlb2YgLy4vICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgdmFyIHBhaXJzID0gXy5wYWlycyhhdHRycyksIGxlbmd0aCA9IHBhaXJzLmxlbmd0aDtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgICAgb2JqID0gbmV3IE9iamVjdChvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldLCBrZXkgPSBwYWlyWzBdO1xuICAgICAgICBpZiAocGFpclsxXSAhPT0gb2JqW2tleV0gfHwgIShrZXkgaW4gb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IG9iamVjdFtwcm9wZXJ0eV0oKSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiIsInZhciBjc3MgPSBcIi5tYXJrZXItY2x1c3Rlci1zbWFsbCB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogcmdiYSgxODEsIDIyNiwgMTQwLCAwLjYpO1xcblxcdH1cXG4ubWFya2VyLWNsdXN0ZXItc21hbGwgZGl2IHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDExMCwgMjA0LCA1NywgMC42KTtcXG5cXHR9XFxuXFxuLm1hcmtlci1jbHVzdGVyLW1lZGl1bSB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNDEsIDIxMSwgODcsIDAuNik7XFxuXFx0fVxcbi5tYXJrZXItY2x1c3Rlci1tZWRpdW0gZGl2IHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI0MCwgMTk0LCAxMiwgMC42KTtcXG5cXHR9XFxuXFxuLm1hcmtlci1jbHVzdGVyLWxhcmdlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1MywgMTU2LCAxMTUsIDAuNik7XFxuXFx0fVxcbi5tYXJrZXItY2x1c3Rlci1sYXJnZSBkaXYge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjQxLCAxMjgsIDIzLCAwLjYpO1xcblxcdH1cXG5cXG5cXHQvKiBJRSA2LTggZmFsbGJhY2sgY29sb3JzICovXFxuLmxlYWZsZXQtb2xkaWUgLm1hcmtlci1jbHVzdGVyLXNtYWxsIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTgxLCAyMjYsIDE0MCk7XFxuXFx0fVxcbi5sZWFmbGV0LW9sZGllIC5tYXJrZXItY2x1c3Rlci1zbWFsbCBkaXYge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxMTAsIDIwNCwgNTcpO1xcblxcdH1cXG5cXG4ubGVhZmxldC1vbGRpZSAubWFya2VyLWNsdXN0ZXItbWVkaXVtIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQxLCAyMTEsIDg3KTtcXG5cXHR9XFxuLmxlYWZsZXQtb2xkaWUgLm1hcmtlci1jbHVzdGVyLW1lZGl1bSBkaXYge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigyNDAsIDE5NCwgMTIpO1xcblxcdH1cXG5cXG4ubGVhZmxldC1vbGRpZSAubWFya2VyLWNsdXN0ZXItbGFyZ2Uge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigyNTMsIDE1NiwgMTE1KTtcXG5cXHR9XFxuLmxlYWZsZXQtb2xkaWUgLm1hcmtlci1jbHVzdGVyLWxhcmdlIGRpdiB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogcmdiKDI0MSwgMTI4LCAyMyk7XFxufVxcblxcbi5tYXJrZXItY2x1c3RlciB7XFxuXFx0YmFja2dyb3VuZC1jbGlwOiBwYWRkaW5nLWJveDtcXG5cXHRib3JkZXItcmFkaXVzOiAyMHB4O1xcblxcdH1cXG4ubWFya2VyLWNsdXN0ZXIgZGl2IHtcXG5cXHR3aWR0aDogMzBweDtcXG5cXHRoZWlnaHQ6IDMwcHg7XFxuXFx0bWFyZ2luLWxlZnQ6IDVweDtcXG5cXHRtYXJnaW4tdG9wOiA1cHg7XFxuXFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcblxcdGJvcmRlci1yYWRpdXM6IDE1cHg7XFxuXFx0Zm9udDogMTJweCBcXFwiSGVsdmV0aWNhIE5ldWVcXFwiLCBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xcblxcdH1cXG4ubWFya2VyLWNsdXN0ZXIgc3BhbiB7XFxuXFx0bGluZS1oZWlnaHQ6IDMwcHg7XFxuXFx0fVwiOyAocmVxdWlyZShcIi9Vc2Vycy9wa3JvL0Ryb3Bib3gvRGlwcGEvZ2Vvdml6LWZyYW1ld29yay0zL25vZGVfbW9kdWxlcy9jc3NpZnlcIikpKGNzcyk7IG1vZHVsZS5leHBvcnRzID0gY3NzOyIsInZhciBjc3MgPSBcIi5sZWFmbGV0LWNsdXN0ZXItYW5pbSAubGVhZmxldC1tYXJrZXItaWNvbiwgLmxlYWZsZXQtY2x1c3Rlci1hbmltIC5sZWFmbGV0LW1hcmtlci1zaGFkb3cge1xcblxcdC13ZWJraXQtdHJhbnNpdGlvbjogLXdlYmtpdC10cmFuc2Zvcm0gMC4zcyBlYXNlLW91dCwgb3BhY2l0eSAwLjNzIGVhc2UtaW47XFxuXFx0LW1vei10cmFuc2l0aW9uOiAtbW96LXRyYW5zZm9ybSAwLjNzIGVhc2Utb3V0LCBvcGFjaXR5IDAuM3MgZWFzZS1pbjtcXG5cXHQtby10cmFuc2l0aW9uOiAtby10cmFuc2Zvcm0gMC4zcyBlYXNlLW91dCwgb3BhY2l0eSAwLjNzIGVhc2UtaW47XFxuXFx0dHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZS1vdXQsIG9wYWNpdHkgMC4zcyBlYXNlLWluO1xcblxcdH1cXG5cIjsgKHJlcXVpcmUoXCIvVXNlcnMvcGtyby9Ecm9wYm94L0RpcHBhL2dlb3Zpei1mcmFtZXdvcmstMy9ub2RlX21vZHVsZXMvY3NzaWZ5XCIpKShjc3MpOyBtb2R1bGUuZXhwb3J0cyA9IGNzczsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG5cbjsgTCA9IGdsb2JhbC5MID0gcmVxdWlyZShcImxlYWZsZXRcIik7XG47X19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZGVmaW5lLCByZXF1aXJlKSB7XG4vKlxuKiBMZWFmbGV0IEhlYXRtYXAgT3ZlcmxheVxuKlxuKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhdHJpY2sgV2llZCAoaHR0cDovL3d3dy5wYXRyaWNrLXdpZWQuYXQpXG4qIER1YWwtbGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4qIGFuZCB0aGUgQmVlcndhcmUgKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmVlcndhcmUpIGxpY2Vuc2UuXG4qL1xuXG4vLyBMZWFmbGV0IDwgMC44IGNvbXBhdGliaWxpdHlcbmlmICh0eXBlb2YgTC5MYXllciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgTC5MYXllciA9IEwuQ2xhc3M7XG59XG5cbnZhciBIZWF0bWFwT3ZlcmxheSA9IEwuTGF5ZXIuZXh0ZW5kKHtcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgdGhpcy5jZmcgPSBjb25maWc7XG4gICAgdGhpcy5fZWwgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC16b29tLWhpZGUnKTtcbiAgICB0aGlzLl9kYXRhID0gW107XG4gICAgdGhpcy5fbWF4ID0gMTtcbiAgICB0aGlzLl9taW4gPSAwO1xuICAgIHRoaXMuY2ZnLmNvbnRhaW5lciA9IHRoaXMuX2VsO1xuICB9LFxuXG4gIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgdmFyIHNpemUgPSBtYXAuZ2V0U2l6ZSgpO1xuXG4gICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgdGhpcy5fd2lkdGggPSBzaXplLng7XG4gICAgdGhpcy5faGVpZ2h0ID0gc2l6ZS55O1xuXG4gICAgdGhpcy5fZWwuc3R5bGUud2lkdGggPSBzaXplLnggKyAncHgnO1xuICAgIHRoaXMuX2VsLnN0eWxlLmhlaWdodCA9IHNpemUueSArICdweCc7XG5cbiAgICB0aGlzLl9yZXNldE9yaWdpbigpO1xuXG4gICAgbWFwLmdldFBhbmVzKCkub3ZlcmxheVBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fZWwpO1xuXG4gICAgaWYgKCF0aGlzLl9oZWF0bWFwKSB7XG4gICAgICB0aGlzLl9oZWF0bWFwID0gaDMzNy5jcmVhdGUodGhpcy5jZmcpO1xuICAgIH0gXG5cbiAgICAvLyBvbiB6b29tLCByZXNldCBvcmlnaW5cbiAgICBtYXAub24oJ3ZpZXdyZXNldCcsIHRoaXMuX3Jlc2V0T3JpZ2luLCB0aGlzKTtcbiAgICAvLyByZWRyYXcgd2hlbmV2ZXIgZHJhZ2VuZFxuICAgIG1hcC5vbignZHJhZ2VuZCcsIHRoaXMuX2RyYXcsIHRoaXMpO1xuXG4gICAgdGhpcy5fZHJhdygpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgLy8gcmVtb3ZlIGxheWVyJ3MgRE9NIGVsZW1lbnRzIGFuZCBsaXN0ZW5lcnNcbiAgICBtYXAuZ2V0UGFuZXMoKS5vdmVybGF5UGFuZS5yZW1vdmVDaGlsZCh0aGlzLl9lbCk7XG5cbiAgICBtYXAub2ZmKCd2aWV3cmVzZXQnLCB0aGlzLl9yZXNldE9yaWdpbiwgdGhpcyk7XG4gICAgbWFwLm9mZignZHJhZ2VuZCcsIHRoaXMuX2RyYXcsIHRoaXMpO1xuICB9LFxuICBfZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuOyB9XG4gICAgXG4gICAgdmFyIHBvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQodGhpcy5fb3JpZ2luKTsgICAgICAgIFxuXG4gICAgLy8gcmVwb3NpdGlvbiB0aGUgbGF5ZXJcbiAgICB0aGlzLl9lbC5zdHlsZVtIZWF0bWFwT3ZlcmxheS5DU1NfVFJBTlNGT1JNXSA9ICd0cmFuc2xhdGUoJyArXG4gICAgICAtTWF0aC5yb3VuZChwb2ludC54KSArICdweCwnICtcbiAgICAgIC1NYXRoLnJvdW5kKHBvaW50LnkpICsgJ3B4KSc7XG5cbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgfSxcbiAgX3VwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvdW5kcywgem9vbSwgc2NhbGU7XG5cbiAgICBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG4gICAgc2NhbGUgPSBNYXRoLnBvdygyLCB6b29tKTtcblxuICAgIGlmICh0aGlzLl9kYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGdlbmVyYXRlZERhdGEgPSB7IG1heDogdGhpcy5fbWF4LCBtaW46IHRoaXMuX21pbiB9O1xuICAgIHZhciBsYXRMbmdQb2ludHMgPSBbXTtcbiAgICB2YXIgcmFkaXVzTXVsdGlwbGllciA9IHRoaXMuY2ZnLnNjYWxlUmFkaXVzID8gc2NhbGUgOiAxO1xuICAgIHZhciBsb2NhbE1heCA9IDA7XG4gICAgdmFyIGxvY2FsTWluID0gMDtcbiAgICB2YXIgdmFsdWVGaWVsZCA9IHRoaXMuY2ZnLnZhbHVlRmllbGQ7XG4gICAgdmFyIGxlbiA9IHRoaXMuX2RhdGEubGVuZ3RoO1xuICBcbiAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgIHZhciBlbnRyeSA9IHRoaXMuX2RhdGFbbGVuXTtcbiAgICAgIHZhciB2YWx1ZSA9IGVudHJ5W3ZhbHVlRmllbGRdO1xuICAgICAgdmFyIGxhdGxuZyA9IGVudHJ5LmxhdGxuZztcblxuXG4gICAgICAvLyB3ZSBkb24ndCB3YW5uYSByZW5kZXIgcG9pbnRzIHRoYXQgYXJlIG5vdCBldmVuIG9uIHRoZSBtYXAgOy0pXG4gICAgICBpZiAoIWJvdW5kcy5jb250YWlucyhsYXRsbmcpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gbG9jYWwgbWF4IGlzIHRoZSBtYXhpbXVtIHdpdGhpbiBjdXJyZW50IGJvdW5kc1xuICAgICAgbG9jYWxNYXggPSBNYXRoLm1heCh2YWx1ZSwgbG9jYWxNYXgpO1xuICAgICAgbG9jYWxNaW4gPSBNYXRoLm1pbih2YWx1ZSwgbG9jYWxNaW4pO1xuXG4gICAgICB2YXIgcG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsYXRsbmcpO1xuICAgICAgdmFyIGxhdGxuZ1BvaW50ID0geyB4OiBNYXRoLnJvdW5kKHBvaW50LngpLCB5OiBNYXRoLnJvdW5kKHBvaW50LnkpIH07XG4gICAgICBsYXRsbmdQb2ludFt2YWx1ZUZpZWxkXSA9IHZhbHVlO1xuXG4gICAgICB2YXIgcmFkaXVzO1xuXG4gICAgICBpZiAoZW50cnkucmFkaXVzKSB7XG4gICAgICAgIHJhZGl1cyA9IGVudHJ5LnJhZGl1cyAqIHJhZGl1c011bHRpcGxpZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYWRpdXMgPSAodGhpcy5jZmcucmFkaXVzIHx8IDIpICogcmFkaXVzTXVsdGlwbGllcjtcbiAgICAgIH1cbiAgICAgIGxhdGxuZ1BvaW50LnJhZGl1cyA9IHJhZGl1cztcbiAgICAgIGxhdExuZ1BvaW50cy5wdXNoKGxhdGxuZ1BvaW50KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2ZnLnVzZUxvY2FsRXh0cmVtYSkge1xuICAgICAgZ2VuZXJhdGVkRGF0YS5tYXggPSBsb2NhbE1heDtcbiAgICAgIGdlbmVyYXRlZERhdGEubWluID0gbG9jYWxNaW47XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVkRGF0YS5kYXRhID0gbGF0TG5nUG9pbnRzO1xuXG4gICAgdGhpcy5faGVhdG1hcC5zZXREYXRhKGdlbmVyYXRlZERhdGEpO1xuICB9LFxuICBzZXREYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5fbWF4ID0gZGF0YS5tYXggfHwgdGhpcy5fbWF4O1xuICAgIHRoaXMuX21pbiA9IGRhdGEubWluIHx8IHRoaXMuX21pbjtcbiAgICB2YXIgbGF0RmllbGQgPSB0aGlzLmNmZy5sYXRGaWVsZCB8fCAnbGF0JztcbiAgICB2YXIgbG5nRmllbGQgPSB0aGlzLmNmZy5sbmdGaWVsZCB8fCAnbG5nJztcbiAgICB2YXIgdmFsdWVGaWVsZCA9IHRoaXMuY2ZnLnZhbHVlRmllbGQgfHwgJ3ZhbHVlJztcbiAgXG4gICAgLy8gdHJhbnNmb3JtIGRhdGEgdG8gbGF0bG5nc1xuICAgIHZhciBkYXRhID0gZGF0YS5kYXRhO1xuICAgIHZhciBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICB2YXIgZCA9IFtdO1xuICBcbiAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgIHZhciBlbnRyeSA9IGRhdGFbbGVuXTtcbiAgICAgIHZhciBsYXRsbmcgPSBuZXcgTC5MYXRMbmcoZW50cnlbbGF0RmllbGRdLCBlbnRyeVtsbmdGaWVsZF0pO1xuICAgICAgdmFyIGRhdGFPYmogPSB7IGxhdGxuZzogbGF0bG5nIH07XG4gICAgICBkYXRhT2JqW3ZhbHVlRmllbGRdID0gZW50cnlbdmFsdWVGaWVsZF07XG4gICAgICBpZiAoZW50cnkucmFkaXVzKSB7XG4gICAgICAgIGRhdGFPYmoucmFkaXVzID0gZW50cnkucmFkaXVzO1xuICAgICAgfVxuICAgICAgZC5wdXNoKGRhdGFPYmopO1xuICAgIH1cbiAgICB0aGlzLl9kYXRhID0gZDtcbiAgXG4gICAgdGhpcy5fZHJhdygpO1xuICB9LFxuICAvLyBleHBlcmltZW50aWFsLi4uIG5vdCByZWFkeS5cbiAgYWRkRGF0YTogZnVuY3Rpb24ocG9pbnRPckFycmF5KSB7XG4gICAgaWYgKHBvaW50T3JBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgbGVuID0gcG9pbnRPckFycmF5Lmxlbmd0aDtcbiAgICAgIHdoaWxlKGxlbi0tKSB7XG4gICAgICAgIHRoaXMuYWRkRGF0YShwb2ludE9yQXJyYXlbbGVuXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsYXRGaWVsZCA9IHRoaXMuY2ZnLmxhdEZpZWxkIHx8ICdsYXQnO1xuICAgICAgdmFyIGxuZ0ZpZWxkID0gdGhpcy5jZmcubG5nRmllbGQgfHwgJ2xuZyc7XG4gICAgICB2YXIgdmFsdWVGaWVsZCA9IHRoaXMuY2ZnLnZhbHVlRmllbGQgfHwgJ3ZhbHVlJztcbiAgICAgIHZhciBlbnRyeSA9IHBvaW50T3JBcnJheTtcbiAgICAgIHZhciBsYXRsbmcgPSBuZXcgTC5MYXRMbmcoZW50cnlbbGF0RmllbGRdLCBlbnRyeVtsbmdGaWVsZF0pO1xuICAgICAgdmFyIGRhdGFPYmogPSB7IGxhdGxuZzogbGF0bG5nIH07XG4gICAgICBcbiAgICAgIGRhdGFPYmpbdmFsdWVGaWVsZF0gPSBlbnRyeVt2YWx1ZUZpZWxkXTtcbiAgICAgIHRoaXMuX21heCA9IE1hdGgubWF4KHRoaXMuX21heCwgZGF0YU9ialt2YWx1ZUZpZWxkXSk7XG4gICAgICB0aGlzLl9taW4gPSBNYXRoLm1pbih0aGlzLl9taW4sIGRhdGFPYmpbdmFsdWVGaWVsZF0pO1xuXG4gICAgICBpZiAoZW50cnkucmFkaXVzKSB7XG4gICAgICAgIGRhdGFPYmoucmFkaXVzID0gZW50cnkucmFkaXVzO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGF0YS5wdXNoKGRhdGFPYmopO1xuICAgICAgdGhpcy5fZHJhdygpO1xuICAgIH1cbiAgfSxcbiAgX3Jlc2V0T3JpZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fb3JpZ2luID0gdGhpcy5fbWFwLmxheWVyUG9pbnRUb0xhdExuZyhuZXcgTC5Qb2ludCgwLCAwKSk7XG4gICAgdGhpcy5fZHJhdygpO1xuICB9IFxufSk7XG5cbkhlYXRtYXBPdmVybGF5LkNTU19UUkFOU0ZPUk0gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIHByb3BzID0gW1xuICAndHJhbnNmb3JtJyxcbiAgJ1dlYmtpdFRyYW5zZm9ybScsXG4gICdNb3pUcmFuc2Zvcm0nLFxuICAnT1RyYW5zZm9ybScsXG4gICdtc1RyYW5zZm9ybSdcbiAgXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICBpZiAoZGl2LnN0eWxlW3Byb3BdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9wc1swXTtcbn0pKCk7XG59KS5jYWxsKGdsb2JhbCwgbW9kdWxlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcblxuOyBMID0gZ2xvYmFsLkwgPSByZXF1aXJlKFwibGVhZmxldFwiKTtcbjtfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBkZWZpbmUsIHJlcXVpcmUpIHtcbi8qXG4gTGVhZmxldC5tYXJrZXJjbHVzdGVyLCBQcm92aWRlcyBCZWF1dGlmdWwgQW5pbWF0ZWQgTWFya2VyIENsdXN0ZXJpbmcgZnVuY3Rpb25hbGl0eSBmb3IgTGVhZmxldCwgYSBKUyBsaWJyYXJ5IGZvciBpbnRlcmFjdGl2ZSBtYXBzLlxuIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQubWFya2VyY2x1c3RlclxuIChjKSAyMDEyLTIwMTMsIERhdmUgTGVhdmVyLCBzbWFydHJha1xuKi9cbiFmdW5jdGlvbih0LGUpe0wuTWFya2VyQ2x1c3Rlckdyb3VwPUwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7b3B0aW9uczp7bWF4Q2x1c3RlclJhZGl1czo4MCxpY29uQ3JlYXRlRnVuY3Rpb246bnVsbCxzcGlkZXJmeU9uTWF4Wm9vbTohMCxzaG93Q292ZXJhZ2VPbkhvdmVyOiEwLHpvb21Ub0JvdW5kc09uQ2xpY2s6ITAsc2luZ2xlTWFya2VyTW9kZTohMSxkaXNhYmxlQ2x1c3RlcmluZ0F0Wm9vbTpudWxsLHJlbW92ZU91dHNpZGVWaXNpYmxlQm91bmRzOiEwLGFuaW1hdGVBZGRpbmdNYXJrZXJzOiExLHNwaWRlcmZ5RGlzdGFuY2VNdWx0aXBsaWVyOjEsY2h1bmtlZExvYWRpbmc6ITEsY2h1bmtJbnRlcnZhbDoyMDAsY2h1bmtEZWxheTo1MCxjaHVua1Byb2dyZXNzOm51bGwscG9seWdvbk9wdGlvbnM6e319LGluaXRpYWxpemU6ZnVuY3Rpb24odCl7TC5VdGlsLnNldE9wdGlvbnModGhpcyx0KSx0aGlzLm9wdGlvbnMuaWNvbkNyZWF0ZUZ1bmN0aW9ufHwodGhpcy5vcHRpb25zLmljb25DcmVhdGVGdW5jdGlvbj10aGlzLl9kZWZhdWx0SWNvbkNyZWF0ZUZ1bmN0aW9uKSx0aGlzLl9mZWF0dXJlR3JvdXA9TC5mZWF0dXJlR3JvdXAoKSx0aGlzLl9mZWF0dXJlR3JvdXAub24oTC5GZWF0dXJlR3JvdXAuRVZFTlRTLHRoaXMuX3Byb3BhZ2F0ZUV2ZW50LHRoaXMpLHRoaXMuX25vblBvaW50R3JvdXA9TC5mZWF0dXJlR3JvdXAoKSx0aGlzLl9ub25Qb2ludEdyb3VwLm9uKEwuRmVhdHVyZUdyb3VwLkVWRU5UUyx0aGlzLl9wcm9wYWdhdGVFdmVudCx0aGlzKSx0aGlzLl9pblpvb21BbmltYXRpb249MCx0aGlzLl9uZWVkc0NsdXN0ZXJpbmc9W10sdGhpcy5fbmVlZHNSZW1vdmluZz1bXSx0aGlzLl9jdXJyZW50U2hvd25Cb3VuZHM9bnVsbCx0aGlzLl9xdWV1ZT1bXX0sYWRkTGF5ZXI6ZnVuY3Rpb24odCl7aWYodCBpbnN0YW5jZW9mIEwuTGF5ZXJHcm91cCl7dmFyIGU9W107Zm9yKHZhciBpIGluIHQuX2xheWVycyllLnB1c2godC5fbGF5ZXJzW2ldKTtyZXR1cm4gdGhpcy5hZGRMYXllcnMoZSl9aWYoIXQuZ2V0TGF0TG5nKXJldHVybiB0aGlzLl9ub25Qb2ludEdyb3VwLmFkZExheWVyKHQpLHRoaXM7aWYoIXRoaXMuX21hcClyZXR1cm4gdGhpcy5fbmVlZHNDbHVzdGVyaW5nLnB1c2godCksdGhpcztpZih0aGlzLmhhc0xheWVyKHQpKXJldHVybiB0aGlzO3RoaXMuX3Vuc3BpZGVyZnkmJnRoaXMuX3Vuc3BpZGVyZnkoKSx0aGlzLl9hZGRMYXllcih0LHRoaXMuX21heFpvb20pO3ZhciBuPXQscz10aGlzLl9tYXAuZ2V0Wm9vbSgpO2lmKHQuX19wYXJlbnQpZm9yKDtuLl9fcGFyZW50Ll96b29tPj1zOyluPW4uX19wYXJlbnQ7cmV0dXJuIHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcy5jb250YWlucyhuLmdldExhdExuZygpKSYmKHRoaXMub3B0aW9ucy5hbmltYXRlQWRkaW5nTWFya2Vycz90aGlzLl9hbmltYXRpb25BZGRMYXllcih0LG4pOnRoaXMuX2FuaW1hdGlvbkFkZExheWVyTm9uQW5pbWF0ZWQodCxuKSksdGhpc30scmVtb3ZlTGF5ZXI6ZnVuY3Rpb24odCl7aWYodCBpbnN0YW5jZW9mIEwuTGF5ZXJHcm91cCl7dmFyIGU9W107Zm9yKHZhciBpIGluIHQuX2xheWVycyllLnB1c2godC5fbGF5ZXJzW2ldKTtyZXR1cm4gdGhpcy5yZW1vdmVMYXllcnMoZSl9cmV0dXJuIHQuZ2V0TGF0TG5nP3RoaXMuX21hcD90Ll9fcGFyZW50Pyh0aGlzLl91bnNwaWRlcmZ5JiYodGhpcy5fdW5zcGlkZXJmeSgpLHRoaXMuX3Vuc3BpZGVyZnlMYXllcih0KSksdGhpcy5fcmVtb3ZlTGF5ZXIodCwhMCksdGhpcy5fZmVhdHVyZUdyb3VwLmhhc0xheWVyKHQpJiYodGhpcy5fZmVhdHVyZUdyb3VwLnJlbW92ZUxheWVyKHQpLHQuc2V0T3BhY2l0eSYmdC5zZXRPcGFjaXR5KDEpKSx0aGlzKTp0aGlzOighdGhpcy5fYXJyYXlTcGxpY2UodGhpcy5fbmVlZHNDbHVzdGVyaW5nLHQpJiZ0aGlzLmhhc0xheWVyKHQpJiZ0aGlzLl9uZWVkc1JlbW92aW5nLnB1c2godCksdGhpcyk6KHRoaXMuX25vblBvaW50R3JvdXAucmVtb3ZlTGF5ZXIodCksdGhpcyl9LGFkZExheWVyczpmdW5jdGlvbih0KXt2YXIgZSxpLG4scyxyPXRoaXMuX2ZlYXR1cmVHcm91cCxvPXRoaXMuX25vblBvaW50R3JvdXAsYT10aGlzLm9wdGlvbnMuY2h1bmtlZExvYWRpbmcsaD10aGlzLm9wdGlvbnMuY2h1bmtJbnRlcnZhbCxfPXRoaXMub3B0aW9ucy5jaHVua1Byb2dyZXNzO2lmKHRoaXMuX21hcCl7dmFyIHU9MCxsPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGQ9TC5iaW5kKGZ1bmN0aW9uKCl7Zm9yKHZhciBlPShuZXcgRGF0ZSkuZ2V0VGltZSgpO3U8dC5sZW5ndGg7dSsrKXtpZihhJiYwPT09dSUyMDApe3ZhciBpPShuZXcgRGF0ZSkuZ2V0VGltZSgpLWU7aWYoaT5oKWJyZWFrfWlmKHM9dFt1XSxzLmdldExhdExuZyl7aWYoIXRoaXMuaGFzTGF5ZXIocykmJih0aGlzLl9hZGRMYXllcihzLHRoaXMuX21heFpvb20pLHMuX19wYXJlbnQmJjI9PT1zLl9fcGFyZW50LmdldENoaWxkQ291bnQoKSkpe3ZhciBuPXMuX19wYXJlbnQuZ2V0QWxsQ2hpbGRNYXJrZXJzKCkscD1uWzBdPT09cz9uWzFdOm5bMF07ci5yZW1vdmVMYXllcihwKX19ZWxzZSBvLmFkZExheWVyKHMpfV8mJl8odSx0Lmxlbmd0aCwobmV3IERhdGUpLmdldFRpbWUoKS1sKSx1PT09dC5sZW5ndGg/KHRoaXMuX2ZlYXR1cmVHcm91cC5lYWNoTGF5ZXIoZnVuY3Rpb24odCl7dCBpbnN0YW5jZW9mIEwuTWFya2VyQ2x1c3RlciYmdC5faWNvbk5lZWRzVXBkYXRlJiZ0Ll91cGRhdGVJY29uKCl9KSx0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5QWRkQ2hpbGRyZW5Ub01hcChudWxsLHRoaXMuX3pvb20sdGhpcy5fY3VycmVudFNob3duQm91bmRzKSk6c2V0VGltZW91dChkLHRoaXMub3B0aW9ucy5jaHVua0RlbGF5KX0sdGhpcyk7ZCgpfWVsc2V7Zm9yKGU9W10saT0wLG49dC5sZW5ndGg7bj5pO2krKylzPXRbaV0scy5nZXRMYXRMbmc/dGhpcy5oYXNMYXllcihzKXx8ZS5wdXNoKHMpOm8uYWRkTGF5ZXIocyk7dGhpcy5fbmVlZHNDbHVzdGVyaW5nPXRoaXMuX25lZWRzQ2x1c3RlcmluZy5jb25jYXQoZSl9cmV0dXJuIHRoaXN9LHJlbW92ZUxheWVyczpmdW5jdGlvbih0KXt2YXIgZSxpLG4scz10aGlzLl9mZWF0dXJlR3JvdXAscj10aGlzLl9ub25Qb2ludEdyb3VwO2lmKCF0aGlzLl9tYXApe2ZvcihlPTAsaT10Lmxlbmd0aDtpPmU7ZSsrKW49dFtlXSx0aGlzLl9hcnJheVNwbGljZSh0aGlzLl9uZWVkc0NsdXN0ZXJpbmcsbiksci5yZW1vdmVMYXllcihuKTtyZXR1cm4gdGhpc31mb3IoZT0wLGk9dC5sZW5ndGg7aT5lO2UrKyluPXRbZV0sbi5fX3BhcmVudD8odGhpcy5fcmVtb3ZlTGF5ZXIobiwhMCwhMCkscy5oYXNMYXllcihuKSYmKHMucmVtb3ZlTGF5ZXIobiksbi5zZXRPcGFjaXR5JiZuLnNldE9wYWNpdHkoMSkpKTpyLnJlbW92ZUxheWVyKG4pO3JldHVybiB0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5QWRkQ2hpbGRyZW5Ub01hcChudWxsLHRoaXMuX3pvb20sdGhpcy5fY3VycmVudFNob3duQm91bmRzKSxzLmVhY2hMYXllcihmdW5jdGlvbih0KXt0IGluc3RhbmNlb2YgTC5NYXJrZXJDbHVzdGVyJiZ0Ll91cGRhdGVJY29uKCl9KSx0aGlzfSxjbGVhckxheWVyczpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXB8fCh0aGlzLl9uZWVkc0NsdXN0ZXJpbmc9W10sZGVsZXRlIHRoaXMuX2dyaWRDbHVzdGVycyxkZWxldGUgdGhpcy5fZ3JpZFVuY2x1c3RlcmVkKSx0aGlzLl9ub2FuaW1hdGlvblVuc3BpZGVyZnkmJnRoaXMuX25vYW5pbWF0aW9uVW5zcGlkZXJmeSgpLHRoaXMuX2ZlYXR1cmVHcm91cC5jbGVhckxheWVycygpLHRoaXMuX25vblBvaW50R3JvdXAuY2xlYXJMYXllcnMoKSx0aGlzLmVhY2hMYXllcihmdW5jdGlvbih0KXtkZWxldGUgdC5fX3BhcmVudH0pLHRoaXMuX21hcCYmdGhpcy5fZ2VuZXJhdGVJbml0aWFsQ2x1c3RlcnMoKSx0aGlzfSxnZXRCb3VuZHM6ZnVuY3Rpb24oKXt2YXIgdD1uZXcgTC5MYXRMbmdCb3VuZHM7dGhpcy5fdG9wQ2x1c3RlckxldmVsJiZ0LmV4dGVuZCh0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX2JvdW5kcyk7Zm9yKHZhciBlPXRoaXMuX25lZWRzQ2x1c3RlcmluZy5sZW5ndGgtMTtlPj0wO2UtLSl0LmV4dGVuZCh0aGlzLl9uZWVkc0NsdXN0ZXJpbmdbZV0uZ2V0TGF0TG5nKCkpO3JldHVybiB0LmV4dGVuZCh0aGlzLl9ub25Qb2ludEdyb3VwLmdldEJvdW5kcygpKSx0fSxlYWNoTGF5ZXI6ZnVuY3Rpb24odCxlKXt2YXIgaSxuPXRoaXMuX25lZWRzQ2x1c3RlcmluZy5zbGljZSgpO2Zvcih0aGlzLl90b3BDbHVzdGVyTGV2ZWwmJnRoaXMuX3RvcENsdXN0ZXJMZXZlbC5nZXRBbGxDaGlsZE1hcmtlcnMobiksaT1uLmxlbmd0aC0xO2k+PTA7aS0tKXQuY2FsbChlLG5baV0pO3RoaXMuX25vblBvaW50R3JvdXAuZWFjaExheWVyKHQsZSl9LGdldExheWVyczpmdW5jdGlvbigpe3ZhciB0PVtdO3JldHVybiB0aGlzLmVhY2hMYXllcihmdW5jdGlvbihlKXt0LnB1c2goZSl9KSx0fSxnZXRMYXllcjpmdW5jdGlvbih0KXt2YXIgZT1udWxsO3JldHVybiB0aGlzLmVhY2hMYXllcihmdW5jdGlvbihpKXtMLnN0YW1wKGkpPT09dCYmKGU9aSl9KSxlfSxoYXNMYXllcjpmdW5jdGlvbih0KXtpZighdClyZXR1cm4hMTt2YXIgZSxpPXRoaXMuX25lZWRzQ2x1c3RlcmluZztmb3IoZT1pLmxlbmd0aC0xO2U+PTA7ZS0tKWlmKGlbZV09PT10KXJldHVybiEwO2ZvcihpPXRoaXMuX25lZWRzUmVtb3ZpbmcsZT1pLmxlbmd0aC0xO2U+PTA7ZS0tKWlmKGlbZV09PT10KXJldHVybiExO3JldHVybiEoIXQuX19wYXJlbnR8fHQuX19wYXJlbnQuX2dyb3VwIT09dGhpcyl8fHRoaXMuX25vblBvaW50R3JvdXAuaGFzTGF5ZXIodCl9LHpvb21Ub1Nob3dMYXllcjpmdW5jdGlvbih0LGUpe3ZhciBpPWZ1bmN0aW9uKCl7aWYoKHQuX2ljb258fHQuX19wYXJlbnQuX2ljb24pJiYhdGhpcy5faW5ab29tQW5pbWF0aW9uKWlmKHRoaXMuX21hcC5vZmYoXCJtb3ZlZW5kXCIsaSx0aGlzKSx0aGlzLm9mZihcImFuaW1hdGlvbmVuZFwiLGksdGhpcyksdC5faWNvbillKCk7ZWxzZSBpZih0Ll9fcGFyZW50Ll9pY29uKXt2YXIgbj1mdW5jdGlvbigpe3RoaXMub2ZmKFwic3BpZGVyZmllZFwiLG4sdGhpcyksZSgpfTt0aGlzLm9uKFwic3BpZGVyZmllZFwiLG4sdGhpcyksdC5fX3BhcmVudC5zcGlkZXJmeSgpfX07aWYodC5faWNvbiYmdGhpcy5fbWFwLmdldEJvdW5kcygpLmNvbnRhaW5zKHQuZ2V0TGF0TG5nKCkpKWUoKTtlbHNlIGlmKHQuX19wYXJlbnQuX3pvb208dGhpcy5fbWFwLmdldFpvb20oKSl0aGlzLl9tYXAub24oXCJtb3ZlZW5kXCIsaSx0aGlzKSx0aGlzLl9tYXAucGFuVG8odC5nZXRMYXRMbmcoKSk7ZWxzZXt2YXIgbj1mdW5jdGlvbigpe3RoaXMuX21hcC5vZmYoXCJtb3Zlc3RhcnRcIixuLHRoaXMpLG49bnVsbH07dGhpcy5fbWFwLm9uKFwibW92ZXN0YXJ0XCIsbix0aGlzKSx0aGlzLl9tYXAub24oXCJtb3ZlZW5kXCIsaSx0aGlzKSx0aGlzLm9uKFwiYW5pbWF0aW9uZW5kXCIsaSx0aGlzKSx0Ll9fcGFyZW50Lnpvb21Ub0JvdW5kcygpLG4mJmkuY2FsbCh0aGlzKX19LG9uQWRkOmZ1bmN0aW9uKHQpe3RoaXMuX21hcD10O3ZhciBlLGksbjtpZighaXNGaW5pdGUodGhpcy5fbWFwLmdldE1heFpvb20oKSkpdGhyb3dcIk1hcCBoYXMgbm8gbWF4Wm9vbSBzcGVjaWZpZWRcIjtmb3IodGhpcy5fZmVhdHVyZUdyb3VwLm9uQWRkKHQpLHRoaXMuX25vblBvaW50R3JvdXAub25BZGQodCksdGhpcy5fZ3JpZENsdXN0ZXJzfHx0aGlzLl9nZW5lcmF0ZUluaXRpYWxDbHVzdGVycygpLGU9MCxpPXRoaXMuX25lZWRzUmVtb3ZpbmcubGVuZ3RoO2k+ZTtlKyspbj10aGlzLl9uZWVkc1JlbW92aW5nW2VdLHRoaXMuX3JlbW92ZUxheWVyKG4sITApO3RoaXMuX25lZWRzUmVtb3Zpbmc9W10sdGhpcy5fem9vbT10aGlzLl9tYXAuZ2V0Wm9vbSgpLHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcz10aGlzLl9nZXRFeHBhbmRlZFZpc2libGVCb3VuZHMoKSx0aGlzLl9tYXAub24oXCJ6b29tZW5kXCIsdGhpcy5fem9vbUVuZCx0aGlzKSx0aGlzLl9tYXAub24oXCJtb3ZlZW5kXCIsdGhpcy5fbW92ZUVuZCx0aGlzKSx0aGlzLl9zcGlkZXJmaWVyT25BZGQmJnRoaXMuX3NwaWRlcmZpZXJPbkFkZCgpLHRoaXMuX2JpbmRFdmVudHMoKSxpPXRoaXMuX25lZWRzQ2x1c3RlcmluZyx0aGlzLl9uZWVkc0NsdXN0ZXJpbmc9W10sdGhpcy5hZGRMYXllcnMoaSl9LG9uUmVtb3ZlOmZ1bmN0aW9uKHQpe3Qub2ZmKFwiem9vbWVuZFwiLHRoaXMuX3pvb21FbmQsdGhpcyksdC5vZmYoXCJtb3ZlZW5kXCIsdGhpcy5fbW92ZUVuZCx0aGlzKSx0aGlzLl91bmJpbmRFdmVudHMoKSx0aGlzLl9tYXAuX21hcFBhbmUuY2xhc3NOYW1lPXRoaXMuX21hcC5fbWFwUGFuZS5jbGFzc05hbWUucmVwbGFjZShcIiBsZWFmbGV0LWNsdXN0ZXItYW5pbVwiLFwiXCIpLHRoaXMuX3NwaWRlcmZpZXJPblJlbW92ZSYmdGhpcy5fc3BpZGVyZmllck9uUmVtb3ZlKCksdGhpcy5faGlkZUNvdmVyYWdlKCksdGhpcy5fZmVhdHVyZUdyb3VwLm9uUmVtb3ZlKHQpLHRoaXMuX25vblBvaW50R3JvdXAub25SZW1vdmUodCksdGhpcy5fZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCksdGhpcy5fbWFwPW51bGx9LGdldFZpc2libGVQYXJlbnQ6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXQ7ZSYmIWUuX2ljb247KWU9ZS5fX3BhcmVudDtyZXR1cm4gZXx8bnVsbH0sX2FycmF5U3BsaWNlOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBpPXQubGVuZ3RoLTE7aT49MDtpLS0paWYodFtpXT09PWUpcmV0dXJuIHQuc3BsaWNlKGksMSksITB9LF9yZW1vdmVMYXllcjpmdW5jdGlvbih0LGUsaSl7dmFyIG49dGhpcy5fZ3JpZENsdXN0ZXJzLHM9dGhpcy5fZ3JpZFVuY2x1c3RlcmVkLHI9dGhpcy5fZmVhdHVyZUdyb3VwLG89dGhpcy5fbWFwO2lmKGUpZm9yKHZhciBhPXRoaXMuX21heFpvb207YT49MCYmc1thXS5yZW1vdmVPYmplY3QodCxvLnByb2plY3QodC5nZXRMYXRMbmcoKSxhKSk7YS0tKTt2YXIgaCxfPXQuX19wYXJlbnQsdT1fLl9tYXJrZXJzO2Zvcih0aGlzLl9hcnJheVNwbGljZSh1LHQpO18mJihfLl9jaGlsZENvdW50LS0sIShfLl96b29tPDApKTspZSYmXy5fY2hpbGRDb3VudDw9MT8oaD1fLl9tYXJrZXJzWzBdPT09dD9fLl9tYXJrZXJzWzFdOl8uX21hcmtlcnNbMF0sbltfLl96b29tXS5yZW1vdmVPYmplY3QoXyxvLnByb2plY3QoXy5fY0xhdExuZyxfLl96b29tKSksc1tfLl96b29tXS5hZGRPYmplY3QoaCxvLnByb2plY3QoaC5nZXRMYXRMbmcoKSxfLl96b29tKSksdGhpcy5fYXJyYXlTcGxpY2UoXy5fX3BhcmVudC5fY2hpbGRDbHVzdGVycyxfKSxfLl9fcGFyZW50Ll9tYXJrZXJzLnB1c2goaCksaC5fX3BhcmVudD1fLl9fcGFyZW50LF8uX2ljb24mJihyLnJlbW92ZUxheWVyKF8pLGl8fHIuYWRkTGF5ZXIoaCkpKTooXy5fcmVjYWxjdWxhdGVCb3VuZHMoKSxpJiZfLl9pY29ufHxfLl91cGRhdGVJY29uKCkpLF89Xy5fX3BhcmVudDtkZWxldGUgdC5fX3BhcmVudH0sX2lzT3JJc1BhcmVudDpmdW5jdGlvbih0LGUpe2Zvcig7ZTspe2lmKHQ9PT1lKXJldHVybiEwO2U9ZS5wYXJlbnROb2RlfXJldHVybiExfSxfcHJvcGFnYXRlRXZlbnQ6ZnVuY3Rpb24odCl7aWYodC5sYXllciBpbnN0YW5jZW9mIEwuTWFya2VyQ2x1c3Rlcil7aWYodC5vcmlnaW5hbEV2ZW50JiZ0aGlzLl9pc09ySXNQYXJlbnQodC5sYXllci5faWNvbix0Lm9yaWdpbmFsRXZlbnQucmVsYXRlZFRhcmdldCkpcmV0dXJuO3QudHlwZT1cImNsdXN0ZXJcIit0LnR5cGV9dGhpcy5maXJlKHQudHlwZSx0KX0sX2RlZmF1bHRJY29uQ3JlYXRlRnVuY3Rpb246ZnVuY3Rpb24odCl7dmFyIGU9dC5nZXRDaGlsZENvdW50KCksaT1cIiBtYXJrZXItY2x1c3Rlci1cIjtyZXR1cm4gaSs9MTA+ZT9cInNtYWxsXCI6MTAwPmU/XCJtZWRpdW1cIjpcImxhcmdlXCIsbmV3IEwuRGl2SWNvbih7aHRtbDpcIjxkaXY+PHNwYW4+XCIrZStcIjwvc3Bhbj48L2Rpdj5cIixjbGFzc05hbWU6XCJtYXJrZXItY2x1c3RlclwiK2ksaWNvblNpemU6bmV3IEwuUG9pbnQoNDAsNDApfSl9LF9iaW5kRXZlbnRzOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fbWFwLGU9dGhpcy5vcHRpb25zLnNwaWRlcmZ5T25NYXhab29tLGk9dGhpcy5vcHRpb25zLnNob3dDb3ZlcmFnZU9uSG92ZXIsbj10aGlzLm9wdGlvbnMuem9vbVRvQm91bmRzT25DbGljazsoZXx8bikmJnRoaXMub24oXCJjbHVzdGVyY2xpY2tcIix0aGlzLl96b29tT3JTcGlkZXJmeSx0aGlzKSxpJiYodGhpcy5vbihcImNsdXN0ZXJtb3VzZW92ZXJcIix0aGlzLl9zaG93Q292ZXJhZ2UsdGhpcyksdGhpcy5vbihcImNsdXN0ZXJtb3VzZW91dFwiLHRoaXMuX2hpZGVDb3ZlcmFnZSx0aGlzKSx0Lm9uKFwiem9vbWVuZFwiLHRoaXMuX2hpZGVDb3ZlcmFnZSx0aGlzKSl9LF96b29tT3JTcGlkZXJmeTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9tYXA7ZS5nZXRNYXhab29tKCk9PT1lLmdldFpvb20oKT90aGlzLm9wdGlvbnMuc3BpZGVyZnlPbk1heFpvb20mJnQubGF5ZXIuc3BpZGVyZnkoKTp0aGlzLm9wdGlvbnMuem9vbVRvQm91bmRzT25DbGljayYmdC5sYXllci56b29tVG9Cb3VuZHMoKSx0Lm9yaWdpbmFsRXZlbnQmJjEzPT09dC5vcmlnaW5hbEV2ZW50LmtleUNvZGUmJmUuX2NvbnRhaW5lci5mb2N1cygpfSxfc2hvd0NvdmVyYWdlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX21hcDt0aGlzLl9pblpvb21BbmltYXRpb258fCh0aGlzLl9zaG93blBvbHlnb24mJmUucmVtb3ZlTGF5ZXIodGhpcy5fc2hvd25Qb2x5Z29uKSx0LmxheWVyLmdldENoaWxkQ291bnQoKT4yJiZ0LmxheWVyIT09dGhpcy5fc3BpZGVyZmllZCYmKHRoaXMuX3Nob3duUG9seWdvbj1uZXcgTC5Qb2x5Z29uKHQubGF5ZXIuZ2V0Q29udmV4SHVsbCgpLHRoaXMub3B0aW9ucy5wb2x5Z29uT3B0aW9ucyksZS5hZGRMYXllcih0aGlzLl9zaG93blBvbHlnb24pKSl9LF9oaWRlQ292ZXJhZ2U6ZnVuY3Rpb24oKXt0aGlzLl9zaG93blBvbHlnb24mJih0aGlzLl9tYXAucmVtb3ZlTGF5ZXIodGhpcy5fc2hvd25Qb2x5Z29uKSx0aGlzLl9zaG93blBvbHlnb249bnVsbCl9LF91bmJpbmRFdmVudHM6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMuc3BpZGVyZnlPbk1heFpvb20sZT10aGlzLm9wdGlvbnMuc2hvd0NvdmVyYWdlT25Ib3ZlcixpPXRoaXMub3B0aW9ucy56b29tVG9Cb3VuZHNPbkNsaWNrLG49dGhpcy5fbWFwOyh0fHxpKSYmdGhpcy5vZmYoXCJjbHVzdGVyY2xpY2tcIix0aGlzLl96b29tT3JTcGlkZXJmeSx0aGlzKSxlJiYodGhpcy5vZmYoXCJjbHVzdGVybW91c2VvdmVyXCIsdGhpcy5fc2hvd0NvdmVyYWdlLHRoaXMpLHRoaXMub2ZmKFwiY2x1c3Rlcm1vdXNlb3V0XCIsdGhpcy5faGlkZUNvdmVyYWdlLHRoaXMpLG4ub2ZmKFwiem9vbWVuZFwiLHRoaXMuX2hpZGVDb3ZlcmFnZSx0aGlzKSl9LF96b29tRW5kOmZ1bmN0aW9uKCl7dGhpcy5fbWFwJiYodGhpcy5fbWVyZ2VTcGxpdENsdXN0ZXJzKCksdGhpcy5fem9vbT10aGlzLl9tYXAuX3pvb20sdGhpcy5fY3VycmVudFNob3duQm91bmRzPXRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKX0sX21vdmVFbmQ6ZnVuY3Rpb24oKXtpZighdGhpcy5faW5ab29tQW5pbWF0aW9uKXt2YXIgdD10aGlzLl9nZXRFeHBhbmRlZFZpc2libGVCb3VuZHMoKTt0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5UmVtb3ZlQ2hpbGRyZW5Gcm9tTWFwKHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcyx0aGlzLl96b29tLHQpLHRoaXMuX3RvcENsdXN0ZXJMZXZlbC5fcmVjdXJzaXZlbHlBZGRDaGlsZHJlblRvTWFwKG51bGwsdGhpcy5fbWFwLl96b29tLHQpLHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcz10fX0sX2dlbmVyYXRlSW5pdGlhbENsdXN0ZXJzOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fbWFwLmdldE1heFpvb20oKSxlPXRoaXMub3B0aW9ucy5tYXhDbHVzdGVyUmFkaXVzLGk9ZTtcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiYoaT1mdW5jdGlvbigpe3JldHVybiBlfSksdGhpcy5vcHRpb25zLmRpc2FibGVDbHVzdGVyaW5nQXRab29tJiYodD10aGlzLm9wdGlvbnMuZGlzYWJsZUNsdXN0ZXJpbmdBdFpvb20tMSksdGhpcy5fbWF4Wm9vbT10LHRoaXMuX2dyaWRDbHVzdGVycz17fSx0aGlzLl9ncmlkVW5jbHVzdGVyZWQ9e307Zm9yKHZhciBuPXQ7bj49MDtuLS0pdGhpcy5fZ3JpZENsdXN0ZXJzW25dPW5ldyBMLkRpc3RhbmNlR3JpZChpKG4pKSx0aGlzLl9ncmlkVW5jbHVzdGVyZWRbbl09bmV3IEwuRGlzdGFuY2VHcmlkKGkobikpO3RoaXMuX3RvcENsdXN0ZXJMZXZlbD1uZXcgTC5NYXJrZXJDbHVzdGVyKHRoaXMsLTEpfSxfYWRkTGF5ZXI6ZnVuY3Rpb24odCxlKXt2YXIgaSxuLHM9dGhpcy5fZ3JpZENsdXN0ZXJzLHI9dGhpcy5fZ3JpZFVuY2x1c3RlcmVkO2Zvcih0aGlzLm9wdGlvbnMuc2luZ2xlTWFya2VyTW9kZSYmKHQub3B0aW9ucy5pY29uPXRoaXMub3B0aW9ucy5pY29uQ3JlYXRlRnVuY3Rpb24oe2dldENoaWxkQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gMX0sZ2V0QWxsQ2hpbGRNYXJrZXJzOmZ1bmN0aW9uKCl7cmV0dXJuW3RdfX0pKTtlPj0wO2UtLSl7aT10aGlzLl9tYXAucHJvamVjdCh0LmdldExhdExuZygpLGUpO3ZhciBvPXNbZV0uZ2V0TmVhck9iamVjdChpKTtpZihvKXJldHVybiBvLl9hZGRDaGlsZCh0KSx0Ll9fcGFyZW50PW8sdm9pZCAwO2lmKG89cltlXS5nZXROZWFyT2JqZWN0KGkpKXt2YXIgYT1vLl9fcGFyZW50O2EmJnRoaXMuX3JlbW92ZUxheWVyKG8sITEpO3ZhciBoPW5ldyBMLk1hcmtlckNsdXN0ZXIodGhpcyxlLG8sdCk7c1tlXS5hZGRPYmplY3QoaCx0aGlzLl9tYXAucHJvamVjdChoLl9jTGF0TG5nLGUpKSxvLl9fcGFyZW50PWgsdC5fX3BhcmVudD1oO3ZhciBfPWg7Zm9yKG49ZS0xO24+YS5fem9vbTtuLS0pXz1uZXcgTC5NYXJrZXJDbHVzdGVyKHRoaXMsbixfKSxzW25dLmFkZE9iamVjdChfLHRoaXMuX21hcC5wcm9qZWN0KG8uZ2V0TGF0TG5nKCksbikpO2ZvcihhLl9hZGRDaGlsZChfKSxuPWU7bj49MCYmcltuXS5yZW1vdmVPYmplY3Qobyx0aGlzLl9tYXAucHJvamVjdChvLmdldExhdExuZygpLG4pKTtuLS0pO3JldHVybn1yW2VdLmFkZE9iamVjdCh0LGkpfXRoaXMuX3RvcENsdXN0ZXJMZXZlbC5fYWRkQ2hpbGQodCksdC5fX3BhcmVudD10aGlzLl90b3BDbHVzdGVyTGV2ZWx9LF9lbnF1ZXVlOmZ1bmN0aW9uKHQpe3RoaXMuX3F1ZXVlLnB1c2godCksdGhpcy5fcXVldWVUaW1lb3V0fHwodGhpcy5fcXVldWVUaW1lb3V0PXNldFRpbWVvdXQoTC5iaW5kKHRoaXMuX3Byb2Nlc3NRdWV1ZSx0aGlzKSwzMDApKX0sX3Byb2Nlc3NRdWV1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdD0wO3Q8dGhpcy5fcXVldWUubGVuZ3RoO3QrKyl0aGlzLl9xdWV1ZVt0XS5jYWxsKHRoaXMpO3RoaXMuX3F1ZXVlLmxlbmd0aD0wLGNsZWFyVGltZW91dCh0aGlzLl9xdWV1ZVRpbWVvdXQpLHRoaXMuX3F1ZXVlVGltZW91dD1udWxsfSxfbWVyZ2VTcGxpdENsdXN0ZXJzOmZ1bmN0aW9uKCl7dGhpcy5fcHJvY2Vzc1F1ZXVlKCksdGhpcy5fem9vbTx0aGlzLl9tYXAuX3pvb20mJnRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcy5pbnRlcnNlY3RzKHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKT8odGhpcy5fYW5pbWF0aW9uU3RhcnQoKSx0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5UmVtb3ZlQ2hpbGRyZW5Gcm9tTWFwKHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcyx0aGlzLl96b29tLHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKSx0aGlzLl9hbmltYXRpb25ab29tSW4odGhpcy5fem9vbSx0aGlzLl9tYXAuX3pvb20pKTp0aGlzLl96b29tPnRoaXMuX21hcC5fem9vbT8odGhpcy5fYW5pbWF0aW9uU3RhcnQoKSx0aGlzLl9hbmltYXRpb25ab29tT3V0KHRoaXMuX3pvb20sdGhpcy5fbWFwLl96b29tKSk6dGhpcy5fbW92ZUVuZCgpfSxfZ2V0RXhwYW5kZWRWaXNpYmxlQm91bmRzOmZ1bmN0aW9uKCl7aWYoIXRoaXMub3B0aW9ucy5yZW1vdmVPdXRzaWRlVmlzaWJsZUJvdW5kcylyZXR1cm4gdGhpcy5fbWFwLmdldEJvdW5kcygpO3ZhciB0PXRoaXMuX21hcCxlPXQuZ2V0Qm91bmRzKCksaT1lLl9zb3V0aFdlc3Qsbj1lLl9ub3J0aEVhc3Qscz1MLkJyb3dzZXIubW9iaWxlPzA6TWF0aC5hYnMoaS5sYXQtbi5sYXQpLHI9TC5Ccm93c2VyLm1vYmlsZT8wOk1hdGguYWJzKGkubG5nLW4ubG5nKTtyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKG5ldyBMLkxhdExuZyhpLmxhdC1zLGkubG5nLXIsITApLG5ldyBMLkxhdExuZyhuLmxhdCtzLG4ubG5nK3IsITApKX0sX2FuaW1hdGlvbkFkZExheWVyTm9uQW5pbWF0ZWQ6ZnVuY3Rpb24odCxlKXtpZihlPT09dCl0aGlzLl9mZWF0dXJlR3JvdXAuYWRkTGF5ZXIodCk7ZWxzZSBpZigyPT09ZS5fY2hpbGRDb3VudCl7ZS5fYWRkVG9NYXAoKTt2YXIgaT1lLmdldEFsbENoaWxkTWFya2VycygpO3RoaXMuX2ZlYXR1cmVHcm91cC5yZW1vdmVMYXllcihpWzBdKSx0aGlzLl9mZWF0dXJlR3JvdXAucmVtb3ZlTGF5ZXIoaVsxXSl9ZWxzZSBlLl91cGRhdGVJY29uKCl9fSksTC5NYXJrZXJDbHVzdGVyR3JvdXAuaW5jbHVkZShMLkRvbVV0aWwuVFJBTlNJVElPTj97X2FuaW1hdGlvblN0YXJ0OmZ1bmN0aW9uKCl7dGhpcy5fbWFwLl9tYXBQYW5lLmNsYXNzTmFtZSs9XCIgbGVhZmxldC1jbHVzdGVyLWFuaW1cIix0aGlzLl9pblpvb21BbmltYXRpb24rK30sX2FuaW1hdGlvbkVuZDpmdW5jdGlvbigpe3RoaXMuX21hcCYmKHRoaXMuX21hcC5fbWFwUGFuZS5jbGFzc05hbWU9dGhpcy5fbWFwLl9tYXBQYW5lLmNsYXNzTmFtZS5yZXBsYWNlKFwiIGxlYWZsZXQtY2x1c3Rlci1hbmltXCIsXCJcIikpLHRoaXMuX2luWm9vbUFuaW1hdGlvbi0tLHRoaXMuZmlyZShcImFuaW1hdGlvbmVuZFwiKX0sX2FuaW1hdGlvblpvb21JbjpmdW5jdGlvbih0LGUpe3ZhciBpLG49dGhpcy5fZ2V0RXhwYW5kZWRWaXNpYmxlQm91bmRzKCkscz10aGlzLl9mZWF0dXJlR3JvdXA7dGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseShuLHQsMCxmdW5jdGlvbihyKXt2YXIgbyxhPXIuX2xhdGxuZyxoPXIuX21hcmtlcnM7Zm9yKG4uY29udGFpbnMoYSl8fChhPW51bGwpLHIuX2lzU2luZ2xlUGFyZW50KCkmJnQrMT09PWU/KHMucmVtb3ZlTGF5ZXIociksci5fcmVjdXJzaXZlbHlBZGRDaGlsZHJlblRvTWFwKG51bGwsZSxuKSk6KHIuc2V0T3BhY2l0eSgwKSxyLl9yZWN1cnNpdmVseUFkZENoaWxkcmVuVG9NYXAoYSxlLG4pKSxpPWgubGVuZ3RoLTE7aT49MDtpLS0pbz1oW2ldLG4uY29udGFpbnMoby5fbGF0bG5nKXx8cy5yZW1vdmVMYXllcihvKX0pLHRoaXMuX2ZvcmNlTGF5b3V0KCksdGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseUJlY29tZVZpc2libGUobixlKSxzLmVhY2hMYXllcihmdW5jdGlvbih0KXt0IGluc3RhbmNlb2YgTC5NYXJrZXJDbHVzdGVyfHwhdC5faWNvbnx8dC5zZXRPcGFjaXR5KDEpfSksdGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseShuLHQsZSxmdW5jdGlvbih0KXt0Ll9yZWN1cnNpdmVseVJlc3RvcmVDaGlsZFBvc2l0aW9ucyhlKX0pLHRoaXMuX2VucXVldWUoZnVuY3Rpb24oKXt0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5KG4sdCwwLGZ1bmN0aW9uKHQpe3MucmVtb3ZlTGF5ZXIodCksdC5zZXRPcGFjaXR5KDEpfSksdGhpcy5fYW5pbWF0aW9uRW5kKCl9KX0sX2FuaW1hdGlvblpvb21PdXQ6ZnVuY3Rpb24odCxlKXt0aGlzLl9hbmltYXRpb25ab29tT3V0U2luZ2xlKHRoaXMuX3RvcENsdXN0ZXJMZXZlbCx0LTEsZSksdGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseUFkZENoaWxkcmVuVG9NYXAobnVsbCxlLHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKSx0aGlzLl90b3BDbHVzdGVyTGV2ZWwuX3JlY3Vyc2l2ZWx5UmVtb3ZlQ2hpbGRyZW5Gcm9tTWFwKHRoaXMuX2N1cnJlbnRTaG93bkJvdW5kcyx0LHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKX0sX2FuaW1hdGlvblpvb21PdXRTaW5nbGU6ZnVuY3Rpb24odCxlLGkpe3ZhciBuPXRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpO3QuX3JlY3Vyc2l2ZWx5QW5pbWF0ZUNoaWxkcmVuSW5BbmRBZGRTZWxmVG9NYXAobixlKzEsaSk7dmFyIHM9dGhpczt0aGlzLl9mb3JjZUxheW91dCgpLHQuX3JlY3Vyc2l2ZWx5QmVjb21lVmlzaWJsZShuLGkpLHRoaXMuX2VucXVldWUoZnVuY3Rpb24oKXtpZigxPT09dC5fY2hpbGRDb3VudCl7dmFyIHI9dC5fbWFya2Vyc1swXTtyLnNldExhdExuZyhyLmdldExhdExuZygpKSxyLnNldE9wYWNpdHkmJnIuc2V0T3BhY2l0eSgxKX1lbHNlIHQuX3JlY3Vyc2l2ZWx5KG4saSwwLGZ1bmN0aW9uKHQpe3QuX3JlY3Vyc2l2ZWx5UmVtb3ZlQ2hpbGRyZW5Gcm9tTWFwKG4sZSsxKX0pO3MuX2FuaW1hdGlvbkVuZCgpfSl9LF9hbmltYXRpb25BZGRMYXllcjpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMsbj10aGlzLl9mZWF0dXJlR3JvdXA7bi5hZGRMYXllcih0KSxlIT09dCYmKGUuX2NoaWxkQ291bnQ+Mj8oZS5fdXBkYXRlSWNvbigpLHRoaXMuX2ZvcmNlTGF5b3V0KCksdGhpcy5fYW5pbWF0aW9uU3RhcnQoKSx0Ll9zZXRQb3ModGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChlLmdldExhdExuZygpKSksdC5zZXRPcGFjaXR5KDApLHRoaXMuX2VucXVldWUoZnVuY3Rpb24oKXtuLnJlbW92ZUxheWVyKHQpLHQuc2V0T3BhY2l0eSgxKSxpLl9hbmltYXRpb25FbmQoKX0pKToodGhpcy5fZm9yY2VMYXlvdXQoKSxpLl9hbmltYXRpb25TdGFydCgpLGkuX2FuaW1hdGlvblpvb21PdXRTaW5nbGUoZSx0aGlzLl9tYXAuZ2V0TWF4Wm9vbSgpLHRoaXMuX21hcC5nZXRab29tKCkpKSl9LF9mb3JjZUxheW91dDpmdW5jdGlvbigpe0wuVXRpbC5mYWxzZUZuKGUuYm9keS5vZmZzZXRXaWR0aCl9fTp7X2FuaW1hdGlvblN0YXJ0OmZ1bmN0aW9uKCl7fSxfYW5pbWF0aW9uWm9vbUluOmZ1bmN0aW9uKHQsZSl7dGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseVJlbW92ZUNoaWxkcmVuRnJvbU1hcCh0aGlzLl9jdXJyZW50U2hvd25Cb3VuZHMsdCksdGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseUFkZENoaWxkcmVuVG9NYXAobnVsbCxlLHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKSx0aGlzLmZpcmUoXCJhbmltYXRpb25lbmRcIil9LF9hbmltYXRpb25ab29tT3V0OmZ1bmN0aW9uKHQsZSl7dGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseVJlbW92ZUNoaWxkcmVuRnJvbU1hcCh0aGlzLl9jdXJyZW50U2hvd25Cb3VuZHMsdCksdGhpcy5fdG9wQ2x1c3RlckxldmVsLl9yZWN1cnNpdmVseUFkZENoaWxkcmVuVG9NYXAobnVsbCxlLHRoaXMuX2dldEV4cGFuZGVkVmlzaWJsZUJvdW5kcygpKSx0aGlzLmZpcmUoXCJhbmltYXRpb25lbmRcIil9LF9hbmltYXRpb25BZGRMYXllcjpmdW5jdGlvbih0LGUpe3RoaXMuX2FuaW1hdGlvbkFkZExheWVyTm9uQW5pbWF0ZWQodCxlKX19KSxMLm1hcmtlckNsdXN0ZXJHcm91cD1mdW5jdGlvbih0KXtyZXR1cm4gbmV3IEwuTWFya2VyQ2x1c3Rlckdyb3VwKHQpfSxMLk1hcmtlckNsdXN0ZXI9TC5NYXJrZXIuZXh0ZW5kKHtpbml0aWFsaXplOmZ1bmN0aW9uKHQsZSxpLG4pe0wuTWFya2VyLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcyxpP2kuX2NMYXRMbmd8fGkuZ2V0TGF0TG5nKCk6bmV3IEwuTGF0TG5nKDAsMCkse2ljb246dGhpc30pLHRoaXMuX2dyb3VwPXQsdGhpcy5fem9vbT1lLHRoaXMuX21hcmtlcnM9W10sdGhpcy5fY2hpbGRDbHVzdGVycz1bXSx0aGlzLl9jaGlsZENvdW50PTAsdGhpcy5faWNvbk5lZWRzVXBkYXRlPSEwLHRoaXMuX2JvdW5kcz1uZXcgTC5MYXRMbmdCb3VuZHMsaSYmdGhpcy5fYWRkQ2hpbGQoaSksbiYmdGhpcy5fYWRkQ2hpbGQobil9LGdldEFsbENoaWxkTWFya2VyczpmdW5jdGlvbih0KXt0PXR8fFtdO2Zvcih2YXIgZT10aGlzLl9jaGlsZENsdXN0ZXJzLmxlbmd0aC0xO2U+PTA7ZS0tKXRoaXMuX2NoaWxkQ2x1c3RlcnNbZV0uZ2V0QWxsQ2hpbGRNYXJrZXJzKHQpO2Zvcih2YXIgaT10aGlzLl9tYXJrZXJzLmxlbmd0aC0xO2k+PTA7aS0tKXQucHVzaCh0aGlzLl9tYXJrZXJzW2ldKTtyZXR1cm4gdH0sZ2V0Q2hpbGRDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jaGlsZENvdW50fSx6b29tVG9Cb3VuZHM6ZnVuY3Rpb24oKXtmb3IodmFyIHQsZT10aGlzLl9jaGlsZENsdXN0ZXJzLnNsaWNlKCksaT10aGlzLl9ncm91cC5fbWFwLG49aS5nZXRCb3VuZHNab29tKHRoaXMuX2JvdW5kcykscz10aGlzLl96b29tKzEscj1pLmdldFpvb20oKTtlLmxlbmd0aD4wJiZuPnM7KXtzKys7dmFyIG89W107Zm9yKHQ9MDt0PGUubGVuZ3RoO3QrKylvPW8uY29uY2F0KGVbdF0uX2NoaWxkQ2x1c3RlcnMpO2U9b31uPnM/dGhpcy5fZ3JvdXAuX21hcC5zZXRWaWV3KHRoaXMuX2xhdGxuZyxzKTpyPj1uP3RoaXMuX2dyb3VwLl9tYXAuc2V0Vmlldyh0aGlzLl9sYXRsbmcscisxKTp0aGlzLl9ncm91cC5fbWFwLmZpdEJvdW5kcyh0aGlzLl9ib3VuZHMpfSxnZXRCb3VuZHM6ZnVuY3Rpb24oKXt2YXIgdD1uZXcgTC5MYXRMbmdCb3VuZHM7cmV0dXJuIHQuZXh0ZW5kKHRoaXMuX2JvdW5kcyksdH0sX3VwZGF0ZUljb246ZnVuY3Rpb24oKXt0aGlzLl9pY29uTmVlZHNVcGRhdGU9ITAsdGhpcy5faWNvbiYmdGhpcy5zZXRJY29uKHRoaXMpfSxjcmVhdGVJY29uOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ljb25OZWVkc1VwZGF0ZSYmKHRoaXMuX2ljb25PYmo9dGhpcy5fZ3JvdXAub3B0aW9ucy5pY29uQ3JlYXRlRnVuY3Rpb24odGhpcyksdGhpcy5faWNvbk5lZWRzVXBkYXRlPSExKSx0aGlzLl9pY29uT2JqLmNyZWF0ZUljb24oKX0sY3JlYXRlU2hhZG93OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ljb25PYmouY3JlYXRlU2hhZG93KCl9LF9hZGRDaGlsZDpmdW5jdGlvbih0LGUpe3RoaXMuX2ljb25OZWVkc1VwZGF0ZT0hMCx0aGlzLl9leHBhbmRCb3VuZHModCksdCBpbnN0YW5jZW9mIEwuTWFya2VyQ2x1c3Rlcj8oZXx8KHRoaXMuX2NoaWxkQ2x1c3RlcnMucHVzaCh0KSx0Ll9fcGFyZW50PXRoaXMpLHRoaXMuX2NoaWxkQ291bnQrPXQuX2NoaWxkQ291bnQpOihlfHx0aGlzLl9tYXJrZXJzLnB1c2godCksdGhpcy5fY2hpbGRDb3VudCsrKSx0aGlzLl9fcGFyZW50JiZ0aGlzLl9fcGFyZW50Ll9hZGRDaGlsZCh0LCEwKX0sX2V4cGFuZEJvdW5kczpmdW5jdGlvbih0KXt2YXIgZSxpPXQuX3dMYXRMbmd8fHQuX2xhdGxuZzt0IGluc3RhbmNlb2YgTC5NYXJrZXJDbHVzdGVyPyh0aGlzLl9ib3VuZHMuZXh0ZW5kKHQuX2JvdW5kcyksZT10Ll9jaGlsZENvdW50KToodGhpcy5fYm91bmRzLmV4dGVuZChpKSxlPTEpLHRoaXMuX2NMYXRMbmd8fCh0aGlzLl9jTGF0TG5nPXQuX2NMYXRMbmd8fGkpO3ZhciBuPXRoaXMuX2NoaWxkQ291bnQrZTt0aGlzLl93TGF0TG5nPyh0aGlzLl93TGF0TG5nLmxhdD0oaS5sYXQqZSt0aGlzLl93TGF0TG5nLmxhdCp0aGlzLl9jaGlsZENvdW50KS9uLHRoaXMuX3dMYXRMbmcubG5nPShpLmxuZyplK3RoaXMuX3dMYXRMbmcubG5nKnRoaXMuX2NoaWxkQ291bnQpL24pOnRoaXMuX2xhdGxuZz10aGlzLl93TGF0TG5nPW5ldyBMLkxhdExuZyhpLmxhdCxpLmxuZyl9LF9hZGRUb01hcDpmdW5jdGlvbih0KXt0JiYodGhpcy5fYmFja3VwTGF0bG5nPXRoaXMuX2xhdGxuZyx0aGlzLnNldExhdExuZyh0KSksdGhpcy5fZ3JvdXAuX2ZlYXR1cmVHcm91cC5hZGRMYXllcih0aGlzKX0sX3JlY3Vyc2l2ZWx5QW5pbWF0ZUNoaWxkcmVuSW46ZnVuY3Rpb24odCxlLGkpe3RoaXMuX3JlY3Vyc2l2ZWx5KHQsMCxpLTEsZnVuY3Rpb24odCl7dmFyIGksbixzPXQuX21hcmtlcnM7Zm9yKGk9cy5sZW5ndGgtMTtpPj0wO2ktLSluPXNbaV0sbi5faWNvbiYmKG4uX3NldFBvcyhlKSxuLnNldE9wYWNpdHkoMCkpfSxmdW5jdGlvbih0KXt2YXIgaSxuLHM9dC5fY2hpbGRDbHVzdGVycztmb3IoaT1zLmxlbmd0aC0xO2k+PTA7aS0tKW49c1tpXSxuLl9pY29uJiYobi5fc2V0UG9zKGUpLG4uc2V0T3BhY2l0eSgwKSl9KX0sX3JlY3Vyc2l2ZWx5QW5pbWF0ZUNoaWxkcmVuSW5BbmRBZGRTZWxmVG9NYXA6ZnVuY3Rpb24odCxlLGkpe3RoaXMuX3JlY3Vyc2l2ZWx5KHQsaSwwLGZ1bmN0aW9uKG4pe24uX3JlY3Vyc2l2ZWx5QW5pbWF0ZUNoaWxkcmVuSW4odCxuLl9ncm91cC5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChuLmdldExhdExuZygpKS5yb3VuZCgpLGUpLG4uX2lzU2luZ2xlUGFyZW50KCkmJmUtMT09PWk/KG4uc2V0T3BhY2l0eSgxKSxuLl9yZWN1cnNpdmVseVJlbW92ZUNoaWxkcmVuRnJvbU1hcCh0LGUpKTpuLnNldE9wYWNpdHkoMCksbi5fYWRkVG9NYXAoKX0pfSxfcmVjdXJzaXZlbHlCZWNvbWVWaXNpYmxlOmZ1bmN0aW9uKHQsZSl7dGhpcy5fcmVjdXJzaXZlbHkodCwwLGUsbnVsbCxmdW5jdGlvbih0KXt0LnNldE9wYWNpdHkoMSl9KX0sX3JlY3Vyc2l2ZWx5QWRkQ2hpbGRyZW5Ub01hcDpmdW5jdGlvbih0LGUsaSl7dGhpcy5fcmVjdXJzaXZlbHkoaSwtMSxlLGZ1bmN0aW9uKG4pe2lmKGUhPT1uLl96b29tKWZvcih2YXIgcz1uLl9tYXJrZXJzLmxlbmd0aC0xO3M+PTA7cy0tKXt2YXIgcj1uLl9tYXJrZXJzW3NdO2kuY29udGFpbnMoci5fbGF0bG5nKSYmKHQmJihyLl9iYWNrdXBMYXRsbmc9ci5nZXRMYXRMbmcoKSxyLnNldExhdExuZyh0KSxyLnNldE9wYWNpdHkmJnIuc2V0T3BhY2l0eSgwKSksbi5fZ3JvdXAuX2ZlYXR1cmVHcm91cC5hZGRMYXllcihyKSl9fSxmdW5jdGlvbihlKXtlLl9hZGRUb01hcCh0KX0pfSxfcmVjdXJzaXZlbHlSZXN0b3JlQ2hpbGRQb3NpdGlvbnM6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXRoaXMuX21hcmtlcnMubGVuZ3RoLTE7ZT49MDtlLS0pe3ZhciBpPXRoaXMuX21hcmtlcnNbZV07aS5fYmFja3VwTGF0bG5nJiYoaS5zZXRMYXRMbmcoaS5fYmFja3VwTGF0bG5nKSxkZWxldGUgaS5fYmFja3VwTGF0bG5nKX1pZih0LTE9PT10aGlzLl96b29tKWZvcih2YXIgbj10aGlzLl9jaGlsZENsdXN0ZXJzLmxlbmd0aC0xO24+PTA7bi0tKXRoaXMuX2NoaWxkQ2x1c3RlcnNbbl0uX3Jlc3RvcmVQb3NpdGlvbigpO2Vsc2UgZm9yKHZhciBzPXRoaXMuX2NoaWxkQ2x1c3RlcnMubGVuZ3RoLTE7cz49MDtzLS0pdGhpcy5fY2hpbGRDbHVzdGVyc1tzXS5fcmVjdXJzaXZlbHlSZXN0b3JlQ2hpbGRQb3NpdGlvbnModCl9LF9yZXN0b3JlUG9zaXRpb246ZnVuY3Rpb24oKXt0aGlzLl9iYWNrdXBMYXRsbmcmJih0aGlzLnNldExhdExuZyh0aGlzLl9iYWNrdXBMYXRsbmcpLGRlbGV0ZSB0aGlzLl9iYWNrdXBMYXRsbmcpfSxfcmVjdXJzaXZlbHlSZW1vdmVDaGlsZHJlbkZyb21NYXA6ZnVuY3Rpb24odCxlLGkpe3ZhciBuLHM7dGhpcy5fcmVjdXJzaXZlbHkodCwtMSxlLTEsZnVuY3Rpb24odCl7Zm9yKHM9dC5fbWFya2Vycy5sZW5ndGgtMTtzPj0wO3MtLSluPXQuX21hcmtlcnNbc10saSYmaS5jb250YWlucyhuLl9sYXRsbmcpfHwodC5fZ3JvdXAuX2ZlYXR1cmVHcm91cC5yZW1vdmVMYXllcihuKSxuLnNldE9wYWNpdHkmJm4uc2V0T3BhY2l0eSgxKSl9LGZ1bmN0aW9uKHQpe2ZvcihzPXQuX2NoaWxkQ2x1c3RlcnMubGVuZ3RoLTE7cz49MDtzLS0pbj10Ll9jaGlsZENsdXN0ZXJzW3NdLGkmJmkuY29udGFpbnMobi5fbGF0bG5nKXx8KHQuX2dyb3VwLl9mZWF0dXJlR3JvdXAucmVtb3ZlTGF5ZXIobiksbi5zZXRPcGFjaXR5JiZuLnNldE9wYWNpdHkoMSkpfSl9LF9yZWN1cnNpdmVseTpmdW5jdGlvbih0LGUsaSxuLHMpe3ZhciByLG8sYT10aGlzLl9jaGlsZENsdXN0ZXJzLGg9dGhpcy5fem9vbTtpZihlPmgpZm9yKHI9YS5sZW5ndGgtMTtyPj0wO3ItLSlvPWFbcl0sdC5pbnRlcnNlY3RzKG8uX2JvdW5kcykmJm8uX3JlY3Vyc2l2ZWx5KHQsZSxpLG4scyk7ZWxzZSBpZihuJiZuKHRoaXMpLHMmJnRoaXMuX3pvb209PT1pJiZzKHRoaXMpLGk+aClmb3Iocj1hLmxlbmd0aC0xO3I+PTA7ci0tKW89YVtyXSx0LmludGVyc2VjdHMoby5fYm91bmRzKSYmby5fcmVjdXJzaXZlbHkodCxlLGksbixzKX0sX3JlY2FsY3VsYXRlQm91bmRzOmZ1bmN0aW9uKCl7dmFyIHQsZT10aGlzLl9tYXJrZXJzLGk9dGhpcy5fY2hpbGRDbHVzdGVycztmb3IodGhpcy5fYm91bmRzPW5ldyBMLkxhdExuZ0JvdW5kcyxkZWxldGUgdGhpcy5fd0xhdExuZyx0PWUubGVuZ3RoLTE7dD49MDt0LS0pdGhpcy5fZXhwYW5kQm91bmRzKGVbdF0pO2Zvcih0PWkubGVuZ3RoLTE7dD49MDt0LS0pdGhpcy5fZXhwYW5kQm91bmRzKGlbdF0pfSxfaXNTaW5nbGVQYXJlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY2hpbGRDbHVzdGVycy5sZW5ndGg+MCYmdGhpcy5fY2hpbGRDbHVzdGVyc1swXS5fY2hpbGRDb3VudD09PXRoaXMuX2NoaWxkQ291bnR9fSksTC5EaXN0YW5jZUdyaWQ9ZnVuY3Rpb24odCl7dGhpcy5fY2VsbFNpemU9dCx0aGlzLl9zcUNlbGxTaXplPXQqdCx0aGlzLl9ncmlkPXt9LHRoaXMuX29iamVjdFBvaW50PXt9fSxMLkRpc3RhbmNlR3JpZC5wcm90b3R5cGU9e2FkZE9iamVjdDpmdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2dldENvb3JkKGUueCksbj10aGlzLl9nZXRDb29yZChlLnkpLHM9dGhpcy5fZ3JpZCxyPXNbbl09c1tuXXx8e30sbz1yW2ldPXJbaV18fFtdLGE9TC5VdGlsLnN0YW1wKHQpO3RoaXMuX29iamVjdFBvaW50W2FdPWUsby5wdXNoKHQpfSx1cGRhdGVPYmplY3Q6ZnVuY3Rpb24odCxlKXt0aGlzLnJlbW92ZU9iamVjdCh0KSx0aGlzLmFkZE9iamVjdCh0LGUpfSxyZW1vdmVPYmplY3Q6ZnVuY3Rpb24odCxlKXt2YXIgaSxuLHM9dGhpcy5fZ2V0Q29vcmQoZS54KSxyPXRoaXMuX2dldENvb3JkKGUueSksbz10aGlzLl9ncmlkLGE9b1tyXT1vW3JdfHx7fSxoPWFbc109YVtzXXx8W107Zm9yKGRlbGV0ZSB0aGlzLl9vYmplY3RQb2ludFtMLlV0aWwuc3RhbXAodCldLGk9MCxuPWgubGVuZ3RoO24+aTtpKyspaWYoaFtpXT09PXQpcmV0dXJuIGguc3BsaWNlKGksMSksMT09PW4mJmRlbGV0ZSBhW3NdLCEwfSxlYWNoT2JqZWN0OmZ1bmN0aW9uKHQsZSl7dmFyIGksbixzLHIsbyxhLGgsXz10aGlzLl9ncmlkO2ZvcihpIGluIF8pe289X1tpXTtmb3IobiBpbiBvKWZvcihhPW9bbl0scz0wLHI9YS5sZW5ndGg7cj5zO3MrKyloPXQuY2FsbChlLGFbc10pLGgmJihzLS0sci0tKX19LGdldE5lYXJPYmplY3Q6ZnVuY3Rpb24odCl7dmFyIGUsaSxuLHMscixvLGEsaCxfPXRoaXMuX2dldENvb3JkKHQueCksdT10aGlzLl9nZXRDb29yZCh0LnkpLGw9dGhpcy5fb2JqZWN0UG9pbnQsZD10aGlzLl9zcUNlbGxTaXplLHA9bnVsbDtmb3IoZT11LTE7dSsxPj1lO2UrKylpZihzPXRoaXMuX2dyaWRbZV0pZm9yKGk9Xy0xO18rMT49aTtpKyspaWYocj1zW2ldKWZvcihuPTAsbz1yLmxlbmd0aDtvPm47bisrKWE9cltuXSxoPXRoaXMuX3NxRGlzdChsW0wuVXRpbC5zdGFtcChhKV0sdCksZD5oJiYoZD1oLHA9YSk7cmV0dXJuIHB9LF9nZXRDb29yZDpmdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5mbG9vcih0L3RoaXMuX2NlbGxTaXplKX0sX3NxRGlzdDpmdW5jdGlvbih0LGUpe3ZhciBpPWUueC10Lngsbj1lLnktdC55O3JldHVybiBpKmkrbipufX0sZnVuY3Rpb24oKXtMLlF1aWNrSHVsbD17Z2V0RGlzdGFudDpmdW5jdGlvbih0LGUpe3ZhciBpPWVbMV0ubGF0LWVbMF0ubGF0LG49ZVswXS5sbmctZVsxXS5sbmc7cmV0dXJuIG4qKHQubGF0LWVbMF0ubGF0KStpKih0LmxuZy1lWzBdLmxuZyl9LGZpbmRNb3N0RGlzdGFudFBvaW50RnJvbUJhc2VMaW5lOmZ1bmN0aW9uKHQsZSl7dmFyIGksbixzLHI9MCxvPW51bGwsYT1bXTtmb3IoaT1lLmxlbmd0aC0xO2k+PTA7aS0tKW49ZVtpXSxzPXRoaXMuZ2V0RGlzdGFudChuLHQpLHM+MCYmKGEucHVzaChuKSxzPnImJihyPXMsbz1uKSk7cmV0dXJue21heFBvaW50Om8sbmV3UG9pbnRzOmF9fSxidWlsZENvbnZleEh1bGw6ZnVuY3Rpb24odCxlKXt2YXIgaT1bXSxuPXRoaXMuZmluZE1vc3REaXN0YW50UG9pbnRGcm9tQmFzZUxpbmUodCxlKTtyZXR1cm4gbi5tYXhQb2ludD8oaT1pLmNvbmNhdCh0aGlzLmJ1aWxkQ29udmV4SHVsbChbdFswXSxuLm1heFBvaW50XSxuLm5ld1BvaW50cykpLGk9aS5jb25jYXQodGhpcy5idWlsZENvbnZleEh1bGwoW24ubWF4UG9pbnQsdFsxXV0sbi5uZXdQb2ludHMpKSk6W3RbMF1dfSxnZXRDb252ZXhIdWxsOmZ1bmN0aW9uKHQpe3ZhciBlLGk9ITEsbj0hMSxzPW51bGwscj1udWxsO2ZvcihlPXQubGVuZ3RoLTE7ZT49MDtlLS0pe3ZhciBvPXRbZV07KGk9PT0hMXx8by5sYXQ+aSkmJihzPW8saT1vLmxhdCksKG49PT0hMXx8by5sYXQ8bikmJihyPW8sbj1vLmxhdCl9dmFyIGE9W10uY29uY2F0KHRoaXMuYnVpbGRDb252ZXhIdWxsKFtyLHNdLHQpLHRoaXMuYnVpbGRDb252ZXhIdWxsKFtzLHJdLHQpKTtyZXR1cm4gYX19fSgpLEwuTWFya2VyQ2x1c3Rlci5pbmNsdWRlKHtnZXRDb252ZXhIdWxsOmZ1bmN0aW9uKCl7dmFyIHQsZSxpPXRoaXMuZ2V0QWxsQ2hpbGRNYXJrZXJzKCksbj1bXTtmb3IoZT1pLmxlbmd0aC0xO2U+PTA7ZS0tKXQ9aVtlXS5nZXRMYXRMbmcoKSxuLnB1c2godCk7cmV0dXJuIEwuUXVpY2tIdWxsLmdldENvbnZleEh1bGwobil9fSksTC5NYXJrZXJDbHVzdGVyLmluY2x1ZGUoe18yUEk6MipNYXRoLlBJLF9jaXJjbGVGb290U2VwYXJhdGlvbjoyNSxfY2lyY2xlU3RhcnRBbmdsZTpNYXRoLlBJLzYsX3NwaXJhbEZvb3RTZXBhcmF0aW9uOjI4LF9zcGlyYWxMZW5ndGhTdGFydDoxMSxfc3BpcmFsTGVuZ3RoRmFjdG9yOjUsX2NpcmNsZVNwaXJhbFN3aXRjaG92ZXI6OSxzcGlkZXJmeTpmdW5jdGlvbigpe2lmKHRoaXMuX2dyb3VwLl9zcGlkZXJmaWVkIT09dGhpcyYmIXRoaXMuX2dyb3VwLl9pblpvb21BbmltYXRpb24pe3ZhciB0LGU9dGhpcy5nZXRBbGxDaGlsZE1hcmtlcnMoKSxpPXRoaXMuX2dyb3VwLG49aS5fbWFwLHM9bi5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fbGF0bG5nKTt0aGlzLl9ncm91cC5fdW5zcGlkZXJmeSgpLHRoaXMuX2dyb3VwLl9zcGlkZXJmaWVkPXRoaXMsZS5sZW5ndGg+PXRoaXMuX2NpcmNsZVNwaXJhbFN3aXRjaG92ZXI/dD10aGlzLl9nZW5lcmF0ZVBvaW50c1NwaXJhbChlLmxlbmd0aCxzKToocy55Kz0xMCx0PXRoaXMuX2dlbmVyYXRlUG9pbnRzQ2lyY2xlKGUubGVuZ3RoLHMpKSx0aGlzLl9hbmltYXRpb25TcGlkZXJmeShlLHQpfX0sdW5zcGlkZXJmeTpmdW5jdGlvbih0KXt0aGlzLl9ncm91cC5faW5ab29tQW5pbWF0aW9ufHwodGhpcy5fYW5pbWF0aW9uVW5zcGlkZXJmeSh0KSx0aGlzLl9ncm91cC5fc3BpZGVyZmllZD1udWxsKX0sX2dlbmVyYXRlUG9pbnRzQ2lyY2xlOmZ1bmN0aW9uKHQsZSl7dmFyIGksbixzPXRoaXMuX2dyb3VwLm9wdGlvbnMuc3BpZGVyZnlEaXN0YW5jZU11bHRpcGxpZXIqdGhpcy5fY2lyY2xlRm9vdFNlcGFyYXRpb24qKDIrdCkscj1zL3RoaXMuXzJQSSxvPXRoaXMuXzJQSS90LGE9W107Zm9yKGEubGVuZ3RoPXQsaT10LTE7aT49MDtpLS0pbj10aGlzLl9jaXJjbGVTdGFydEFuZ2xlK2kqbyxhW2ldPW5ldyBMLlBvaW50KGUueCtyKk1hdGguY29zKG4pLGUueStyKk1hdGguc2luKG4pKS5fcm91bmQoKTtyZXR1cm4gYX0sX2dlbmVyYXRlUG9pbnRzU3BpcmFsOmZ1bmN0aW9uKHQsZSl7dmFyIGksbj10aGlzLl9ncm91cC5vcHRpb25zLnNwaWRlcmZ5RGlzdGFuY2VNdWx0aXBsaWVyKnRoaXMuX3NwaXJhbExlbmd0aFN0YXJ0LHM9dGhpcy5fZ3JvdXAub3B0aW9ucy5zcGlkZXJmeURpc3RhbmNlTXVsdGlwbGllcip0aGlzLl9zcGlyYWxGb290U2VwYXJhdGlvbixyPXRoaXMuX2dyb3VwLm9wdGlvbnMuc3BpZGVyZnlEaXN0YW5jZU11bHRpcGxpZXIqdGhpcy5fc3BpcmFsTGVuZ3RoRmFjdG9yLG89MCxhPVtdO2ZvcihhLmxlbmd0aD10LGk9dC0xO2k+PTA7aS0tKW8rPXMvbis1ZS00KmksYVtpXT1uZXcgTC5Qb2ludChlLngrbipNYXRoLmNvcyhvKSxlLnkrbipNYXRoLnNpbihvKSkuX3JvdW5kKCksbis9dGhpcy5fMlBJKnIvbztyZXR1cm4gYX0sX25vYW5pbWF0aW9uVW5zcGlkZXJmeTpmdW5jdGlvbigpe3ZhciB0LGUsaT10aGlzLl9ncm91cCxuPWkuX21hcCxzPWkuX2ZlYXR1cmVHcm91cCxyPXRoaXMuZ2V0QWxsQ2hpbGRNYXJrZXJzKCk7Zm9yKHRoaXMuc2V0T3BhY2l0eSgxKSxlPXIubGVuZ3RoLTE7ZT49MDtlLS0pdD1yW2VdLHMucmVtb3ZlTGF5ZXIodCksdC5fcHJlU3BpZGVyZnlMYXRsbmcmJih0LnNldExhdExuZyh0Ll9wcmVTcGlkZXJmeUxhdGxuZyksZGVsZXRlIHQuX3ByZVNwaWRlcmZ5TGF0bG5nKSx0LnNldFpJbmRleE9mZnNldCYmdC5zZXRaSW5kZXhPZmZzZXQoMCksdC5fc3BpZGVyTGVnJiYobi5yZW1vdmVMYXllcih0Ll9zcGlkZXJMZWcpLGRlbGV0ZSB0Ll9zcGlkZXJMZWcpO2kuX3NwaWRlcmZpZWQ9bnVsbH19KSxMLk1hcmtlckNsdXN0ZXIuaW5jbHVkZShMLkRvbVV0aWwuVFJBTlNJVElPTj97U1ZHX0FOSU1BVElPTjpmdW5jdGlvbigpe3JldHVybiBlLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJhbmltYXRlXCIpLnRvU3RyaW5nKCkuaW5kZXhPZihcIlNWR0FuaW1hdGVcIik+LTF9KCksX2FuaW1hdGlvblNwaWRlcmZ5OmZ1bmN0aW9uKHQsaSl7dmFyIG4scyxyLG8sYT10aGlzLGg9dGhpcy5fZ3JvdXAsXz1oLl9tYXAsdT1oLl9mZWF0dXJlR3JvdXAsbD1fLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpO2ZvcihuPXQubGVuZ3RoLTE7bj49MDtuLS0pcz10W25dLHMuc2V0T3BhY2l0eT8ocy5zZXRaSW5kZXhPZmZzZXQoMWU2KSxzLnNldE9wYWNpdHkoMCksdS5hZGRMYXllcihzKSxzLl9zZXRQb3MobCkpOnUuYWRkTGF5ZXIocyk7aC5fZm9yY2VMYXlvdXQoKSxoLl9hbmltYXRpb25TdGFydCgpO3ZhciBkPUwuUGF0aC5TVkc/MDouMyxwPUwuUGF0aC5TVkdfTlM7Zm9yKG49dC5sZW5ndGgtMTtuPj0wO24tLSlpZihvPV8ubGF5ZXJQb2ludFRvTGF0TG5nKGlbbl0pLHM9dFtuXSxzLl9wcmVTcGlkZXJmeUxhdGxuZz1zLl9sYXRsbmcscy5zZXRMYXRMbmcobykscy5zZXRPcGFjaXR5JiZzLnNldE9wYWNpdHkoMSkscj1uZXcgTC5Qb2x5bGluZShbYS5fbGF0bG5nLG9dLHt3ZWlnaHQ6MS41LGNvbG9yOlwiIzIyMlwiLG9wYWNpdHk6ZH0pLF8uYWRkTGF5ZXIocikscy5fc3BpZGVyTGVnPXIsTC5QYXRoLlNWRyYmdGhpcy5TVkdfQU5JTUFUSU9OKXt2YXIgYz1yLl9wYXRoLmdldFRvdGFsTGVuZ3RoKCk7ci5fcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtZGFzaGFycmF5XCIsYytcIixcIitjKTt2YXIgZj1lLmNyZWF0ZUVsZW1lbnROUyhwLFwiYW5pbWF0ZVwiKTtmLnNldEF0dHJpYnV0ZShcImF0dHJpYnV0ZU5hbWVcIixcInN0cm9rZS1kYXNob2Zmc2V0XCIpLGYuc2V0QXR0cmlidXRlKFwiYmVnaW5cIixcImluZGVmaW5pdGVcIiksZi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsYyksZi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLDApLGYuc2V0QXR0cmlidXRlKFwiZHVyXCIsLjI1KSxyLl9wYXRoLmFwcGVuZENoaWxkKGYpLGYuYmVnaW5FbGVtZW50KCksZj1lLmNyZWF0ZUVsZW1lbnROUyhwLFwiYW5pbWF0ZVwiKSxmLnNldEF0dHJpYnV0ZShcImF0dHJpYnV0ZU5hbWVcIixcInN0cm9rZS1vcGFjaXR5XCIpLGYuc2V0QXR0cmlidXRlKFwiYXR0cmlidXRlTmFtZVwiLFwic3Ryb2tlLW9wYWNpdHlcIiksZi5zZXRBdHRyaWJ1dGUoXCJiZWdpblwiLFwiaW5kZWZpbml0ZVwiKSxmLnNldEF0dHJpYnV0ZShcImZyb21cIiwwKSxmLnNldEF0dHJpYnV0ZShcInRvXCIsLjUpLGYuc2V0QXR0cmlidXRlKFwiZHVyXCIsLjI1KSxyLl9wYXRoLmFwcGVuZENoaWxkKGYpLGYuYmVnaW5FbGVtZW50KCl9aWYoYS5zZXRPcGFjaXR5KC4zKSxMLlBhdGguU1ZHKWZvcih0aGlzLl9ncm91cC5fZm9yY2VMYXlvdXQoKSxuPXQubGVuZ3RoLTE7bj49MDtuLS0pcz10W25dLl9zcGlkZXJMZWcscy5vcHRpb25zLm9wYWNpdHk9LjUscy5fcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utb3BhY2l0eVwiLC41KTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aC5fYW5pbWF0aW9uRW5kKCksaC5maXJlKFwic3BpZGVyZmllZFwiKX0sMjAwKX0sX2FuaW1hdGlvblVuc3BpZGVyZnk6ZnVuY3Rpb24odCl7dmFyIGUsaSxuLHM9dGhpcy5fZ3JvdXAscj1zLl9tYXAsbz1zLl9mZWF0dXJlR3JvdXAsYT10P3IuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcsdC56b29tLHQuY2VudGVyKTpyLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpLGg9dGhpcy5nZXRBbGxDaGlsZE1hcmtlcnMoKSxfPUwuUGF0aC5TVkcmJnRoaXMuU1ZHX0FOSU1BVElPTjtmb3Iocy5fYW5pbWF0aW9uU3RhcnQoKSx0aGlzLnNldE9wYWNpdHkoMSksaT1oLmxlbmd0aC0xO2k+PTA7aS0tKWU9aFtpXSxlLl9wcmVTcGlkZXJmeUxhdGxuZyYmKGUuc2V0TGF0TG5nKGUuX3ByZVNwaWRlcmZ5TGF0bG5nKSxkZWxldGUgZS5fcHJlU3BpZGVyZnlMYXRsbmcsZS5zZXRPcGFjaXR5PyhlLl9zZXRQb3MoYSksZS5zZXRPcGFjaXR5KDApKTpvLnJlbW92ZUxheWVyKGUpLF8mJihuPWUuX3NwaWRlckxlZy5fcGF0aC5jaGlsZE5vZGVzWzBdLG4uc2V0QXR0cmlidXRlKFwidG9cIixuLmdldEF0dHJpYnV0ZShcImZyb21cIikpLG4uc2V0QXR0cmlidXRlKFwiZnJvbVwiLDApLG4uYmVnaW5FbGVtZW50KCksbj1lLl9zcGlkZXJMZWcuX3BhdGguY2hpbGROb2Rlc1sxXSxuLnNldEF0dHJpYnV0ZShcImZyb21cIiwuNSksbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLDApLG4uc2V0QXR0cmlidXRlKFwic3Ryb2tlLW9wYWNpdHlcIiwwKSxuLmJlZ2luRWxlbWVudCgpLGUuX3NwaWRlckxlZy5fcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utb3BhY2l0eVwiLDApKSk7c2V0VGltZW91dChmdW5jdGlvbigpe3ZhciB0PTA7Zm9yKGk9aC5sZW5ndGgtMTtpPj0wO2ktLSllPWhbaV0sZS5fc3BpZGVyTGVnJiZ0Kys7Zm9yKGk9aC5sZW5ndGgtMTtpPj0wO2ktLSllPWhbaV0sZS5fc3BpZGVyTGVnJiYoZS5zZXRPcGFjaXR5JiYoZS5zZXRPcGFjaXR5KDEpLGUuc2V0WkluZGV4T2Zmc2V0KDApKSx0PjEmJm8ucmVtb3ZlTGF5ZXIoZSksci5yZW1vdmVMYXllcihlLl9zcGlkZXJMZWcpLGRlbGV0ZSBlLl9zcGlkZXJMZWcpO3MuX2FuaW1hdGlvbkVuZCgpfSwyMDApfX06e19hbmltYXRpb25TcGlkZXJmeTpmdW5jdGlvbih0LGUpe3ZhciBpLG4scyxyLG89dGhpcy5fZ3JvdXAsYT1vLl9tYXAsaD1vLl9mZWF0dXJlR3JvdXA7Zm9yKGk9dC5sZW5ndGgtMTtpPj0wO2ktLSlyPWEubGF5ZXJQb2ludFRvTGF0TG5nKGVbaV0pLG49dFtpXSxuLl9wcmVTcGlkZXJmeUxhdGxuZz1uLl9sYXRsbmcsbi5zZXRMYXRMbmcociksbi5zZXRaSW5kZXhPZmZzZXQmJm4uc2V0WkluZGV4T2Zmc2V0KDFlNiksaC5hZGRMYXllcihuKSxzPW5ldyBMLlBvbHlsaW5lKFt0aGlzLl9sYXRsbmcscl0se3dlaWdodDoxLjUsY29sb3I6XCIjMjIyXCJ9KSxhLmFkZExheWVyKHMpLG4uX3NwaWRlckxlZz1zO3RoaXMuc2V0T3BhY2l0eSguMyksby5maXJlKFwic3BpZGVyZmllZFwiKX0sX2FuaW1hdGlvblVuc3BpZGVyZnk6ZnVuY3Rpb24oKXt0aGlzLl9ub2FuaW1hdGlvblVuc3BpZGVyZnkoKX19KSxMLk1hcmtlckNsdXN0ZXJHcm91cC5pbmNsdWRlKHtfc3BpZGVyZmllZDpudWxsLF9zcGlkZXJmaWVyT25BZGQ6ZnVuY3Rpb24oKXt0aGlzLl9tYXAub24oXCJjbGlja1wiLHRoaXMuX3Vuc3BpZGVyZnlXcmFwcGVyLHRoaXMpLHRoaXMuX21hcC5vcHRpb25zLnpvb21BbmltYXRpb24mJnRoaXMuX21hcC5vbihcInpvb21zdGFydFwiLHRoaXMuX3Vuc3BpZGVyZnlab29tU3RhcnQsdGhpcyksdGhpcy5fbWFwLm9uKFwiem9vbWVuZFwiLHRoaXMuX25vYW5pbWF0aW9uVW5zcGlkZXJmeSx0aGlzKSxMLlBhdGguU1ZHJiYhTC5Ccm93c2VyLnRvdWNoJiZ0aGlzLl9tYXAuX2luaXRQYXRoUm9vdCgpfSxfc3BpZGVyZmllck9uUmVtb3ZlOmZ1bmN0aW9uKCl7dGhpcy5fbWFwLm9mZihcImNsaWNrXCIsdGhpcy5fdW5zcGlkZXJmeVdyYXBwZXIsdGhpcyksdGhpcy5fbWFwLm9mZihcInpvb21zdGFydFwiLHRoaXMuX3Vuc3BpZGVyZnlab29tU3RhcnQsdGhpcyksdGhpcy5fbWFwLm9mZihcInpvb21hbmltXCIsdGhpcy5fdW5zcGlkZXJmeVpvb21BbmltLHRoaXMpLHRoaXMuX3Vuc3BpZGVyZnkoKX0sX3Vuc3BpZGVyZnlab29tU3RhcnQ6ZnVuY3Rpb24oKXt0aGlzLl9tYXAmJnRoaXMuX21hcC5vbihcInpvb21hbmltXCIsdGhpcy5fdW5zcGlkZXJmeVpvb21BbmltLHRoaXMpfSxfdW5zcGlkZXJmeVpvb21BbmltOmZ1bmN0aW9uKHQpe0wuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9tYXAuX21hcFBhbmUsXCJsZWFmbGV0LXRvdWNoaW5nXCIpfHwodGhpcy5fbWFwLm9mZihcInpvb21hbmltXCIsdGhpcy5fdW5zcGlkZXJmeVpvb21BbmltLHRoaXMpLHRoaXMuX3Vuc3BpZGVyZnkodCkpfSxfdW5zcGlkZXJmeVdyYXBwZXI6ZnVuY3Rpb24oKXt0aGlzLl91bnNwaWRlcmZ5KCl9LF91bnNwaWRlcmZ5OmZ1bmN0aW9uKHQpe3RoaXMuX3NwaWRlcmZpZWQmJnRoaXMuX3NwaWRlcmZpZWQudW5zcGlkZXJmeSh0KX0sX25vYW5pbWF0aW9uVW5zcGlkZXJmeTpmdW5jdGlvbigpe3RoaXMuX3NwaWRlcmZpZWQmJnRoaXMuX3NwaWRlcmZpZWQuX25vYW5pbWF0aW9uVW5zcGlkZXJmeSgpfSxfdW5zcGlkZXJmeUxheWVyOmZ1bmN0aW9uKHQpe3QuX3NwaWRlckxlZyYmKHRoaXMuX2ZlYXR1cmVHcm91cC5yZW1vdmVMYXllcih0KSx0LnNldE9wYWNpdHkoMSksdC5zZXRaSW5kZXhPZmZzZXQoMCksdGhpcy5fbWFwLnJlbW92ZUxheWVyKHQuX3NwaWRlckxlZyksZGVsZXRlIHQuX3NwaWRlckxlZyl9fSl9KHdpbmRvdyxkb2N1bWVudCk7XG59KS5jYWxsKGdsb2JhbCwgbW9kdWxlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRcdFRoZW1hdGljOiByZXF1aXJlKCd0aGVtYXRpYycpLFxuXHRcdG1vZHVsZXM6IHtcblx0XHRcdCdJTW9kdWxlJzogcmVxdWlyZSgnaW1vZHVsZScpLFxuXHRcdFx0J0Rhc3ltZXRyaWMnOiByZXF1aXJlKCd0aGVtYXRpYy1kb3QtY2hvcm9wbGV0aCcpLFxuXHRcdFx0J0Nob3JvcGxldGgnOiByZXF1aXJlKCd0aGVtYXRpYy1jaG9yb3BsZXRoJyksXG5cdFx0XHQnRG90JzogcmVxdWlyZSgndGhlbWF0aWMtZG90JyksXG5cdFx0XHQnSGVhdG1hcCc6IHJlcXVpcmUoJ3RoZW1hdGljLWhlYXRtYXAnKSxcblx0XHRcdCdJc2FyaXRobWljJzogcmVxdWlyZSgndGhlbWF0aWMtZG90LWNob3JvcGxldGgnKVxuXHRcdH0sIFxuXHRcdGNvbnZlcnRlcnM6IHJlcXVpcmUoJ2NvbnZlcnRlcnMnKSxcblx0XHRhZ2dyZWdhdG9yczoge1xuXHRcdFx0YXZlcmFnZTogcmVxdWlyZSgnYXZlcmFnZS1hZ2dyZWdhdG9yJyksXG5cdFx0XHRzZXBhcmF0ZVZhbHVlczogcmVxdWlyZSgnc2VwYXJhdGUtdmFsdWVzLWFnZ3JlZ2F0b3InKVxuXHRcdH0sXG5cdFx0dXRpbHM6IHtcblx0XHRcdFByb21pc2VQdXJlOiByZXF1aXJlKCdwcm9taXNlLXN5bmMnKVxuXHRcdH1cblx0fTsiLCJ2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbl8gPSB3aW5kb3cuXyB8fCBfO1xudmFyIEwgPSByZXF1aXJlKCdsZWFmbGV0Jyk7XG5MID0gd2luZG93LkwgfHwgTDtcblxudmFyIElNb2R1bGUgPSByZXF1aXJlKCdpbW9kdWxlJyk7XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0cG9wdXBUZXh0OiBmdW5jdGlvbihwb2ludCkge1xuXHRcdHJldHVybiBfLmNoYWluKHBvaW50LnByb3BlcnRpZXMpLm1hcChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5ICsgXCI6IFwiICsgdmFsdWU7XG5cdFx0fSkudmFsdWUoKS5qb2luKFwiPGJyIC8+XCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIENob3JvcGxldGgob3B0cykge1xuXHR2YXIgb3B0cyA9IF8uZGVmYXVsdHMob3B0cyB8fCB7fSwgZGVmYXVsdHMpO1xuXG5cdHZhciBkYXRhTGF5ZXI7XG5cblx0dGhpcy5zaG93ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdGF0dXNDaGFuZ2VkKCdsb2FkaW5nJyk7XG5cdFx0dmFyIG1hcCA9IHRoaXMubWFwO1xuXHRcdHRoaXMuZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblxuXHRcdFx0ZGF0YUxheWVyID0gTC5nZW9Kc29uKGRhdGEsIHtcblx0XHRcdFx0c3R5bGU6IGZ1bmN0aW9uKGZlYXR1cmUpIHtcblx0XHRcdFx0XHQvLyBUT0RPIHBhcmFtZXRlcml6ZSBvdGhlciBvcHRpb25zXG5cdFx0XHRcdFx0dmFyIHZhbHVlID0gZmVhdHVyZS5wcm9wZXJ0aWVzW29wdHMuZmllbGRdO1xuXHRcdFx0XHRcdHJldHVybiB7Y29sb3I6IHRoaXMuc2NhbGUodmFsdWUpLCB3ZWlnaHQ6IDEsIG9wYWNpdHk6IDAuNywgZmlsbE9wYWNpdHk6IDAuNX07XG5cdFx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFx0b25FYWNoRmVhdHVyZTogZnVuY3Rpb24oZmVhdHVyZSwgbGF5ZXIpIHtcblx0XHRcdFx0XHR2YXIgdmFsdWUgPSB0eXBlb2Ygb3B0cy5wb3B1cFRleHQgPT09ICdmdW5jdGlvbicgPyBvcHRzLnBvcHVwVGV4dChmZWF0dXJlKSA6IG9wdHMucG9wdXBUZXh0O1xuXHRcdFx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRcdFx0bGF5ZXIuYmluZFBvcHVwKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pLmFkZFRvKG1hcCk7XG5cdFx0XHR0aGlzLnN0YXR1c0NoYW5nZWQoJ3JlYWR5Jyk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXG5cdHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tYXAucmVtb3ZlTGF5ZXIoZGF0YUxheWVyKTtcblx0fVxufVxuXG5DaG9yb3BsZXRoLnByb3RvdHlwZSA9IElNb2R1bGU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hvcm9wbGV0aDsiLCJ2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbl8gPSB3aW5kb3cuXyB8fCBfO1xudmFyIEwgPSByZXF1aXJlKCdsZWFmbGV0Jyk7XG5MID0gd2luZG93LkwgfHwgTDtcblxudmFyIElNb2R1bGUgPSByZXF1aXJlKCdpbW9kdWxlJyk7XG5cbmZ1bmN0aW9uIERvdENob3JvcGxldGgob3B0cykge1xuXHR0aGlzLmxheWVycyA9IFtdO1xuXG5cdHRoaXMuc2V0RGF0YSA9IGZ1bmN0aW9uKGRhdGEsIGZpZWxkKSB7XG5cdFx0SU1vZHVsZS5zZXREYXRhLmNhbGwodGhpcywgZGF0YSk7XG5cdFx0dGhpcy5maWVsZCA9IGZpZWxkO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXG5cdHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtYXAgPSB0aGlzLm1hcDtcblx0XHR0aGlzLnN0YXR1c0NoYW5nZWQoJ2xvYWRpbmcnKTtcblx0XHR0aGlzLmRhdGEudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG5cdFx0XHR2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRcdHZhciBkb3RzID0gcmVzdWx0cy5mZWF0dXJlcztcblxuXHRcdFx0Ly8gYXNzdW1lIHN0ZXAgaXMgaWRlbnRpY2FsIGZvciBhbGwgZGF0YVxuXHRcdFx0dmFyIGxhdFN0ZXAgPSBnZXRTdGVwKGRvdHMsICdsYXQnKTtcblx0XHRcdHZhciBsbmdTdGVwID0gZ2V0U3RlcChkb3RzLCAnbG5nJyk7XG5cblx0XHRcdC8vIHJlbW92ZSBvbGQgbGF5ZXJzXG5cdFx0XHRfLmVhY2godGhpcy5sYXllcnMsIGZ1bmN0aW9uKGl0KSB7IG1hcC5yZW1vdmVMYXllcihpdCk7IH0pO1xuXG5cdFx0XHRfLm1hcChkb3RzLCBmdW5jdGlvbihkb3QpIHtcblx0XHRcdFx0dmFyIG5vcnRoV2VzdCA9IEwubGF0TG5nKFxuXHRcdFx0XHRcdFx0ZG90Lmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdIC0gbGF0U3RlcCAvIDIsXG5cdFx0XHRcdFx0XHRkb3QuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0gLSBsbmdTdGVwIC8gMik7XG5cdFx0XHRcdHZhciBzb3V0aEVhc3QgPSBMLmxhdExuZyhcblx0XHRcdFx0XHRcdGRvdC5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSArIGxhdFN0ZXAgLyAyLFxuXHRcdFx0XHRcdFx0ZG90Lmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdICsgbG5nU3RlcCAvIDIpO1xuXHRcdFx0XHR2YXIgY29vcmRzID0gTC5sYXRMbmdCb3VuZHMobm9ydGhXZXN0LHNvdXRoRWFzdCk7XG5cblx0XHRcdFx0dmFyIHZhbHVlID0gZG90LnByb3BlcnRpZXNbdGhpcy5maWVsZF07XG5cdFx0XHRcdHZhciBjb2xvciA9IHRoaXMuc2NhbGUodmFsdWUpO1xuXG5cdFx0XHRcdHZhciByZWN0ID0gTC5yZWN0YW5nbGUoY29vcmRzLnBhZCgwLjAxKSwge2NvbG9yOiBjb2xvciwgb3BhY2l0eTogMCwgZmlsbE9wYWNpdHk6IDAuNSwgd2VpZ2h0OiAxfSlcblx0XHRcdFx0XHRcdFx0XHQuYmluZFBvcHVwKCdBdmVyYWdlIHRyYXZlbCB0aW1lOiAnICsgdmFsdWUudG9GaXhlZCgyKSArICcgbWluJylcblx0XHRcdFx0XHRcdFx0XHQuYWRkVG8obWFwKTtcblx0XHRcdFx0dGhpcy5sYXllcnMucHVzaChyZWN0KTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdGNvbnNvbGUubG9nKCdyZW5kZXIgdG9vaycsIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnQsICdtcycpO1xuXHRcdFx0dGhpcy5zdGF0dXNDaGFuZ2VkKCdyZWFkeScpO1xuXHRcdFx0XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbkRvdENob3JvcGxldGgucHJvdG90eXBlID0gSU1vZHVsZTtcblxuZnVuY3Rpb24gZ2V0U3RlcChkYXRhLCB0eXBlKSB7XG5cdGlmICh0eXBlID09ICdsYXQnKSB7XG5cdFx0dmFyIGluZGV4ID0gMTtcblx0XHR2YXIgaXNTb3J0ZWQgPSB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbmRleCA9IDA7XG5cdFx0dmFyIGlzU29ydGVkID0gZmFsc2U7XG5cdH1cblxuXHR2YXIgdmFsdWVzID0gXy5jaGFpbihkYXRhKS5tYXAoZnVuY3Rpb24oaXQpIHsgcmV0dXJuIGl0Lmdlb21ldHJ5LmNvb3JkaW5hdGVzW2luZGV4XTsgfSkudW5pcShpc1NvcnRlZCkudmFsdWUoKTtcblx0cmV0dXJuIE1hdGguYWJzKChfLmxhc3QodmFsdWVzKSAtIF8uZmlyc3QodmFsdWVzKSkgLyB2YWx1ZXMubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEb3RDaG9yb3BsZXRoOyIsInZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXyA9IHdpbmRvdy5fIHx8IF87XG5cbnZhciBMID0gcmVxdWlyZSgnbGVhZmxldCcpO1xuTCA9IHdpbmRvdy5MIHx8IEw7XG5cbnZhciBJTW9kdWxlID0gcmVxdWlyZSgnaW1vZHVsZScpO1xudmFyIE1hcmtlckNsdXN0ZXIgPSByZXF1aXJlKCdsZWFmbGV0LW1hcmtlcmNsdXN0ZXInKTtcbnJlcXVpcmUoJy4uLy4uL2xpYi9NYXJrZXJDbHVzdGVyLmNzcycpO1xucmVxdWlyZSgnLi4vLi4vbGliL01hcmtlckNsdXN0ZXIuRGVmYXVsdC5jc3MnKTtcblxudmFyIGRlZmF1bHRzID0ge1xuXHR0eXBlOiAnZG90JywgLy8gXG5cdHByb3BvcnRpb25hbFByb3BlcnR5OiB1bmRlZmluZWQsXG5cdHBvcHVwVGV4dDogZnVuY3Rpb24ocG9pbnQpIHtcblx0XHRyZXR1cm4gXy5jaGFpbihwb2ludC5wcm9wZXJ0aWVzKS5tYXAoZnVuY3Rpb24odmFsdWUsIGtleSkge1xuXHRcdFx0cmV0dXJuIGtleSArIFwiOiBcIiArIHZhbHVlO1xuXHRcdH0pLnZhbHVlKCkuam9pbihcIjxiciAvPlwiKTtcblx0fSxcblx0Y2x1c3RlcjogdHJ1ZSxcblx0bWF4Q2x1c3RlclJhZGl1czogNTAsIFxuXHRzaG93Q292ZXJhZ2VPbkhvdmVyOiBmYWxzZVxufVxuXG5mdW5jdGlvbiBEb3Qob3B0cykge1xuXG5cdHZhciBvcHRzID0gXy5kZWZhdWx0cyhvcHRzIHx8IHt9LCBkZWZhdWx0cyk7XG5cblx0dmFyIGNsdXN0ZXJPcHRzID0gXy5vbWl0KG9wdHMsICdwb3B1cFRleHQnLCAnY2x1c3RlcicpO1xuXG5cdHZhciBtYXJrZXJzID0gb3B0cy5jbHVzdGVyID8gbmV3IEwuTWFya2VyQ2x1c3Rlckdyb3VwKGNsdXN0ZXJPcHRzKSA6IEwubGF5ZXJHcm91cCgpO1xuXG5cdHZhciBnZXRNYXJrZXIgPSBmdW5jdGlvbihwb2ludCwgcHJvcHMpIHtcblx0XHR2YXIgbWFya2VyO1xuXHRcdHZhciBwb3B1cFRleHQgPSB0eXBlb2Ygb3B0cy5wb3B1cFRleHQgPT09ICdmdW5jdGlvbicgPyBvcHRzLnBvcHVwVGV4dChwcm9wcykgOiBvcHRzLnBvcHVwVGV4dDtcblxuXHRcdGlmIChvcHRzLnR5cGUgPT09ICdkb3QnKSB7XG5cdFx0XHRtYXJrZXIgPSBMLm1hcmtlcihwb2ludCk7XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHJhZGl1cyA9IHRoaXMuc2NhbGUgPyB0aGlzLnNjYWxlKHByb3BzLnByb3BlcnRpZXNbb3B0cy5wcm9wb3J0aW9uYWxQcm9wZXJ0eV0pIDogcHJvcHMucHJvcGVydGllc1tvcHRzLnByb3BvcnRpb25hbFByb3BlcnR5XTtcblx0XHRcdG1hcmtlciA9IEwuY2lyY2xlKHBvaW50LCByYWRpdXMsIHt3ZWlnaHQ6IDF9KTtcblx0XHR9XG5cblx0XHRpZiAocG9wdXBUZXh0KSB7XG5cdFx0XHRtYXJrZXIuYmluZFBvcHVwKHBvcHVwVGV4dCk7XG5cdFx0fVxuXHRcdHJldHVybiBtYXJrZXI7XG5cdH0uYmluZCh0aGlzKTtcblxuXHR0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBtYXAgPSB0aGlzLm1hcDtcblx0XHRpZiAoIW1hcC5oYXNMYXllcihtYXJrZXJzKSkge1xuXHRcdFx0bWFya2Vycy5hZGRUbyhtYXApO1xuXHRcdH1cblx0XHR0aGlzLnN0YXR1c0NoYW5nZWQoJ2xvYWRpbmcnKTtcblx0XHR0aGlzLmRhdGEudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRtYXJrZXJzLmNsZWFyTGF5ZXJzKCk7XG5cdFx0XHR2YXIgbGF0bG5ncyA9IF8ubWFwKGRhdGEuZmVhdHVyZXMsIGZ1bmN0aW9uKHBvaSkge1xuXHRcdFx0XHR2YXIgcG9pbnQgPSBMLmxhdExuZyhwb2kuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIHBvaS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG5cdFx0XHRcdHZhciBtYXJrZXIgPSBnZXRNYXJrZXIocG9pbnQsIHBvaSk7XG5cblx0XHRcdFx0bWFya2Vycy5hZGRMYXllcihtYXJrZXIpXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc3RhdHVzQ2hhbmdlZCgncmVhZHknKTtcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cblx0dGhpcy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1hcC5yZW1vdmVMYXllcihtYXJrZXJzKTtcblx0fVxufVxuXG5Eb3QucHJvdG90eXBlID0gSU1vZHVsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb3Q7IiwidmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5fID0gd2luZG93Ll8gfHwgXztcbnZhciBMID0gcmVxdWlyZSgnbGVhZmxldCcpO1xuTCA9IHdpbmRvdy5MIHx8IEw7XG5cblxudmFyIEhlYXRtYXBPdmVybGF5ID0gcmVxdWlyZSgnbGVhZmxldC1oZWF0bWFwJyk7XG52YXIgSU1vZHVsZSA9IHJlcXVpcmUoJ2ltb2R1bGUnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG5cdC8vIHJhZGl1cyBzaG91bGQgYmUgc21hbGwgT05MWSBpZiBzY2FsZVJhZGl1cyBpcyB0cnVlIChvciBzbWFsbCByYWRpdXMgaXMgaW50ZW5kZWQpXG5cdC8vIGlmIHNjYWxlUmFkaXVzIGlzIGZhbHNlIGl0IHdpbGwgYmUgdGhlIGNvbnN0YW50IHJhZGl1cyB1c2VkIGluIHBpeGVsc1xuXHRcInJhZGl1c1wiOiAwLjAxMixcblx0XCJtYXhPcGFjaXR5XCI6IC42LCBcblx0Ly8gc2NhbGVzIHRoZSByYWRpdXMgYmFzZWQgb24gbWFwIHpvb21cblx0XCJzY2FsZVJhZGl1c1wiOiB0cnVlLCBcblx0Ly8gaWYgc2V0IHRvIGZhbHNlIHRoZSBoZWF0bWFwIHVzZXMgdGhlIGdsb2JhbCBtYXhpbXVtIGZvciBjb2xvcml6YXRpb25cblx0Ly8gaWYgYWN0aXZhdGVkOiB1c2VzIHRoZSBkYXRhIG1heGltdW0gd2l0aGluIHRoZSBjdXJyZW50IG1hcCBib3VuZGFyaWVzIFxuXHQvLyAgICh0aGVyZSB3aWxsIGFsd2F5cyBiZSBhIHJlZCBzcG90IHdpdGggdXNlTG9jYWxFeHRyZW1hcyB0cnVlKVxuXHRcInVzZUxvY2FsRXh0cmVtYVwiOiB0cnVlLFxuXHQvLyB3aGljaCBmaWVsZCBuYW1lIGluIHlvdXIgZGF0YSByZXByZXNlbnRzIHRoZSBsYXRpdHVkZSAtIGRlZmF1bHQgXCJsYXRcIlxuXHRsYXRGaWVsZDogJ2xhdCcsXG5cdC8vIHdoaWNoIGZpZWxkIG5hbWUgaW4geW91ciBkYXRhIHJlcHJlc2VudHMgdGhlIGxvbmdpdHVkZSAtIGRlZmF1bHQgXCJsbmdcIlxuXHRsbmdGaWVsZDogJ2xuZycsXG5cdC8vIHdoaWNoIGZpZWxkIG5hbWUgaW4geW91ciBkYXRhIHJlcHJlc2VudHMgdGhlIGRhdGEgdmFsdWUgLSBkZWZhdWx0IFwidmFsdWVcIlxuXHR2YWx1ZUZpZWxkOiAndmFsdWUnXG59O1xuXG5mdW5jdGlvbiBIZWF0bWFwKGNvbmZpZykge1xuXHR2YXIgY29uZmlnID0gXy5kZWZhdWx0cyhjb25maWcgfHwge30sIGRlZmF1bHRDb25maWcpO1xuXHR0aGlzLmxheWVyID0gdW5kZWZpbmVkO1xuXHR0aGlzLnNldERhdGEgPSBmdW5jdGlvbihyYXdEYXRhKSB7IC8vIFRPRE8gcGFyYW1ldGVyaXplIG5vcm1hbGl6YXRpb25cblx0XHRyYXdEYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0dmFyIGZlYXR1cmVzID0gZGF0YS5mZWF0dXJlcztcblx0XHRcdHZhciBhdmVyYWdlID0gXy5yZWR1Y2UoZmVhdHVyZXMsIGZ1bmN0aW9uKG1lbW8sIGl0KXsgcmV0dXJuIG1lbW8gKyBpdC5wcm9wZXJ0aWVzLnRpbWU7IH0sIDApIC8gZmVhdHVyZXMubGVuZ3RoO1xuXG5cdFx0XHR2YXIgZGF0YSA9IF8ubWFwKGZlYXR1cmVzLCBmdW5jdGlvbihpdCkge1xuXHRcdFx0XHR2YXIgbWF4ID0gNTA7XG5cdFx0XHRcdHZhciB2YWx1ZSA9IG1heCAtIE1hdGgubWluKGl0LnByb3BlcnRpZXMudGltZSwgbWF4KTtcblxuXHRcdFx0XHRyZXR1cm4ge2xhdDogaXQuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGxuZzogaXQuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHZhbHVlOiB2YWx1ZSwgZXZlcnk6IGl0LnByb3BlcnRpZXMuZXZlcnl9O1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgbWF4ID0gXy5tYXgoZGF0YSwgZnVuY3Rpb24oaXQpIHsgcmV0dXJuIGl0LnRpbWU7IH0pO1xuXG5cdFx0XHR0aGlzLmxheWVyLnNldERhdGEoe1xuXHRcdFx0XHRtYXg6IG1heC50aW1lLFxuXHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHR9KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHR0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5sYXllcikge1xuXHRcdFx0dGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcik7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllciA9IG5ldyBIZWF0bWFwT3ZlcmxheShjb25maWcpO1xuXHRcdHRoaXMubWFwLmFkZExheWVyKHRoaXMubGF5ZXIpO1xuXHR9O1xufVxuXG5IZWF0bWFwLnByb3RvdHlwZSA9IElNb2R1bGU7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhdG1hcDsiLCJ2YXIgc3RhdHVzZXMgPSBbJ3JlYWR5JywgJ2xvYWRpbmcnLCAnZXJyb3InXTtcblxudmFyIElNb2R1bGUgPSB7XG5cdGlzVGhlbWF0aWNNb2R1bGU6IHRydWUsXG5cdHN0YXR1czogJ3JlYWR5JywgLy8gYnkgZGVmYXVsdCwgc3RhdHVzIGlzIHJlYWR5ICh0aGUgY2FzZSBvZiBnZXR0aW5nIGRhdGEgc3luY2hyb25vdXNseSlcblx0c2NhbGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHZhbHVlOyAvLyBpZGVudGl0eSBzY2FsZSBhcyBkZWZhdWx0XG5cdH0sXG5cdHNldFNjYWxlOiBmdW5jdGlvbihzY2FsZSkge1xuXHRcdHRoaXMuc2NhbGUgPSBzY2FsZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0c2V0RGF0YTogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuZGF0YSA9IGRhdGE7XG5cblx0XHQvLyBoYW5kbGUgcmVqZWN0ZWQgcHJvbWlzZXNcblx0XHRpZiAodGhpcy5kYXRhICYmIHR5cGVvZiB0aGlzLmRhdGEudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dGhpcy5kYXRhLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdlcnJvciBmZXRjaGluZyBkYXRhJywgYXJndW1lbnRzKTtcblx0XHRcdFx0dGhpcy5zdGF0dXNDaGFuZ2VkKCdlcnJvcicpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0YWRkVG86IGZ1bmN0aW9uKGlkLCB0aGVtYXRpYykge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5zaG93ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGVtYXRpYyBtb2R1bGVzIG11c3QgaGF2ZSBtZXRob2Qgc2hvdyBmb3IgZGlzcGxheWluZyB0aGUgZGF0YS5cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5pZCA9IGlkO1xuXHRcdHRoaXMubWFwID0gdGhlbWF0aWMubWFwO1xuXHRcdHRoaXMudGhlbWF0aWMgPSB0aGVtYXRpYztcblx0XHR0aGlzLnNob3coKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ01vZHVsZSBoYXMgbm90IGltcGxlbWVudGVkIHJlbW92ZSBtZXRob2QgLSBjYW5cXCd0IHJlbW92ZSBpdCcpO1xuXHR9LFxuXHRzdGF0dXNDaGFuZ2VkOiBmdW5jdGlvbihzdGF0dXMpIHtcblx0XHRpZiAoc3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuXHRcdFx0Y29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCBzdGF0dXMgc3RyaW5nJywgc3RhdHVzKTtcblx0XHR9XG5cdFx0dGhpcy5zdGF0dXMgPSBzdGF0dXM7XG5cdFx0dGhpcy50aGVtYXRpYy5tb2R1bGVTdGF0dXNDaGFuZ2VkKHRoaXMuaWQpO1xuXHR9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSU1vZHVsZTsiLCJ2YXIgTCA9IHJlcXVpcmUoJ2xlYWZsZXQnKTtcbkwgPSB3aW5kb3cuTCB8fCBMO1xuXG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbl8gPSB3aW5kb3cuXyB8fCBfO1xuLy9yZXF1aXJlKCcuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVhZmxldC9kaXN0L2xlYWZsZXQuY3NzJyk7XG5cbnBvbHlmaWxsUHJvbWlzZXMoKTtcblxudmFyIGRlZmF1bHRzID0ge1xuICAgIGNlbnRlcjogWzYwLjE5OTMyNCwgMjQuOTQxMDI1XSxcbiAgICB6b29tOiAxMCxcbiAgICBtYXhab29tOiAxOCxcbiAgICBhdHRyaWJ1dGlvbjogJ01hcHMgYnkgT3BlblN0cmVldE1hcCcsXG4gICAgdG1zOiBmYWxzZSxcbiAgICB0aWxlVXJsOiAnLy97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLFxuICAgIGltYWdlUGF0aDogJ2ltYWdlcy9sZWFmbGV0LycsXG4gICAgdHJhY2tWaWV3cG9ydDogZmFsc2UsXG4gICAgYXBwQ2FjaGU6ICdjb25maXJtJyAvLyBjb25maXJtLCBhdXRvLCBmYWxzZVxufTtcblxuZnVuY3Rpb24gaW5pdChlbCwgb3B0cykge1xuXG4gICAgaWYgKCFlbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGluaXRpYWxpemluZyBUaGVtYXRpYyAtIHRoZSBlbGVtZW50IGlzIG5vdCBhIERPTSBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MoZWwsICd0aGVtYXRpYy1tYXAnKTtcblxuICAgIGlmICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xuICAgIH1cblxuICAgIGFkZEluZm9QYW5lbHModGhpcywgZWwpO1xuXG4gICAgb3B0cyA9IF8uZGVmYXVsdHMob3B0cyB8fCB7fSwgZGVmYXVsdHMpO1xuXG4gICAgTC5JY29uLkRlZmF1bHQuaW1hZ2VQYXRoID0gb3B0cy5pbWFnZVBhdGg7XG5cbiAgICB2YXIgdGlsZU9wdHMgPSBfLm9taXQob3B0cywgJ2NlbnRlcicsICd6b29tJywgJ3RpbGVVcmwnLCAnaW1hZ2VQYXRoJywgJ3RyYWNrVmlld3BvcnQnKTtcblxuICAgIHRoaXMubWFwID0gTC5tYXAoZWwpLnNldFZpZXcob3B0cy5jZW50ZXIsIG9wdHMuem9vbSk7XG4gICAgTC50aWxlTGF5ZXIob3B0cy50aWxlVXJsLCB0aWxlT3B0cykuYWRkVG8odGhpcy5tYXApO1xuXG4gICAgaWYgKG9wdHMudHJhY2tWaWV3cG9ydCkge1xuICAgICAgICB0cmFja1ZpZXdwb3J0KHRoaXMsIHRoaXMubWFwKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5hcHBDYWNoZSA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgIHJlbG9hZE9uVXBkYXRlKHRydWUpO1xuICAgIH0gZWxzZSBpZiAob3B0cy5hcHBDYWNoZSA9PSAnYXV0bycpIHtcbiAgICAgICAgcmVsb2FkT25VcGRhdGUoZmFsc2UpO1xuICAgIH1cblxuICAgIHZhciBtb2R1bGVzID0gW107XG4gICAgXG4gICAgLy8gcHVibGljIG1ldGhvZHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB0aGlzLmFkZE1vZHVsZSA9IGZ1bmN0aW9uKGlkLCBtb2R1bGUpIHtcbiAgICAgICAgaWYgKCFtb2R1bGUgfHwgIW1vZHVsZS5pc1RoZW1hdGljTW9kdWxlIHx8IHR5cGVvZiBtb2R1bGUuYWRkVG8gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kdWxlIG11c3QgYmUgYSBUaGVtYXRpYy5qcyBtb2R1bGUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgbW9kdWxlLmFkZFRvKGlkLCB0aGlzKTtcbiAgICAgICAgbW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgIHRoaXMubW9kdWxlU3RhdHVzQ2hhbmdlZChpZCk7XG4gICAgICAgIHJldHVybiBtb2R1bGU7IC8vIGFsbG93IGNoYWluaW5nXG4gICAgfTtcblxuICAgIHRoaXMucmVtb3ZlTW9kdWxlID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gVE9ET1xuICAgICAgICB2YXIgbW9kdWxlID0gXy5maW5kKG1vZHVsZXMsIGZ1bmN0aW9uKGl0KSB7IHJldHVybiBpdC5pZCA9PT0gaWQ7IH0pO1xuICAgICAgICB2YXIgaSA9IG1vZHVsZXMuaW5kZXhPZihtb2R1bGUpO1xuICAgICAgICBtb2R1bGVzLnNwbGljZShpLCAxKTtcblxuICAgICAgICBtb2R1bGUucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0TW9kdWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gXy5jbG9uZShtb2R1bGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZHVsZVN0YXR1c0NoYW5nZWQgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICBfLmVhY2godGhpcy5pbmZvLCBmdW5jdGlvbihpdCkge1xuICAgICAgICAgICAgaXQuY29uZGl0aW9uKG1vZHVsZXMpID8gcmVtb3ZlQ2xhc3MoaXQuZWwsICdoaWRlJykgOiBhZGRDbGFzcyhpdC5lbCwgJ2hpZGUnKTsgXG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIFRPRE86IHRoaXMgbWF5IGJlIGJldHRlciBkb25lIG1hbnVhbGx5IHdoZW4gdXNpbmcgdGhpcyBsaWJyYXJ5XG5mdW5jdGlvbiBwb2x5ZmlsbFByb21pc2VzKCkge1xuICAgIGlmICghKCdQcm9taXNlJyBpbiB3aW5kb3cpICYmICdFUzZQcm9taXNlJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgd2luZG93LlByb21pc2UgPSBFUzZQcm9taXNlLlByb21pc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWxvYWRPblVwZGF0ZShjb25maXJtUmVsb2FkKSB7XG4gICAgaWYgKHdpbmRvdy5hcHBsaWNhdGlvbkNhY2hlKSB7XG4gICAgICBhcHBsaWNhdGlvbkNhY2hlLmFkZEV2ZW50TGlzdGVuZXIoJ3VwZGF0ZXJlYWR5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghY29uZmlybVJlbG9hZCB8fCBjb25maXJtKCdBbiB1cGRhdGUgaXMgYXZhaWxhYmxlLiBSZWxvYWQgbm93PycpKSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrVmlld3BvcnQodGhlbWF0aWMsIG1hcCkge1xuICAgIGZ1bmN0aW9uIHNldEhhc2goY2VudGVyLCB6b29tKSB7XG4gICAgICAgIHZhciBoYXNoID0gJyMnICsgY2VudGVyLmxhdCArICcsJyArIGNlbnRlci5sbmcgKyAnLycgKyB6b29tO1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVMb2NhdGlvbigpIHtcbiAgICAgICAgc2V0SGFzaChtYXAuZ2V0Q2VudGVyKCksIG1hcC5nZXRab29tKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlTG9jYXRpb24oaGFzaCkge1xuICAgICAgICB2YXIgcmUgPSAvKFswLTlcXC5dKyksKFswLTlcXC5dKylcXC8oWzAtOV0rKS87XG4gICAgICAgIHZhciBwYXJ0cyA9IGhhc2gubWF0Y2gocmUpXG4gICAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICAgICAgcmV0dXJuIHtjZW50ZXI6IG5ldyBMLkxhdExuZyhwYXJ0c1sxXSwgcGFydHNbMl0pLCB6b29tOiBwYXJ0c1szXX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICB2YXIgbG9jYXRpb24gPSBwYXJzZUxvY2F0aW9uKGRvY3VtZW50LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgbWFwLnNldFZpZXcobG9jYXRpb24uY2VudGVyLCBsb2NhdGlvbi56b29tKTtcbiAgICB9XG5cbiAgICBtYXAub24oJ21vdmVlbmQnLCB1cGRhdGVMb2NhdGlvbik7XG4gICAgbWFwLm9uKCd6b29tZW5kJywgdXBkYXRlTG9jYXRpb24pXG59XG5cbmZ1bmN0aW9uIGFkZEluZm9QYW5lbHModGhlbWF0aWMsIGVsKSB7XG4gICAgdmFyIHNwaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzcGlubmVyRGl2LmNsYXNzTmFtZSA9ICdsb2FkaW5nLWluZGljYXRvcic7XG4gICAgdmFyIHNwaW5uZXJJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBzcGlubmVySW1nLnNyYyA9IFwiL2ltYWdlcy9sb2FkaW5nLXNwaW4uc3ZnXCI7XG4gICAgc3Bpbm5lckRpdi5hcHBlbmRDaGlsZChzcGlubmVySW1nKTtcbiAgICBlbC5hcHBlbmRDaGlsZChzcGlubmVyRGl2KTtcblxuICAgIHZhciBlcnJvckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVycm9yRGl2LmNsYXNzTmFtZSA9ICdlcnJvci1tZXNzYWdlIGhpZGUnO1xuICAgIHZhciBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbWVzc2FnZURpdi5jbGFzc05hbWUgPSAnZXJyb3ItdGV4dCc7XG4gICAgbWVzc2FnZURpdi50ZXh0Q29udGVudCA9ICdFcnJvciBsb2FkaW5nIGNvbnRlbnQuJztcbiAgICBlcnJvckRpdi5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcbiAgICBlbC5hcHBlbmRDaGlsZChlcnJvckRpdik7XG5cbiAgICB0aGVtYXRpYy5pbmZvID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uKG1vZHVsZXMpIHsgXG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uc29tZShtb2R1bGVzLCBmdW5jdGlvbihpdCkgeyByZXR1cm4gaXQuc3RhdHVzID09PSAnbG9hZGluZyc7IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVsOiBzcGlubmVyRGl2XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24obW9kdWxlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLnNvbWUobW9kdWxlcywgZnVuY3Rpb24oaXQpIHsgcmV0dXJuIGl0LnN0YXR1cyA9PT0gJ2Vycm9yJzsgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWw6IGVycm9yRGl2XG4gICAgICAgIH1cbiAgICBdO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgY2xhc3NOYW1lKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gXy5maWx0ZXIoZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGl0KSB7IHJldHVybiBpdCAhPT0gY2xhc3NOYW1lIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSkge1xuICAgIHZhciBjbGFzc2VzID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgY2xhc3Nlcy5wdXNoKGNsYXNzTmFtZSk7XG4gICAgZWwuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0OyIsInZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXyA9IHdpbmRvdy5fIHx8IF87XG5cbmZ1bmN0aW9uIGdldEltcG9ydGFuY2UocHJvcHMpIHtcblx0cmV0dXJuIHR5cGVvZiBwcm9wcy5pbXBvcnRhbmNlID09PSAnbnVtYmVyJyA/IHByb3BzLmltcG9ydGFuY2UgOiAxO1xufVxuXG5mdW5jdGlvbiBnZXRBdmVyYWdlKHZhbHVlcywgZmllbGQpIHtcblx0dmFyIHRvdGFsID0gXy5yZWR1Y2UodmFsdWVzLCBmdW5jdGlvbihtZW1vLCBpdCkgeyByZXR1cm4gbWVtbyArIGdldEltcG9ydGFuY2UoaXQpOyB9LCAwKTtcblx0cmV0dXJuIF8ucmVkdWNlKHZhbHVlcywgZnVuY3Rpb24obWVtbywgaXQpIHsgcmV0dXJuIG1lbW8gKyBpdFtmaWVsZF0gKiBnZXRJbXBvcnRhbmNlKGl0KTsgfSwgMCkgLyB0b3RhbDtcbn1cblxuZnVuY3Rpb24gYWdncmVnYXRlKGRhdGEsIGZpZWxkKSB7XG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHR2YXIgZG90cyA9IF8uY2hhaW4oZGF0YSkubWFwKGZ1bmN0aW9uKGl0KSB7IHJldHVybiBpdC5mZWF0dXJlczsgfSkuZmxhdHRlbigpLmdyb3VwQnkoZnVuY3Rpb24oaXQpIHsgcmV0dXJuIGl0Lmdlb21ldHJ5LmNvb3JkaW5hdGVzOyB9KS52YWx1ZSgpO1xuXHR2YXIgYWdncmVnYXRlID0gXy5tYXAoZG90cywgZnVuY3Rpb24oZ3JvdXApIHtcblx0XHR2YXIgcHJvcHMgPSB7fTtcblxuXHRcdHByb3BzW2ZpZWxkXSA9IGdldEF2ZXJhZ2UoXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKGl0KSB7IHJldHVybiBpdC5wcm9wZXJ0aWVzOyB9KSwgZmllbGQpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdlb21ldHJ5OiBncm91cFswXS5nZW9tZXRyeSxcblx0XHRcdHByb3BlcnRpZXM6IHByb3BzXG5cdFx0fTtcblx0fSk7XG5cblx0Y29uc29sZS5sb2coJ2FnZ3JlZ2F0ZSB0b29rJywgbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCwgJ21zJyk7XG5cblx0cmV0dXJuIHtcblx0XHRmZWF0dXJlczogYWdncmVnYXRlLFxuXHRcdHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIlxuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFnZ3JlZ2F0ZTsiLCJ2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnLCAnXycpO1xuXyA9IHdpbmRvdy5fIHx8IF87XG5cbnZhciBjb252ZXJ0ZXJzID0ge1xuXHQvKipcblx0ICogQ29udmVydHMgZnJvbSBcImZsYXRcIiBKU09OIGZvcm1hdCB0byBHZW9KU09OIHBvaW50IEZlYXR1cmVDb2xsZWN0aW9uIHVzZWQgYnkgVGhlbWF0aWMuanMuXG5cdCAqIEZsYXQgaW5wdXQgZm9ybWF0IGlzIGEgY3VzdG9tIGZvcm1hdCB3aGljaCBjb25zaXN0cyBvZiBhcnJheSBvZiBKU09OIG9iamVjdHMuIEpTT04gXG5cdCAqIG9iamVjdHMgY29udGFpbiBcImxhdGl0dWRlXCIgYW5kIFwibG9uZ2l0dWRlXCIgcHJvcGVydGllcyBhbmQsIG9wdGlvbmFsbHksIG90aGVyIHByb3BlcnRpZXMuXG5cdCAqIElucHV0IGZvcm1hdCBleGFtcGxlOlxuXHQgKiBbXG5cdCAqXHRcdHtcblx0ICpcdFx0XHRzdG9yZUlkOiBcIjIxMDJcIixcblx0ICpcdFx0XHRuYW1lOiBcIkhlbHNpbmtpIGtlc2t1c3RhIEFya2FkaWFcIixcblx0ICpcdFx0XHR1cmw6IFwiL215eW1hbGF0LzIxMDIvXCIsXG5cdCAqIFx0XHRcdGxhdGl0dWRlOiA2MC4xNzA4MTQsXG5cdCAqXHRcdFx0bG9uZ2l0dWRlOiAyNC45MzQ3OTIsXG5cdCAqIFx0XHRcdGFkZHJlc3M6IFwiU2Fsb21vbmthdHUgMVwiLFxuXHQgKlx0XHRcdHBvc3RhbENvZGU6IFwiMDAxMDBcIixcblx0ICpcdFx0XHRsb2NhbGl0eTogXCJIRUxTSU5LSVwiXG5cdCAqXHRcdH0sXG5cdCAqIFx0XHQuLi5cblx0ICogXVxuXHQgKi9cblx0ZmxhdFRvR2VvSlNPTjogZnVuY3Rpb24oZmxhdEFycmF5KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcblx0XHRcdGZlYXR1cmVzOiBfLm1hcChmbGF0QXJyYXksIGZ1bmN0aW9uKHBvaW50KSB7IFxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGdlb21ldHJ5OiB7Y29vcmRpbmF0ZXM6IFtwb2ludC5sb25naXR1ZGUsIHBvaW50LmxhdGl0dWRlXX0sXG5cdFx0XHRcdFx0cHJvcGVydGllczogXy5vbWl0KHBvaW50LCAnbGF0aXR1ZGUnLCAnbG9uZ2l0dWRlJylcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0fTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0ZXJzOyIsInZhciBQcm9taXNlUHVyZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkgeyByZXNvbHZlKGRhdGEpOyB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZVB1cmU7IiwidmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG4vKipcbiAqIENvbWJpbmVzIEdlb0pTT04gZGF0YSBzdWNoIGFzIENvdW50cnkgYm9yZGVycyB3aXRoIG90aGVyIGRhdGEgc3VjaCBhcyBwb3B1bGF0aW9uIGRlbnNpdHkgZm9yIGVhY2ggY291bnRyeS5cbiAqIFxuICpcbiAqL1xuZnVuY3Rpb24gYWdncmVnYXRlKGlkRmllbGQsIHZhbHVlRmllbGQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKGdlb2pzb24sIGV4dHJhcykge1xuXHRcdHZhciB3aXRoRXh0cmFzID0gXy5leHRlbmQoe30sIGdlb2pzb24pO1xuXG5cdFx0Xy5lYWNoKHdpdGhFeHRyYXMuZmVhdHVyZXMsIGZ1bmN0aW9uKGl0KSB7XG5cdFx0XHRpdC5wcm9wZXJ0aWVzW3ZhbHVlRmllbGRdID0gZXh0cmFzW2l0LnByb3BlcnRpZXNbaWRGaWVsZF1dO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHdpdGhFeHRyYXM7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGFnZ3JlZ2F0ZTsiXX0=

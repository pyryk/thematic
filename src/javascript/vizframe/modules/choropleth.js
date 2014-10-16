var _ = require('underscore');
var L = require('leaflet');
//var vizframe = require('vizframe');
//var map = vizframe.map;
var Q = require('q');

var defaults = {
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	}
}

function init(opts) {

	var opts = _.defaults(opts || {}, defaults);

	this.isVizFrameModule = true;
	this.addTo = function(vizframe) {
		this.map = vizframe.map;
		this.show();
		return this;
	};
	this.setData = function(data) {
		this.data = data;
		return this;
	};
	this.setScale = function(scale) {
			// TODO
	};
	this.show = function() {
		var map = this.map;
		this.data.then(function(data) {

			var area = L.geoJson(data, {
				onEachFeature: function(feature, layer) {
					var value = typeof opts.popupText === 'function' ? opts.popupText(feature) : opts.popupText;
					if (value) {
						layer.bindPopup(value);
					}
				}
			}).addTo(map);
		});

		return this;
	};
}

module.exports = init;
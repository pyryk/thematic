var _ = require('lodash');
var L = require('leaflet');

var IModule = require('imodule');

var defaults = {
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	},
	fitToData: true
};

function Choropleth(userOpts) {
	var opts = _.defaults(userOpts || {}, defaults);

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

			if (opts.fitToData) {
				this.thematic.fitToData(data);
			}

			this.statusChanged('ready');
		}.bind(this));

		return this;
	};

	this.remove = function() {
		this.map.removeLayer(dataLayer);
	};
}

Choropleth.prototype = IModule;

module.exports = Choropleth;
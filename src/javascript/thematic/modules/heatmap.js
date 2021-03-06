var _ = require('lodash');
var L = require('leaflet');


var HeatmapOverlay = require('leaflet-heatmap');
var IModule = require('imodule');

var defaultConfig = {
	// radius should be small ONLY if scaleRadius is true (or small radius is intended)
	// if scaleRadius is false it will be the constant radius used in pixels
	"radius": 0.012,
	"maxOpacity": 0.6, 
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

function Heatmap(userConfig) {
	var config = _.defaults(userConfig || {}, defaultConfig);
	this.layer = undefined;
	this.setData = function(rawData) { // TODO parameterize normalization
		rawData.then(function(data) {
			var features = data.features;
			var average = _.reduce(features, function(memo, it){ return memo + it.properties.time; }, 0) / features.length;

			var points = _.map(features, function(it) {
				var max = 50;
				var value = max - Math.min(it.properties.time, max);

				return {lat: it.geometry.coordinates[1], lng: it.geometry.coordinates[0], value: value, every: it.properties.every};
			});
			var max = _.max(points, function(it) { return it.time; });

			this.layer.setData({
				max: max.time,
				data: points
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
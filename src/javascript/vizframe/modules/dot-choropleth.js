var _ = require('underscore');
var L = require('leaflet');
//var vizframe = require('vizframe');
//var map = vizframe.map;
var Q = require('q');

function DotChoropleth(opts) {
	this.isVizFrameModule = true;
	this.layers = [];
	this.status = 'loading';

	this.addTo = function(id, vizframe) {
		this.id = id;
		this.map = vizframe.map;
		this.vizframe = vizframe;
		this.show();
		return this;
	};
	this.setData = function(data, field) {
		this.data = data;
		this.field = field;
		return this;
	};
	this.setScale = function(scale) {
		this.scale = scale;
		return this;
	};
	this.show = function() {
		var map = this.map;
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
			this.status = 'ready';
			console.log('status changed to', this.status);
			this.vizframe.moduleStatusChanged(this.id);
		}.bind(this), function() {
			console.warn('error handling render', arguments);
		});

		return this;
	}
}

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
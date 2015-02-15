var _ = require('lodash');
var L = require('leaflet');

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

			console.log(this.thematic);
			if (opts.fitToData) {
				console.log(this, this.thematic);
				this.thematic.fitToData(results);
			}

			console.log('render took!!', new Date().getTime() - start, 'ms');
			this.statusChanged('ready');
			
		}.bind(this));

		return this;
	};
}

DotChoropleth.prototype = IModule;

function getStep(data, type) {
	var index, isSorted;
	if (type == 'lat') {
		index = 1;
		isSorted = true;
	} else {
		index = 0;
		isSorted = false;
	}

	var values = _.chain(data).map(function(it) { return it.geometry.coordinates[index]; }).uniq(isSorted).value();
	return Math.abs((_.last(values) - _.first(values)) / values.length);
}

module.exports = DotChoropleth;
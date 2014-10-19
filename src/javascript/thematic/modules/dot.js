var _ = require('underscore');
var L = require('leaflet');
var IModule = require('imodule');

var defaults = {
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	}
}

function Dot(opts) {

	var opts = _.defaults(opts || {}, defaults);

	var markers = [];

	this.show = function() {
		var map = this.map;
		this.statusChanged('loading');
		this.data.then(function(data) {
			_.each(markers, function(it) { map.removeLayer(it); });

			var latlngs = _.map(data.features, function(poi) {
				var point = L.latLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]);
				var value = typeof opts.popupText === 'function' ? opts.popupText(poi) : opts.popupText;
				var marker = L.marker(point).addTo(map);
				markers.push(marker);
				if (value) {
					marker.bindPopup(value);
				}
			});
			this.statusChanged('ready');
		}.bind(this));

		return this;
	};
}

Dot.prototype = IModule;

module.exports = Dot;
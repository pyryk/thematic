var requireOrGlobal = require('require-or-global');

var _ = requireOrGlobal('underscore', '_');
var L = requireOrGlobal('leaflet', 'L');
var IModule = require('imodule');
require('leaflet-markercluster');
require('../../lib/MarkerCluster.css');
require('../../lib/MarkerCluster.Default.css');

var defaults = {
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
				var value = typeof opts.popupText === 'function' ? opts.popupText(poi) : opts.popupText;
				var marker = new L.Marker(point)
				markers.addLayer(marker)
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
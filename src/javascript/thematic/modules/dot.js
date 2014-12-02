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
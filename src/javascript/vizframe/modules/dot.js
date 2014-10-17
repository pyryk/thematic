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

function Dot(opts) {

	var opts = _.defaults(opts || {}, defaults);

	this.isVizFrameModule = true;
	this.status = 'loading';

	this.addTo = function(id, vizframe) {
		this.vizframe = vizframe;
		this.map = vizframe.map;
		this.id = id;
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

			var latlngs = _.map(data.features, function(poi) {
				var point = L.latLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]);
				var value = typeof opts.popupText === 'function' ? opts.popupText(poi) : opts.popupText;
				var marker = L.marker(point).addTo(map);
				if (value) {
					marker.bindPopup(value);
				}
			});
			this.status = 'ready';
			this.vizframe.moduleStatusChanged(this.id);
		}.bind(this));

		return this;
	};
}

module.exports = Dot;
var requireOrGlobal = require('require-or-global');

var _ = requireOrGlobal('underscore', '_');
var L = requireOrGlobal('leaflet', 'L');
var IModule = require('imodule');

var defaults = {
	popupText: function(point) {
		return _.chain(point.properties).map(function(value, key) {
			return key + ": " + value;
		}).value().join("<br />");
	}
}

function Choropleth(opts) {
	console.log('init Choropleth');
	var opts = _.defaults(opts || {}, defaults);

	this.show = function() {
		this.statusChanged('loading');
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
			this.statusChanged('ready');
		}.bind(this));

		return this;
	};
}

Choropleth.prototype = IModule;

module.exports = Choropleth;
var requireOrGlobal = require('require-or-global');
//var _ = requireOrGlobal('underscore');

var converters = {
	/**
	 * Converts from "flat" JSON format to GeoJSON point FeatureCollection used by Thematic.js.
	 * Flat input format is a custom format which consists of array of JSON objects. JSON 
	 * objects contain "latitude" and "longitude" properties and, optionally, other properties.
	 * Input format example:
	 * [
	 *		{
	 *			storeId: "2102",
	 *			name: "Helsinki keskusta Arkadia",
	 *			url: "/myymalat/2102/",
	 * 			latitude: 60.170814,
	 *			longitude: 24.934792,
	 * 			address: "Salomonkatu 1",
	 *			postalCode: "00100",
	 *			locality: "HELSINKI"
	 *		},
	 * 		...
	 * ]
	 */
	flatToGeoJSON: function(flatArray) {
		return {
			type: "FeatureCollection",
			features: _.map(flatArray, function(point) { 
				return {
					geometry: {coordinates: [point.longitude, point.latitude]},
					properties: _.omit(point, 'latitude', 'longitude')
				};
			})
		};
	}
};

module.exports = converters;
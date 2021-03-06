var _ = require('lodash');
/**
 * Combines GeoJSON data such as Country borders with other data such as population density for each country.
 * 
 *
 */
function aggregate(idField, valueField) {
	return function(geojson, extras) {
		var withExtras = _.extend({}, geojson);

		_.each(withExtras.features, function(it) {
			it.properties[valueField] = extras[it.properties[idField]];
		});

		return withExtras;
	};
}


module.exports = aggregate;
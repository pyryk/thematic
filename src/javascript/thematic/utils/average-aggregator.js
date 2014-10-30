var _ = require('underscore');
_ = window._ || _;

function getImportance(props) {
	return typeof props.importance === 'number' ? props.importance : 1;
}

function getAverage(values, field) {
	var total = _.reduce(values, function(memo, it) { return memo + getImportance(it); }, 0);
	return _.reduce(values, function(memo, it) { return memo + it[field] * getImportance(it); }, 0) / total;
}

function aggregate(data, field) {
	var start = new Date().getTime();
	var dots = _.chain(data).map(function(it) { return it.features; }).flatten().groupBy(function(it) { return it.geometry.coordinates; }).value();
	var aggregate = _.map(dots, function(group) {
		var props = {};

		props[field] = getAverage(_.map(group, function(it) { return it.properties; }), field);

		return {
			geometry: group[0].geometry,
			properties: props
		};
	});

	console.log('aggregate took', new Date().getTime() - start, 'ms');

	return {
		features: aggregate,
		type: "FeatureCollection"
	};
}

module.exports = aggregate;
// this example shows an (approximated) isarithmic map, combining 2 data sources
// by calculating an averate of the values in each data point. the data is already
// in geojson format. However, it could be converted from, e.g., flat dot format
// using the supplied flatDotToGeoJSON converter.

(function() {

	// initialize the map
	var map = new thematic.Thematic(document.getElementById('map'), {
		zoom: 11
	});

	// fetch the data and combine it using the average aggregator
	var traveltimes = Promise.all([
		fetch('futu.geojson').then(function(resp) { return resp.json(); }), 
		fetch('rajis.geojson').then(function(resp) { return resp.json(); })
	]).then(function(data) { 
		// use the "average" aggregator for the "time" property
		return thematic.aggregators.average(data, 'time'); 
	});

	// add the isarithmic mapping module (with id 'travel-times'),
	// set the data, using its 'time' property for visualization,
	// and use the scale defined below for getting visualization colors
	map.addModule('travel-times', 
		new thematic.modules.Isarithmic()
			.setData(traveltimes, 'time')
			.setScale(scale)
	);

	function scale(value) {
		var colors = [
			{maxTime: 30, color: 'green'},
			{maxTime: 40, color: 'yellowgreen'},
			{maxTime: 50, color: 'yellow'},
			{maxTime: 60, color: 'orange'},
			{maxTime: 80, color: 'red'},
			{maxTime: 100, color: 'purple'},
			{maxTime: 120, color: 'blue'}
		];

		function getColor(time) {
			var entry = _.find(colors, function(it) { return time <= it.maxTime; }) || _.last(colors);
			return entry.color;
		}

		return getColor(value);
	}
})();
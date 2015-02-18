// this example shows an (approximated) isarithmic map. the data is already
// in geojson format. However, it could be converted from, e.g., flat dot format
// using the supplied flatDotToGeoJSON converter.

(function() {

	// initialize the map
	var map = new thematic.Thematic(document.getElementById('map'), {
		zoom: 11
	});

	// fetch the data from an external GeoJSON file
	var traveltimes = fetch('futu.geojson').then(function(resp) { return resp.json(); });

	// add the isarithmic mapping module to the map with id 'travel-times',
	// specify the data to be used, using its 'time' property for visualization,
	// and use the scale function defined below for getting the visualization colors
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
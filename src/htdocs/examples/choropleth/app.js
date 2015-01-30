(function() {

	// initialize the map component
	var map = new thematic.Thematic(document.getElementById('map'), {
		center: [65.199324, 24.941025], 
		zoom: 6, 
		imagePath: '/images/leaflet',
		trackViewport: true
	});
	
	// fetch data (areas and percentages) using separate files - this can be also
	// done using a single resource if available
	var data = Promise.all([
		fetch('finland-municipalities.geojson').then(function(resp) { return resp.json(); }),
		fetch('voting.json').then(function(resp) { return resp.json(); })
		]).then(function(values) {
			var areas = values[0];
			var percentages = values[1];

			// use the "separate values" aggregator for combining the areas and percentages
			var aggregator = thematic.aggregators.separateValues('id', 'percentage');
			return aggregator(areas, percentages); 
		});

	// create and add a map module to the map component
	map
		.addModule('voting', new thematic.modules.Choropleth({field: 'percentage'})
			.setScale(scale)
			.setData(data)
		);

	// define the scaling function used for generating colors from data points
	function scale(value) {
		var colors = [
			{percentage: 70, color: 'green'},
			{percentage: 65, color: 'yellowgreen'},
			{percentage: 60, color: 'yellow'},
			{percentage: 55, color: 'orange'},
			{percentage: 50, color: 'red'}
		];

		function getColor(percentage) {
			var entry = _.find(colors, function(it) { return percentage >= it.percentage; }) || _.last(colors);
			return entry.color;
		}

		return getColor(value);
	}
})();
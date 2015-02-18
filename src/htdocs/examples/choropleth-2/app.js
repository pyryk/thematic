(function() {

	// initialize the map component
	var map = new thematic.Thematic(document.getElementById('map'), {
		center: [65.199324, 24.941025], 
		zoom: 6, 
		imagePath: '/images'
	});

	// fetch the data and modify it to better suit the choropleth module
	var data = fetch('data.geojson').then(function(resp) { return resp.json(); }).then(function(data) {
		_.each(data.features, function(it) {
			it.properties.percentage = it.properties.degree / (it.properties.degree + it.properties.no_degree) * 100;
		});

		return data;
	});

	// use d3 scaling function to produce colors from percentages calculated above
	var scale = d3.scale.linear().domain([60, 65, 70]).range(['#e5f5f9', '#99d8c9', '#2ca25f']);
	map
		.addModule('degrees', new thematic.modules.Choropleth({field: 'percentage', popupText: popup})
			.setScale(scale)
			.setData(data)
		);

	function popup(feature) {
		return feature.properties.Maakunta + ': ' + feature.properties.percentage.toFixed(1) + ' %';
	}
})();
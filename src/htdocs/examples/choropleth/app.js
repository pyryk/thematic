(function() {
	var map = new thematic.Thematic(document.getElementById('map'), {center: [65.199324, 24.941025], zoom: 6, imagePath: '/images/leaflet'});
	var data = Promise.all([
		fetch('finland-municipalities.geojson').then(function(resp) { return resp.json(); }),
		fetch('voting.json').then(function(resp) { return resp.json(); })
		]).then(function(values) { return thematic.aggregators.separateValues('id', 'percentage').apply(this, values); });

	map.addModule('voting', new thematic.modules.Choropleth({field: 'percentage'}).setScale(scale).setData(data));

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
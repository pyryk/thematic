(function() {
	var map = new thematic.Thematic(document.getElementById('map'), {zoom: 11});

	var traveltimes = fetch('futu.geojson').then(function(resp) { return resp.json(); });

	map.addModule('travel-times', new thematic.modules.Dasymetric().setData(traveltimes, 'time').setScale(scale));

	function scale(value) {
		// todo improve: normalize scales somehow
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
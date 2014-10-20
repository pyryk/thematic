;(function() {
	var thematic = {
		Thematic: require('thematic'),
		modules: {
			'DotChoropleth': require('thematic-dot-choropleth'),
			'Choropleth': require('thematic-choropleth'),
			'Dot': require('thematic-dot'),
			'Heatmap': require('thematic-heatmap')
		}, 
		converters: require('converters'),
		aggregators: {
			average: require('average-aggregator'),
			'separate-values': require('separate-values-aggregator')
		}
	};
	window.thematic = thematic;
})();
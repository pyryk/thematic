module.exports = {
		Thematic: require('thematic'),
		modules: {
			'IModule': require('imodule'),
			'Dasymetric': require('thematic-dot-choropleth'),
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
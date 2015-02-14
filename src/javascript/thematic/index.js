module.exports = {
		Thematic: require('./thematic'),
		modules: {
			'IModule': require('imodule'),
			'Dasymetric': require('thematic-dot-choropleth'),
			'Choropleth': require('thematic-choropleth'),
			'Dot': require('thematic-dot'),
			'Heatmap': require('thematic-heatmap'),
			'Isarithmic': require('thematic-dot-choropleth')
		}, 
		converters: require('converters'),
		aggregators: {
			average: require('average-aggregator'),
			separateValues: require('separate-values-aggregator')
		},
		utils: {
			PromisePure: require('promise-sync')
		}
	};
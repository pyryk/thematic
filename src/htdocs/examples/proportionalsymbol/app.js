// this example showcases the proportional symbol map functionality of Thematic.js.
// Proportional symbol functionality is achieved with the Dot mapping module, by
// specifying type 'proportional'.

(function() {

	// initialize the map
	var map = new thematic.Thematic(document.getElementById('map'), {
		imagePath: '/images'
	});

	// fetch the data and convert it to GeoJSON
	var dots = fetch('earthquakes-in-california.json')
		.then(function(resp) { return resp.json(); })
		.then(thematic.converters.flatToGeoJSON);

	// add the mapping module with id 'quakes'. Notice that proportional symbol
	// maps are achieved with the Dot mapping module by specifying the type
	// 'proportional'. Clustering support is disabled, since it reduces the
	// information shown greatly in proportional symbol maps.
	map.addModule('quakes', new thematic.modules.Dot({
		    cluster: false,
		    fitToData: true,

		    // enable proportional symbol mode
		    type: 'proportional',

		    // specify the property according to which the size of the symbol is determined
		    proportionalProperty: 'mag', 
		    popupText: function(poi) {
		    	return 'Magnitude: ' + poi.properties.mag + '<br>\n' +
		    	       'Location: ' + poi.properties.place + '<br>\n' + 
		    	       'Date: ' + poi.properties.time;
		    }
		})
			// use a simple Stetson-Harrison scale for showing the richter scale intuitively
			.setScale(function(value) { return Math.pow(4, value); }) 
			.setData(dots));
})();
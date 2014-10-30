(function() {
	var map = new thematic.Thematic(document.getElementById('map'), {zoom: 7, imagePath: '/images/leaflet', center: [36.778261, -119.417932]});
	var dots = fetch('earthquakes-in-california.json').then(function(resp) { return resp.json(); }).then(thematic.converters.flatToGeoJSON);
	map.addModule('quakes', new thematic.modules.Dot({
	    cluster: false,
	    type: 'proportional',
	    proportionalProperty: 'mag',
	    popupText: function(poi) {
	    	return 'Magnitude: ' + poi.properties.mag + '<br>\n' +
	    	       'Location: ' + poi.properties.place + '<br>\n' + 
	    	       'Date: ' + poi.properties.time;
	    }
	}).setScale(function(value) { return Math.pow(4, value); }).setData(dots));
})();
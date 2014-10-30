(function() {
	var map = new thematic.Thematic(document.getElementById('map'), {zoom: 11, imagePath: '/images/leaflet'});
	var dots = fetch('alko-markers.json').then(function(resp) { return resp.json(); }).then(thematic.converters.flatToGeoJSON);

	map.addModule('alkos', new thematic.modules.Dot({
	    popupText: function(point) { 
	        var props = point.properties;
	        var url = 'http://www.alko.fi' + props.url;
	        return '<a target="_blank" href="' + url + '">Alko ' + props.name + '</a><br>' + props.address + '<br>' + props.postalCode + ' ' + props.locality; 
	    }
	}).setData(dots));
})();
var filename = '../src/finland-municipalities.geojson';

var fs = require('fs');

var data = JSON.parse(fs.readFileSync(filename))

var features = data.features.map(function(area) { 
  area.properties.id = area.properties.name.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'aa');
  area.properties.code = undefined;
  return area;
});

console.log(JSON.stringify({features: features, type: 'FeatureCollection'}, null, 4));
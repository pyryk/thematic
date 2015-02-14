var filename = '../src/futukamppi.json';
var destination = 'futu';
var importance = 10;

var fs = require('fs');

var data = JSON.parse(fs.readFileSync(filename))

var features = data.map(function(point) { return {
  type: "Feature",
  geometry: {type: "Point", "coordinates": [point.lng, point.lat]},
  properties: {
  	time: point.time, 
  	every: point.every,
  	destination: destination,
  	importance: importance
  }
}; });

console.log(JSON.stringify({features: features, type: 'FeatureCollection'}, null, 4));
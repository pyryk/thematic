var filename = 'municipality-values.json';
var destination = 'futu';
var importance = 10;

var fs = require('fs');

var data = JSON.parse(fs.readFileSync(filename))

var obj = {};
data.map(function(municipality) { obj[municipality.id] = municipality.percentage; });

console.log(JSON.stringify(obj, null, 4));
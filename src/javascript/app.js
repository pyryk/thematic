var L = require('leaflet');
require('../../node_modules/leaflet/dist/leaflet.css');

var map = L.map('map').setView([60.173324, 24.941025], 13);
// http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Maanmittauslaitos maps, TMS by Kapsi',
    maxZoom: 18
    //scheme: 'tms'
}).addTo(map);
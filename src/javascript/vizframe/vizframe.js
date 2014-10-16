var L = require('leaflet');
var _ = require('underscore');
require('../../../node_modules/leaflet/dist/leaflet.css');
L.Icon.Default.imagePath = '/images/leaflet/';

var defaults = {
    center: [60.199324, 24.941025],
    zoom: 10,
    maxZoom: 18,
    attribution: 'Maps by OpenStreetMap',
    tms: false,
    tileUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

function init(el, opts) {

    if (typeof el === 'string') {
        el = document.getElementById(el);
    }

    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'loading-indicator';
    var spinnerImg = document.createElement('img');
    spinnerImg.src = "/images/loading-spin.svg";
    spinnerDiv.appendChild(spinnerImg);
    el.appendChild(spinnerDiv);


    opts = _.defaults(opts || {}, defaults);

    var tileOpts = _.omit(opts, 'center', 'zoom', 'tileUrl');

    var map = L.map(el).setView(opts.center, opts.zoom);
    // 
    L.tileLayer(opts.tileUrl, tileOpts).addTo(map);

    return {
        map: map,
        addModule: function(module) {
            if (!module || !module.isVizFrameModule || typeof module.addTo !== 'function') {
                throw new Error('module must be a VizFrame module.');
            }
            module.addTo(this);
            return module; // allow chaining
        },
        spinner: function(show) { // TODO implement a spinner system that supports multiple modules
            var hideClass = 'hide';
            if (show) {
                spinnerDiv.className = _.filter(spinnerDiv.className.split(' '), function(it) { return it !== hideClass }).join(' ');
            } else {
                var classes = spinnerDiv.className.split(' ');
                classes.push('hide');
                spinnerDiv.className = classes.join(' ');
            }
            
        }
    }
}


module.exports = init;
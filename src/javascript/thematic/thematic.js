var L = require('leaflet');

var _ = require('lodash');

require('polyfills');

var geoJsonCoords = require('geojson-coords');

//require('../../../node_modules/leaflet/dist/leaflet.css');

var defaults = {
    center: [0, 0],
    zoom: 15,
    maxZoom: 18,
    attribution: 'Maps by OpenStreetMap',
    tms: false,
    tileUrl: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    imagePath: 'images/',
    trackViewport: false,
    appCache: 'confirm' // confirm, auto, false
};

function init(el, opts) {

    if (!el) {
        throw new Error('Error initializing Thematic - the element is not a DOM element');
    }

    addClass(el, 'thematic-map');

    if (typeof el === 'string') {
        el = document.getElementById(el);
    }

    opts = _.defaults(opts || {}, defaults);
    L.Icon.Default.imagePath = opts.imagePath + '/leaflet/';

    addInfoPanels(this, el, opts);

    var tileOpts = _.omit(opts, 'center', 'zoom', 'tileUrl', 'imagePath', 'trackViewport');

    this.map = L.map(el).setView(opts.center, opts.zoom);
    L.tileLayer(opts.tileUrl, tileOpts).addTo(this.map);

    if (opts.trackViewport) {
        trackViewport(this, this.map);
    }

    if (opts.appCache === 'confirm') {
        reloadOnUpdate(true);
    } else if (opts.appCache == 'auto') {
        reloadOnUpdate(false);
    }

    var modules = [];
    
    // public methods ---------------------

    this.addModule = function(id, module) {
        if (!module || !module.isThematicModule || typeof module.addTo !== 'function') {
            throw new Error('module must be a Thematic.js module.');
        }
        module.addTo(id, this);
        modules.push(module);
        this.moduleStatusChanged(id);
        return module; // allow chaining
    };

    this.removeModule = function(id) {
        var module = _.find(modules, function(it) { return it.id === id; });
        var i = modules.indexOf(module);
        modules.splice(i, 1);

        module.remove();
    };

    this.getModules = function() {
        return _.clone(modules);
    };

    this.moduleStatusChanged = function(id) {
        _.each(this.info, function(it) {
            if (it.condition(modules)) {
                removeClass(it.el, 'hide');
            } else {
                addClass(it.el, 'hide');
            } 
        });
    };

    this.fitToData = function(geojson, force) {

        // only fit if force == true or not tracking viewport
        if (force || !(opts.trackViewport && document.location.hash.substring(1).length > 0)) {
            this.map.fitBounds(getLatLngBounds(geojson));
        }
    };
}

function getLatLngBounds(geojson) {
    var coords = geoJsonCoords(geojson);
    var points = _.map(coords, function(point) {
        return L.latLng(point[1], point[0]);
    });

    return L.latLngBounds(points);
}

function reloadOnUpdate(confirmReload) {
    if (window.applicationCache) {
      applicationCache.addEventListener('updateready', function() {
        if (!confirmReload || confirm('An update is available. Reload now?')) {
          window.location.reload();
        }
      });
    }
}

function trackViewport(thematic, map) {
    window.addEventListener('hashchange', function() {
        var location = parseLocation(document.location.hash.substring(1));
        if (location) {
            map.setView(location.center, location.zoom);
        }
    });

    function setHash(center, zoom) {
        var hash = '#' + center.lat + ',' + center.lng + '/' + zoom;
        document.location.hash = hash;
    }

    function updateLocation() {
        setHash(map.getCenter(), map.getZoom());
    }

    function parseLocation(hash) {
        var re = /([0-9\.]+),([0-9\.]+)\/([0-9]+)/;
        var parts = hash.match(re);
        if (parts) {
            return {center: new L.LatLng(parts[1], parts[2]), zoom: parts[3]};
        } else {
            return null;
        }
        
    }

    var location = parseLocation(document.location.hash.substring(1));
    if (location) {
        map.setView(location.center, location.zoom);
    }

    map.on('moveend', updateLocation);
    map.on('zoomend', updateLocation);
}

function addInfoPanels(thematic, el, opts) {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'loading-indicator';
    var spinnerImg = document.createElement('img');
    spinnerImg.src = opts.imagePath + "/loading-spin.svg";
    spinnerDiv.appendChild(spinnerImg);
    el.appendChild(spinnerDiv);

    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message hide';
    var messageDiv = document.createElement('div');
    messageDiv.className = 'error-text';
    messageDiv.textContent = 'Error loading content.';
    errorDiv.appendChild(messageDiv);
    el.appendChild(errorDiv);

    thematic.info = [
        {
            condition: function(modules) { 
                return _.some(modules, function(it) { return it.status === 'loading'; });
            },
            el: spinnerDiv
        },
        {
            condition: function(modules) {
                return _.some(modules, function(it) { return it.status === 'error'; });
            },
            el: errorDiv
        }
    ];
}

function removeClass(el, className) {
    el.className = _.filter(el.className.split(' '), function(it) { return it !== className; }).join(' ');
}

function addClass(el, className) {
    var classes = el.className.split(' ');
    classes.push(className);
    el.className = classes.join(' ');
}


module.exports = init;
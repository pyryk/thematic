var L = require('leaflet');
L = window.L || L;

var _ = require('underscore');
_ = window._ || _;
//require('../../../node_modules/leaflet/dist/leaflet.css');

polyfillPromises();

var defaults = {
    center: [60.199324, 24.941025],
    zoom: 10,
    maxZoom: 18,
    attribution: 'Maps by OpenStreetMap',
    tms: false,
    tileUrl: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    imagePath: 'images/leaflet/',
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

    addInfoPanels(this, el);

    opts = _.defaults(opts || {}, defaults);

    L.Icon.Default.imagePath = opts.imagePath;

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
    }

    this.moduleStatusChanged = function(id) {
        _.each(this.info, function(it) {
            it.condition(modules) ? removeClass(it.el, 'hide') : addClass(it.el, 'hide'); 
        });
    };
}

// TODO: this may be better done manually when using this library
function polyfillPromises() {
    if (!('Promise' in window) && 'ES6Promise' in window) {
        window.Promise = ES6Promise.Promise;
    }
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
    function setHash(center, zoom) {
        var hash = '#' + center.lat + ',' + center.lng + '/' + zoom;
        document.location.hash = hash;
    }

    function updateLocation() {
        setHash(map.getCenter(), map.getZoom());
    }

    function parseLocation(hash) {
        var re = /([0-9\.]+),([0-9\.]+)\/([0-9]+)/;
        var parts = hash.match(re)
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
    map.on('zoomend', updateLocation)
}

function addInfoPanels(thematic, el) {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'loading-indicator';
    var spinnerImg = document.createElement('img');
    spinnerImg.src = "/images/loading-spin.svg";
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
    el.className = _.filter(el.className.split(' '), function(it) { return it !== className }).join(' ');
}

function addClass(el, className) {
    var classes = el.className.split(' ');
    classes.push(className);
    el.className = classes.join(' ');
}


module.exports = init;
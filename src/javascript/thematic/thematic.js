var requireOrGlobal = require('require-or-global');

var L = requireOrGlobal('leaflet', 'L');
var _ = requireOrGlobal('underscore', '_');
//require('../../../node_modules/leaflet/dist/leaflet.css');
L.Icon.Default.imagePath = 'images/leaflet/';

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

    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message hide';
    var messageDiv = document.createElement('div');
    messageDiv.className = 'error-text';
    messageDiv.textContent = 'Error loading content.';
    errorDiv.appendChild(messageDiv);
    el.appendChild(errorDiv);

    var info = [
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

    opts = _.defaults(opts || {}, defaults);

    var tileOpts = _.omit(opts, 'center', 'zoom', 'tileUrl');

    this.map = L.map(el).setView(opts.center, opts.zoom);
    L.tileLayer(opts.tileUrl, tileOpts).addTo(this.map);

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
        // TODO
    };

    this.moduleStatusChanged = function(id) {
        console.log('moduleStatusChanged', id, modules);

        _.each(info, function(it) {
            it.condition(modules) ? removeClass(it.el, 'hide') : addClass(it.el, 'hide'); 
        });
    };
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
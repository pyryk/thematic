var VizFrame = require('vizframe');
var DotChoropleth = require('vizframe-dot-choropleth');
var Heatmap = require('vizframe-heatmap');
var Dot = require('vizframe-dot');
var Choropleth = require('vizframe-choropleth');
var $ = require('jquery');
var converters = require('converters');
var average = require('average-aggregator');
var Q = require('q');
var _ = require('underscore');

var traveltimes = Q.all([$.getJSON('futu.geojson'), $.getJSON('rajis.geojson')]).then(function(data) { return average(data, 'time'); });
var dots = $.getJSON('alko-markers.json').then(converters.flatToGeoJSON);
var municipalities = $.getJSON('finland-municipalities-codes.geojson');

var viz = new VizFrame(document.getElementById('map'), {zoom: 11});

viz.addModule('travel-times', new DotChoropleth().setData(traveltimes, 'time').setScale(scale));
//viz.addModule('travel-times-heatmap', new Heatmap().setData(traveltimes));
viz.addModule('alkos', new Dot({
    popupText: function(point) { 
        var props = point.properties;
        var url = 'http://www.alko.fi' + props.url;
        return '<a target="_blank" href="' + url + '">Alko ' + props.name + '</a><br>' + props.address + '<br>' + props.postalCode + ' ' + props.locality; 
    }
}).setData(dots));

//viz.addModule('municipalities', new Choropleth().setData(municipalities));

function scale(value) {
    // todo improve: normalize scales somehow
    var colors = [
        {maxTime: 30, color: 'green'},
        {maxTime: 40, color: 'yellowgreen'},
        {maxTime: 50, color: 'yellow'},
        {maxTime: 60, color: 'orange'},
        {maxTime: 80, color: 'red'},
        {maxTime: 100, color: 'purple'},
        {maxTime: 120, color: 'blue'}
    ];

    function getColor(time) {
        var entry = _.find(colors, function(it) { return time <= it.maxTime; }) || _.last(colors);
        return entry.color;
    }

    return getColor(value);
}
describe("A test suite", function() {
	var el;
	var map;
	beforeEach(function() {
		el = document.createElement('div');
		document.querySelector('body').appendChild(el);
		map = new thematic.Thematic(el, {zoom: 11, imagePath: '/images/leaflet'});
	});
	afterEach(function() { 
		document.querySelector('body').removeChild(document.querySelector('.thematic-map'))
	});

	it('creates map successfully', function() {
		expect(map).not.to.be.undefined;
		var spinner = document.querySelector('.thematic-map > .loading-indicator');
		expect(spinner).not.to.be.null;
		expect(spinner.className.indexOf('hide')).to.equal(-1);
	});

	it('correctly shows a dot map', function(done) { 
		var data = thematic.utils.PromisePure([{latitude: 1.234, longitude: 2.345, text: 'Test'}]).then(thematic.converters.flatToGeoJSON);
		map.addModule('test', new thematic.modules.Dot({}).setData(data));

		setTimeout(function() {
			var err = document.querySelector('.thematic-map > .error-message');
			expect(err).not.to.be.null;
			expect(err.className.indexOf('hide')).not.to.equal(-1);
			done();
		}, 200);
	});

	it('correctly shows an error when showing dot map with nonexisting data', function(done) { 
		var data = new Promise(function(resolve, reject) { reject(new Error('No data')); });
		map.addModule('test', new thematic.modules.Dot({}).setData(data));

		setTimeout(function() {
			var err = document.querySelector('.thematic-map > .error-message');
			expect(err).not.to.be.null;
			expect(err.className.indexOf('hide')).to.equal(-1);
			done();
		}, 200);
	});
});
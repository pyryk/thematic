(function() {

	// define the data locally
	var data = [
		{
			"storeId": 2200,
			"name": "Store no. 0",
			"url": "/myymalat/0/",
			"address": "Amboy Street 2",
			"postalCode": 20341,
			"locality": "Kirkkonummi",
			"latitude": 61.005923,
			"longitude": 22.41361
		},
		{
			"storeId": 2201,
			"name": "Store no. 1",
			"url": "/myymalat/1/",
			"address": "Pleasant Place 23",
			"postalCode": 2392,
			"locality": "Kirkkonummi",
			"latitude": 61.861995,
			"longitude": 27.30672
		},
		{
			"storeId": 2202,
			"name": "Store no. 2",
			"url": "/myymalat/2/",
			"address": "Brighton Court 69",
			"postalCode": 43919,
			"locality": "Kirkkonummi",
			"latitude": 61.01282,
			"longitude": 25.54356
		},
		{
			"storeId": 2203,
			"name": "Store no. 3",
			"url": "/myymalat/3/",
			"address": "Doscher Street 16",
			"postalCode": 55373,
			"locality": "Turku",
			"latitude": 60.452106,
			"longitude": 22.76208
		},
		{
			"storeId": 2204,
			"name": "Store no. 4",
			"url": "/myymalat/4/",
			"address": "Eastern Parkway 43",
			"postalCode": 57387,
			"locality": "Kirkkonummi",
			"latitude": 60.367134,
			"longitude": 22.89293
		},
		{
			"storeId": 2205,
			"name": "Store no. 5",
			"url": "/myymalat/5/",
			"address": "Thornton Street 32",
			"postalCode": 53945,
			"locality": "Espoo",
			"latitude": 61.795703,
			"longitude": 25.25193
		},
		{
			"storeId": 2206,
			"name": "Store no. 6",
			"url": "/myymalat/6/",
			"address": "Rutledge Street 89",
			"postalCode": 7413,
			"locality": "Vantaa",
			"latitude": 62.78366,
			"longitude": 27.56013
		},
		{
			"storeId": 2207,
			"name": "Store no. 7",
			"url": "/myymalat/7/",
			"address": "Otsego Street 79",
			"postalCode": 19166,
			"locality": "Kirkkonummi",
			"latitude": 60.620081,
			"longitude": 23.60409
		},
		{
			"storeId": 2208,
			"name": "Store no. 8",
			"url": "/myymalat/8/",
			"address": "Juliana Place 35",
			"postalCode": 58076,
			"locality": "Kauniainen",
			"latitude": 61.963044,
			"longitude": 23.87369
		},
		{
			"storeId": 2209,
			"name": "Store no. 9",
			"url": "/myymalat/9/",
			"address": "Clifton Place 75",
			"postalCode": 51025,
			"locality": "Pirkkala",
			"latitude": 60.467402,
			"longitude": 26.97675
		},
		{
			"storeId": 2210,
			"name": "Store no. 10",
			"url": "/myymalat/10/",
			"address": "Oceanview Avenue 23",
			"postalCode": 5802,
			"locality": "Kirkkonummi",
			"latitude": 61.251045,
			"longitude": 23.67085
		},
		{
			"storeId": 2211,
			"name": "Store no. 11",
			"url": "/myymalat/11/",
			"address": "Ridge Court 59",
			"postalCode": 12643,
			"locality": "Kirkkonummi",
			"latitude": 63.031627,
			"longitude": 25.87265
		},
		{
			"storeId": 2212,
			"name": "Store no. 12",
			"url": "/myymalat/12/",
			"address": "Sackett Street 63",
			"postalCode": 20602,
			"locality": "Kirkkonummi",
			"latitude": 61.966301,
			"longitude": 26.50677
		},
		{
			"storeId": 2213,
			"name": "Store no. 13",
			"url": "/myymalat/13/",
			"address": "Cadman Plaza 2",
			"postalCode": 36533,
			"locality": "Turku",
			"latitude": 60.900978,
			"longitude": 24.81292
		},
		{
			"storeId": 2214,
			"name": "Store no. 14",
			"url": "/myymalat/14/",
			"address": "Montague Terrace 67",
			"postalCode": 56635,
			"locality": "Vantaa",
			"latitude": 61.002427,
			"longitude": 26.24477
		},
		{
			"storeId": 2215,
			"name": "Store no. 15",
			"url": "/myymalat/15/",
			"address": "Lincoln Place 94",
			"postalCode": 20036,
			"locality": "Turku",
			"latitude": 61.435665,
			"longitude": 24.72121
		},
		{
			"storeId": 2216,
			"name": "Store no. 16",
			"url": "/myymalat/16/",
			"address": "College Place 17",
			"postalCode": 4299,
			"locality": "Kauniainen",
			"latitude": 62.815288,
			"longitude": 26.52901
		},
		{
			"storeId": 2217,
			"name": "Store no. 17",
			"url": "/myymalat/17/",
			"address": "Rose Street 17",
			"postalCode": 10419,
			"locality": "Helsinki",
			"latitude": 62.896259,
			"longitude": 23.23397
		},
		{
			"storeId": 2218,
			"name": "Store no. 18",
			"url": "/myymalat/18/",
			"address": "Highland Avenue 64",
			"postalCode": 49780,
			"locality": "Tampere",
			"latitude": 60.432245,
			"longitude": 25.50695
		},
		{
			"storeId": 2219,
			"name": "Store no. 19",
			"url": "/myymalat/19/",
			"address": "Hunts Lane 71",
			"postalCode": 43300,
			"locality": "Kauniainen",
			"latitude": 61.509766,
			"longitude": 27.38444
		},
		{
			"storeId": 2220,
			"name": "Store no. 20",
			"url": "/myymalat/20/",
			"address": "Oceanic Avenue 90",
			"postalCode": 49387,
			"locality": "Tampere",
			"latitude": 60.991095,
			"longitude": 23.58516
		},
		{
			"storeId": 2221,
			"name": "Store no. 21",
			"url": "/myymalat/21/",
			"address": "Paerdegat Avenue 26",
			"postalCode": 55708,
			"locality": "Turku",
			"latitude": 61.833724,
			"longitude": 23.94252
		},
		{
			"storeId": 2222,
			"name": "Store no. 22",
			"url": "/myymalat/22/",
			"address": "Glenmore Avenue 33",
			"postalCode": 37520,
			"locality": "Tampere",
			"latitude": 61.651155,
			"longitude": 22.48114
		},
		{
			"storeId": 2223,
			"name": "Store no. 23",
			"url": "/myymalat/23/",
			"address": "Harrison Place 35",
			"postalCode": 52851,
			"locality": "Kauniainen",
			"latitude": 61.901772,
			"longitude": 27.27721
		},
		{
			"storeId": 2224,
			"name": "Store no. 24",
			"url": "/myymalat/24/",
			"address": "Royce Place 57",
			"postalCode": 7333,
			"locality": "Helsinki",
			"latitude": 60.542164,
			"longitude": 23.24357
		},
		{
			"storeId": 2225,
			"name": "Store no. 25",
			"url": "/myymalat/25/",
			"address": "Ferris Street 21",
			"postalCode": 32018,
			"locality": "Helsinki",
			"latitude": 62.546497,
			"longitude": 23.36536
		},
		{
			"storeId": 2226,
			"name": "Store no. 26",
			"url": "/myymalat/26/",
			"address": "Denton Place 2",
			"postalCode": 53368,
			"locality": "Espoo",
			"latitude": 60.67199,
			"longitude": 27.68611
		},
		{
			"storeId": 2227,
			"name": "Store no. 27",
			"url": "/myymalat/27/",
			"address": "Harrison Avenue 51",
			"postalCode": 46996,
			"locality": "Kauniainen",
			"latitude": 63.013913,
			"longitude": 24.45424
		},
		{
			"storeId": 2228,
			"name": "Store no. 28",
			"url": "/myymalat/28/",
			"address": "Woods Place 75",
			"postalCode": 49786,
			"locality": "Helsinki",
			"latitude": 62.041761,
			"longitude": 27.56128
		},
		{
			"storeId": 2229,
			"name": "Store no. 29",
			"url": "/myymalat/29/",
			"address": "Cornelia Street 25",
			"postalCode": 18879,
			"locality": "Tampere",
			"latitude": 62.873107,
			"longitude": 25.05332
		},
		{
			"storeId": 2230,
			"name": "Store no. 30",
			"url": "/myymalat/30/",
			"address": "Waldorf Court 72",
			"postalCode": 21105,
			"locality": "Espoo",
			"latitude": 61.170381,
			"longitude": 27.17986
		},
		{
			"storeId": 2231,
			"name": "Store no. 31",
			"url": "/myymalat/31/",
			"address": "Vandervoort Place 13",
			"postalCode": 23153,
			"locality": "Vantaa",
			"latitude": 61.817922,
			"longitude": 27.09378
		},
		{
			"storeId": 2232,
			"name": "Store no. 32",
			"url": "/myymalat/32/",
			"address": "Clove Road 65",
			"postalCode": 57482,
			"locality": "Turku",
			"latitude": 62.256278,
			"longitude": 24.17419
		},
		{
			"storeId": 2233,
			"name": "Store no. 33",
			"url": "/myymalat/33/",
			"address": "Monroe Street 54",
			"postalCode": 23994,
			"locality": "Tampere",
			"latitude": 61.758693,
			"longitude": 27.14256
		},
		{
			"storeId": 2234,
			"name": "Store no. 34",
			"url": "/myymalat/34/",
			"address": "Horace Court 48",
			"postalCode": 25966,
			"locality": "Vantaa",
			"latitude": 60.726983,
			"longitude": 24.49678
		},
		{
			"storeId": 2235,
			"name": "Store no. 35",
			"url": "/myymalat/35/",
			"address": "Cook Street 77",
			"postalCode": 58501,
			"locality": "Kauniainen",
			"latitude": 62.012211,
			"longitude": 26.30939
		},
		{
			"storeId": 2236,
			"name": "Store no. 36",
			"url": "/myymalat/36/",
			"address": "Hegeman Avenue 82",
			"postalCode": 5931,
			"locality": "Kirkkonummi",
			"latitude": 60.649769,
			"longitude": 25.67098
		},
		{
			"storeId": 2237,
			"name": "Store no. 37",
			"url": "/myymalat/37/",
			"address": "Sedgwick Place 23",
			"postalCode": 53124,
			"locality": "Kirkkonummi",
			"latitude": 61.935786,
			"longitude": 23.11511
		},
		{
			"storeId": 2238,
			"name": "Store no. 38",
			"url": "/myymalat/38/",
			"address": "Burnett Street 6",
			"postalCode": 31278,
			"locality": "Kirkkonummi",
			"latitude": 60.783789,
			"longitude": 25.08267
		},
		{
			"storeId": 2239,
			"name": "Store no. 39",
			"url": "/myymalat/39/",
			"address": "Irving Avenue 17",
			"postalCode": 7472,
			"locality": "Turku",
			"latitude": 61.079361,
			"longitude": 24.90159
		},
		{
			"storeId": 2240,
			"name": "Store no. 40",
			"url": "/myymalat/40/",
			"address": "Rewe Street 24",
			"postalCode": 39128,
			"locality": "Kauniainen",
			"latitude": 62.503912,
			"longitude": 24.44899
		},
		{
			"storeId": 2241,
			"name": "Store no. 41",
			"url": "/myymalat/41/",
			"address": "Jaffray Street 79",
			"postalCode": 6428,
			"locality": "Pirkkala",
			"latitude": 62.056857,
			"longitude": 24.92255
		},
		{
			"storeId": 2242,
			"name": "Store no. 42",
			"url": "/myymalat/42/",
			"address": "Dorchester Road 13",
			"postalCode": 45535,
			"locality": "Turku",
			"latitude": 61.037786,
			"longitude": 24.83366
		},
		{
			"storeId": 2243,
			"name": "Store no. 43",
			"url": "/myymalat/43/",
			"address": "Lester Court 13",
			"postalCode": 48652,
			"locality": "Vantaa",
			"latitude": 62.276218,
			"longitude": 26.83112
		},
		{
			"storeId": 2244,
			"name": "Store no. 44",
			"url": "/myymalat/44/",
			"address": "Bedford Avenue 70",
			"postalCode": 14697,
			"locality": "Vantaa",
			"latitude": 61.84385,
			"longitude": 23.13025
		},
		{
			"storeId": 2245,
			"name": "Store no. 45",
			"url": "/myymalat/45/",
			"address": "Dumont Avenue 89",
			"postalCode": 5618,
			"locality": "Helsinki",
			"latitude": 61.547134,
			"longitude": 26.86622
		},
		{
			"storeId": 2246,
			"name": "Store no. 46",
			"url": "/myymalat/46/",
			"address": "Crescent Street 51",
			"postalCode": 27298,
			"locality": "Helsinki",
			"latitude": 63.047509,
			"longitude": 23.94366
		},
		{
			"storeId": 2247,
			"name": "Store no. 47",
			"url": "/myymalat/47/",
			"address": "Cheever Place 48",
			"postalCode": 4440,
			"locality": "Helsinki",
			"latitude": 60.325193,
			"longitude": 24.76572
		},
		{
			"storeId": 2248,
			"name": "Store no. 48",
			"url": "/myymalat/48/",
			"address": "Sedgwick Street 75",
			"postalCode": 58752,
			"locality": "Espoo",
			"latitude": 62.280044,
			"longitude": 23.81854
		},
		{
			"storeId": 2249,
			"name": "Store no. 49",
			"url": "/myymalat/49/",
			"address": "Doughty Street 93",
			"postalCode": 19493,
			"locality": "Helsinki",
			"latitude": 61.782973,
			"longitude": 23.67476
		},
		{
			"storeId": 2250,
			"name": "Store no. 50",
			"url": "/myymalat/50/",
			"address": "Linden Boulevard 84",
			"postalCode": 2010,
			"locality": "Kauniainen",
			"latitude": 62.028795,
			"longitude": 27.61159
		},
		{
			"storeId": 2251,
			"name": "Store no. 51",
			"url": "/myymalat/51/",
			"address": "Hunterfly Place 85",
			"postalCode": 59198,
			"locality": "Pirkkala",
			"latitude": 61.158963,
			"longitude": 27.35289
		},
		{
			"storeId": 2252,
			"name": "Store no. 52",
			"url": "/myymalat/52/",
			"address": "Little Street 19",
			"postalCode": 45520,
			"locality": "Turku",
			"latitude": 62.74782,
			"longitude": 24.86051
		},
		{
			"storeId": 2253,
			"name": "Store no. 53",
			"url": "/myymalat/53/",
			"address": "Locust Street 86",
			"postalCode": 26931,
			"locality": "Helsinki",
			"latitude": 62.214321,
			"longitude": 23.39986
		},
		{
			"storeId": 2254,
			"name": "Store no. 54",
			"url": "/myymalat/54/",
			"address": "Cranberry Street 64",
			"postalCode": 15051,
			"locality": "Espoo",
			"latitude": 62.867394,
			"longitude": 22.31627
		},
		{
			"storeId": 2255,
			"name": "Store no. 55",
			"url": "/myymalat/55/",
			"address": "Beard Street 67",
			"postalCode": 3164,
			"locality": "Helsinki",
			"latitude": 63.022844,
			"longitude": 24.31378
		},
		{
			"storeId": 2256,
			"name": "Store no. 56",
			"url": "/myymalat/56/",
			"address": "Kenilworth Place 78",
			"postalCode": 33555,
			"locality": "Espoo",
			"latitude": 60.951703,
			"longitude": 27.3039
		},
		{
			"storeId": 2257,
			"name": "Store no. 57",
			"url": "/myymalat/57/",
			"address": "Irvington Place 82",
			"postalCode": 57596,
			"locality": "Vantaa",
			"latitude": 63.146904,
			"longitude": 25.90035
		},
		{
			"storeId": 2258,
			"name": "Store no. 58",
			"url": "/myymalat/58/",
			"address": "Montgomery Place 84",
			"postalCode": 17570,
			"locality": "Helsinki",
			"latitude": 63.149167,
			"longitude": 24.24801
		},
		{
			"storeId": 2259,
			"name": "Store no. 59",
			"url": "/myymalat/59/",
			"address": "Gotham Avenue 34",
			"postalCode": 37738,
			"locality": "Kauniainen",
			"latitude": 63.099336,
			"longitude": 27.00717
		},
		{
			"storeId": 2260,
			"name": "Store no. 60",
			"url": "/myymalat/60/",
			"address": "Aster Court 87",
			"postalCode": 14647,
			"locality": "Espoo",
			"latitude": 61.96709,
			"longitude": 23.14173
		},
		{
			"storeId": 2261,
			"name": "Store no. 61",
			"url": "/myymalat/61/",
			"address": "Suydam Street 75",
			"postalCode": 49892,
			"locality": "Helsinki",
			"latitude": 62.503293,
			"longitude": 25.29222
		},
		{
			"storeId": 2262,
			"name": "Store no. 62",
			"url": "/myymalat/62/",
			"address": "Highlawn Avenue 49",
			"postalCode": 31690,
			"locality": "Espoo",
			"latitude": 60.395112,
			"longitude": 26.81998
		},
		{
			"storeId": 2263,
			"name": "Store no. 63",
			"url": "/myymalat/63/",
			"address": "Brighton Avenue 42",
			"postalCode": 17659,
			"locality": "Kirkkonummi",
			"latitude": 61.91514,
			"longitude": 25.35921
		},
		{
			"storeId": 2264,
			"name": "Store no. 64",
			"url": "/myymalat/64/",
			"address": "Barbey Street 3",
			"postalCode": 16881,
			"locality": "Turku",
			"latitude": 62.849172,
			"longitude": 24.91148
		},
		{
			"storeId": 2265,
			"name": "Store no. 65",
			"url": "/myymalat/65/",
			"address": "Turnbull Avenue 17",
			"postalCode": 27010,
			"locality": "Kauniainen",
			"latitude": 60.352447,
			"longitude": 23.87773
		},
		{
			"storeId": 2266,
			"name": "Store no. 66",
			"url": "/myymalat/66/",
			"address": "Knickerbocker Avenue 26",
			"postalCode": 50426,
			"locality": "Turku",
			"latitude": 60.28071,
			"longitude": 25.63787
		},
		{
			"storeId": 2267,
			"name": "Store no. 67",
			"url": "/myymalat/67/",
			"address": "Bay Street 15",
			"postalCode": 12298,
			"locality": "Tampere",
			"latitude": 62.003338,
			"longitude": 26.14494
		},
		{
			"storeId": 2268,
			"name": "Store no. 68",
			"url": "/myymalat/68/",
			"address": "Diamond Street 73",
			"postalCode": 28886,
			"locality": "Vantaa",
			"latitude": 62.429241,
			"longitude": 22.46043
		},
		{
			"storeId": 2269,
			"name": "Store no. 69",
			"url": "/myymalat/69/",
			"address": "Wogan Terrace 85",
			"postalCode": 48949,
			"locality": "Tampere",
			"latitude": 62.191285,
			"longitude": 27.29077
		},
		{
			"storeId": 2270,
			"name": "Store no. 70",
			"url": "/myymalat/70/",
			"address": "Narrows Avenue 72",
			"postalCode": 35275,
			"locality": "Turku",
			"latitude": 60.542145,
			"longitude": 25.04149
		},
		{
			"storeId": 2271,
			"name": "Store no. 71",
			"url": "/myymalat/71/",
			"address": "Quay Street 24",
			"postalCode": 13487,
			"locality": "Helsinki",
			"latitude": 62.862472,
			"longitude": 22.1858
		},
		{
			"storeId": 2272,
			"name": "Store no. 72",
			"url": "/myymalat/72/",
			"address": "Kent Avenue 82",
			"postalCode": 1456,
			"locality": "Kirkkonummi",
			"latitude": 62.334843,
			"longitude": 22.97685
		},
		{
			"storeId": 2273,
			"name": "Store no. 73",
			"url": "/myymalat/73/",
			"address": "Morton Street 73",
			"postalCode": 42123,
			"locality": "Pirkkala",
			"latitude": 62.167825,
			"longitude": 27.69844
		},
		{
			"storeId": 2274,
			"name": "Store no. 74",
			"url": "/myymalat/74/",
			"address": "Monitor Street 63",
			"postalCode": 18188,
			"locality": "Espoo",
			"latitude": 61.478827,
			"longitude": 26.66785
		},
		{
			"storeId": 2275,
			"name": "Store no. 75",
			"url": "/myymalat/75/",
			"address": "Richardson Street 42",
			"postalCode": 36161,
			"locality": "Helsinki",
			"latitude": 60.669398,
			"longitude": 25.3181
		}
	];

	// init the map component
	var map = new thematic.Thematic(document.getElementById('map'), {
		center: [60.999324, 24.941025], 
		zoom: 7, 
		imagePath: '/images'
	});

	// wrap the synchronous data in a Promise and convert it to geojson format
	var dots = thematic.utils.PromisePure(data).then(thematic.converters.flatToGeoJSON);

	// init the dot map module and add it to the map
	map.addModule('alkos', new thematic.modules.Dot({
			// customize the popup
			popupText: function(point) { 
					var props = point.properties;
					var url = 'http://www.alko.fi' + props.url;
					return '<a target="_blank" href="' + url + '">Alko ' + props.name + '</a><br>' + props.address + '<br>' + props.postalCode + ' ' + props.locality; 
			}
	}).setData(dots)); // set the data to the module
	
})();
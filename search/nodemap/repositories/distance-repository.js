var haversine = require('haversine');
var userPositionRepository = require('./user-position.js');
var diagnostics = require('../diagnostics/index.js');
var userCalculatedRepository = require('./user-calculated.js');
var request = require('request');

function mergeCitiesForPosition(req, res) {
	var calculatedIds;
	var userPosition;

	function done() {
		res.send(200);
	}

	function onError(error) {
		diagnostics.log('onUserCalculatedLoadError', error);
	}

	function findNextUncalculatedUser() {
		var findNextUncalculated = null;
		userPosition.forEach(function (item) {
			if (typeof calculatedIds[item.id] === 'undefined') {
				findNextUncalculated = item;
			}
		});

		return findNextUncalculated;
	}

	function saveAndContinue(calculatedIds) {
		userCalculatedRepository
			.save(calculatedIds)
			.then(function () {
				mergeCitiesForPosition(req, res);
			}, done);
	}

	function saveAndFinish(calculatedIds) {
		userCalculatedRepository
			.save(calculatedIds)
			.then(done, done);
	}

	function processMerge() {
		diagnostics.log('loaded');
		diagnostics.log('Finding next uncalculated');

		var findNextUncalculated = findNextUncalculatedUser();

		if (findNextUncalculated !== null) {
			findNearestCity(findNextUncalculated, function (nearest) {
				if (nearest !== null) {
					diagnostics.log('Calculating', findNextUncalculated.id);

					calculatedIds[findNextUncalculated.id] = {
						country: nearest.city[1],
						region: nearest.city[2],
						city: nearest.city[3],
						distance: nearest.distance
					};
				} else {
					console.log('Could not map ');
					console.log(findNextUncalculated);

					calculatedIds[findNextUncalculated.id] = {
						country: 'Unknown',
						region: '',
						city: 'Unknown',
						distance: 0
					};
				}

				saveAndContinue(calculatedIds);
			});
		} else {
			diagnostics.log('No more uncalculated');

			saveAndFinish(calculatedIds);
		}
	}

	function onUserPositionRepositoryDelegate(_userPosition) {
		diagnostics.log('onUserPositionRepositoryDelegate');
		userPosition = _userPosition;

		processMerge();
	}

	function onUserCalculatedLoad(_calculatedIds) {
		calculatedIds = _calculatedIds;

		diagnostics.log('Loading users');
		userPositionRepository
			.all()
			.then(onUserPositionRepositoryDelegate, onError);
	}

	userCalculatedRepository
		.load()
		.then(onUserCalculatedLoad, done);
}

function findNearestCity(item, callback) {
	if (item.lon < 180) {
		item.lon += 360;
	}

	if (item.lon > 180) {
		item.lon -= 360;
	}

	var query = {
		"size": 1,
		"query": {
			"match_all": {}
		},
		// "query": {
		// 	"filtered": {
		// 		"filter": {
		// 			"geo_bounding_box": {
		// 				"type": "indexed",
		// 				"location": {
		// 					"top_left": {
		// 						"lat": parseFloat(item.lat) + 100,
		// 						"lon": parseFloat(item.lon) - 100
		// 					},
		// 					"bottom_right": {
		// 						"lat": parseFloat(item.lat) - 100,
		// 						"lon": parseFloat(item.lon) + 100
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		"sort": [
			{
				"_geo_distance": {
					"location": {
						"lat": parseFloat(item.lat),
						"lon": parseFloat(item.lon)
					},
					"order": "asc",
					"unit": "km",
					"distance_type": "arc"
				}
			}
		]
	};

	function requestCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			diagnostics.log(body);

			if (body.hits.hits.length > 0) {
				var townItem = body.hits.hits[0]._source;

				diagnostics.log(townItem);

				var coord1 = {
					latitude: parseFloat(townItem.location.lat),
					longitude: parseFloat(townItem.location.lon)
				};

				var coord2 = {
					latitude: parseFloat(item.lat),
					longitude: parseFloat(item.lon)
				};
				var distance = 0;

				try {
					distance = haversine(coord1, coord2, {unit: 'mile'});
				} catch (e) {
					diagnostics.log(e);
				}

				var result = {
					city: [
						townItem.id,
						townItem.country_code.toUpperCase(),
						townItem.region || '',
						townItem.name
					],
					distance: distance
				};

				callback(result);
			} else {
				callback(null);
			}
		} else {
			diagnostics.log('error occurred ', error);
			diagnostics.log(response);
			diagnostics.log(body);

			diagnostics.log(JSON.stringify(query));

			callback(null);
		}
	}

	request.post('http://127.0.0.1:9200/towns/town/_search', { json: query }, requestCallback);
}

function mergeDistances(items) {
	return new Promise(function (resolve, reject) {
		userCalculatedRepository
			.load()
			.then(function (calculatedIds) {
				items.forEach(function (item) {
					if (typeof calculatedIds[item.id] !== 'undefined') {
						item.location = calculatedIds[item.id];
					}
				});

				resolve(items);
			}, reject);
	});
}

module.exports = {
	mergeDistances: mergeDistances,
	findNearestCity: findNearestCity,
	mergeCitiesForPosition: mergeCitiesForPosition
};

//loadAllCities();

var async = require('async');
var haversine = require('haversine');
var fs = require('fs');
var cityRepository = require('./city-repository.js');
var userPositionRepository = require('./user-position.js');
var diagnostics = require('../diagnostics/index.js');
var userCalculatedRepository = require('./user-calculated.js');
var request = require('request');
var cities;

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
				diagnostics.log('Calculating', findNextUncalculated.id);

				calculatedIds[findNextUncalculated.id] = {
					country: nearest.city[1],
					region: nearest.city[2],
					city: nearest.city[3],
					distance: nearest.distance
				};

				saveAndFinish(calculatedIds);
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

function loadAllCities() {
	diagnostics.log('Loading cities');
	cityRepository
		.all()
		.then(function (data) {
			diagnostics.log(data.length + ' cities parsed');
			cities = data;
		}, function (err) {
			diagnostics.log(err);
		});
}

function findNearestCity(item, callback) {
	var found = null;
	var minDistance = null;

	console.log(item);

	var query = {
		"size": 1,
		"query": {
			"filtered": {
				"filter": {
					"geo_bounding_box": {
						"type": "indexed",
						"location": {
							"top_left": {
								"lat": parseFloat(item.lat) + 10,
								"lon": parseFloat(item.lon) - 10
							},
							"bottom_right": {
								"lat": parseFloat(item.lat) - 10,
								"lon": parseFloat(item.lon) + 10
							}
						}
					}
				}
			}
		},
		"sort": [
			{
				"_geo_distance": {
					"location": {
						"lat": parseFloat(item.lat),
						"lon": parseFloat(item.lon)
					},
					"order": "asc",
					"unit": "km",
					"distance_type": "plane"
				}
			}
		]
	};

	var config = {
		url: 'http://0.0.0.0:9200/towns/town/_search',
		body: query
	};

	function requestCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body) // Show the HTML for the Google homepage.

			if (body.hits.hits.length > 0) {
				var townItem = body.hits.hits[0]._source;

				console.log(townItem);

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
						townItem.country_code.upper(),
						townItem.region || '',
						townItem.name
					],
					distance: distance
				};

				callback(result);
		} else {
			console.log('error ', error);
		}
	}

	request.post('http://0.0.0.0:9200/towns/town/_search', { json: query }, requestCallback);

	// async.each(cities, function (city) {
	// 	var coord1 = {
	// 		latitude: parseFloat(city[5]),
	// 		longitude: parseFloat(city[6])
	// 	};

	// 	var coord2 = {
	// 		latitude: parseFloat(item.lat),
	// 		longitude: parseFloat(item.lon)
	// 	};

	// 	var distance;

	// 	try {
	// 		distance = haversine(coord1, coord2, {unit: 'mile'});
	// 	} catch (e) {
	// 		diagnostics.log(e);
	// 	}

	// 	if (city[3] !== '') {
	// 		if (
	// 			(
	// 				(minDistance === null) &&
	// 				(isNaN(distance) === false)
	// 			) ||
	// 			(
	// 				(minDistance !== null) &&
	// 				(distance <= minDistance) &&
	// 				(distance > 0) &&
	// 				(isNaN(distance) === false)
	// 			)
	// 		) {
	// 			found = city;

	// 			minDistance = distance;
	// 		}
	// 	}
	// });

	// return {
	// 	city: found,
	// 	distance: minDistance
	// };
}

function userPositionMapper(item) {
	var nearest = findNearestCity(item);

	item.city = nearest.city;
	item.distance = nearest.distance;

	return item;
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

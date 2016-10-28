var async = require('async');
var haversine = require('haversine');
var cityRepository = require('./city-repository.js');
var userPositionRepository = require('./user-position.js');
var diagnostics = require('../diagnostics/index.js');
var userCalculatedRepository = require('./user-calculated.js');
var userPosition;
var cities;

function mergeCitiesForPosition() {
	function done() {
		setTimeout(mergeCitiesForPosition, 1000);
	}

	function onUserCalculatedLoad(calculatedIds) {
		diagnostics.log('Loading users');
		userPositionRepository
			.all()
			.then(function (response) {
				diagnostics.log('loaded');
				userPosition = response;
				diagnostics.log('Finding next uncalculated');

				var findNextUncalculated = null;
				userPosition.forEach(function (item) {
					if (typeof calculatedIds[item.id] === 'undefined') {
						findNextUncalculated = item;
					}
				});

				if (findNextUncalculated !== null) {
					var nearest = findNearestCity(findNextUncalculated);

					diagnostics.log('Calculating', findNextUncalculated.id);

					calculatedIds[findNextUncalculated.id] = {
						country: nearest.city[1],
						region: nearest.city[2],
						city: nearest.city[3],
						distance: nearest.distance
					};
				}

				userCalculatedRepository
					.save(calculatedIds)
					.then(done, done);
			}, function (error) {
				diagnostics.log('onUserCalculatedLoad', error);
			});
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

			mergeCitiesForPosition();
		}, function (err) {
			diagnostics.log(err);
		});
}

function findNearestCity(item) {
	var found = null;
	var minDistance = null;

	async.each(cities, function (city) {
		var coord1 = {
			latitude: parseFloat(city[5]),
			longitude: parseFloat(city[6])
		};

		var coord2 = {
			latitude: parseFloat(item.lat),
			longitude: parseFloat(item.lon)
		};

		var distance;

		try {
			distance = haversine(coord1, coord2, {unit: 'mile'});
		} catch (e) {
			diagnostics.log(e);
		}

		if (city[3] !== '') {
			if (
				(
					(minDistance === null) &&
					(isNaN(distance) === false)
				) ||
				(
					(minDistance !== null) &&
					(distance <= minDistance) &&
					(distance > 0) &&
					(isNaN(distance) === false)
				)
			) {
				found = city;

				minDistance = distance;
			}
		}
	});

	return {
		city: found,
		distance: minDistance
	};
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
	findNearestCity: findNearestCity
};

loadAllCities();

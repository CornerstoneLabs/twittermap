var async = require('async');
var haversine = require('haversine');
var fs = require('fs');
var cityRepository = require('./city-repository.js');
var userPositionRepository = require('./user-position.js');
var diagnostics = require('../diagnostics/index.js');
var userCalculatedRepository = require('./user-calculated.js');
var cities;

function loadJsonFile(filePath) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filePath, {encoding: 'utf-8'}, function read(err, buffer) {
			if (err) {
				resolve(null);
			} else {
				var data = buffer.toString();
				var parsedData = JSON.parse(data);
				resolve(parsedData);
			}
		});
	});
}

function mergeCitiesForPosition(req, res) {
	var calculatedIds;
	var userPosition;
	var deletedUsers;

	function done() {
		res.send(200);
	}

	function onError(error) {
		diagnostics.log('onUserCalculatedLoadError', error);
	}

	function isUserDeleted(item) {
		return deletedUsers.filter(function (checkItem) {
			return (checkItem === item.id);
		}).length > 0;
	}

	function findNextUncalculatedUser() {
		var findNextUncalculated = null;
		userPosition.forEach(function (item) {
			if (typeof calculatedIds[item.id] === 'undefined') {
				if (isUserDeleted(item) === false) {
					findNextUncalculated = item;
				}
			}
		});

		return findNextUncalculated;
	}

	function processMerge() {
		diagnostics.log('loaded');
		diagnostics.log('Finding next uncalculated');

		var findNextUncalculated = findNextUncalculatedUser();

		if (findNextUncalculated !== null) {
			var nearest = findNearestCity(findNextUncalculated);

			diagnostics.log('Calculating', findNextUncalculated.id);

			calculatedIds[findNextUncalculated.id] = {
				country: nearest.city[1],
				region: nearest.city[2],
				city: nearest.city[3],
				distance: nearest.distance
			};
		} else {
			diagnostics.log('No more uncalculated');
		}

		deletedUsers.map(function (deletedId) {
			diagnostics.log('Checking deleted id ', deletedId);

			if (typeof calculatedIds[deletedId] !== 'undefined') {
				diagnostics.log('Item exists, deleting ', deletedId);

				delete calculatedIds[deletedId];
			}
		});

		userCalculatedRepository
			.save(calculatedIds)
			.then(done, done);
	}

	function onLoadDeletedUsersDelegate(_deletedUsers) {
		deletedUsers = _deletedUsers;

		if (deletedUsers === null) {
			deletedUsers = [];
		}

		processMerge();
	}

	function loadDeletedUsers() {
		loadJsonFile('../public/data/deleted.spool')
			.then(onLoadDeletedUsersDelegate, onError);
	}

	function onUserPositionRepositoryDelegate(_userPosition) {
		diagnostics.log('onUserPositionRepositoryDelegate');
		userPosition = _userPosition;

		loadDeletedUsers();
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
	findNearestCity: findNearestCity,
	mergeCitiesForPosition: mergeCitiesForPosition
};

loadAllCities();

var cityRepository = require('../../repositories/city-repository.js');
var countries = require('country-data').countries;
var capitalTransform = require('../capital-transform.js');
var getFacebookData = require('../../viewmodels/facebook.js');
var getTwitterData = require('../../viewmodels/twitter.js');
var cache = require('../../caches/view-cache.js');

function selectTownByInitial(req, res, code, initial) {
	var start = new Date();
	var cacheKey = 'select-town-' + code + '-' + initial;
	var country = countries[code].name;

	function output (transformedTowns) {
		transformedTowns.items = Array.from(new Set(transformedTowns.items));

		res.render('add-marker/select-town', {
			country: country,
			countryCode: code,
			twitter: getTwitterData(req),
			facebook: getFacebookData(req),
			towns: transformedTowns,
			configuration: {
				serverUrl: process.env.SERVER_URL || ''
			},
			duration: new Date().getTime() - start.getTime()
		});
	}

	function getTownsByInitial(towns, initial) {
		var transformedTowns = capitalTransform(towns, 'name');

		transformedTowns = transformedTowns.filter(function (item) {
			return (item.code === initial);
		});

		return transformedTowns;
	}

	cache
		.read(cacheKey)
		.then(output, function () {
			cityRepository
				.country(code)
				.then(function (towns) {
					var transformedTowns = getTownsByInitial(towns, req.query.initial);
					var names = transformedTowns[0].items.map(function nameMapper(item) {
						return item.name;
					});
					names = Array.from(new Set(names));

					transformedTowns[0].names = names;

					cache
						.write(cacheKey, transformedTowns)
						.then(output, function (error) {
							console.log(error);
						});
				}, function (error) {
					res.send(500);
				});
		});
}

function selectTownInitials(req, res, code) {
	var start = new Date();
	var country = countries[code].name;
	var cacheKey = 'select-town-' + code;

	function output(transformedTowns) {
		res.render('add-marker/select-town-initial', {
			country: country,
			countryCode: code,
			twitter: getTwitterData(req),
			facebook: getFacebookData(req),
			towns: transformedTowns,
			configuration: {
				serverUrl: process.env.SERVER_URL || ''
			},
			duration: new Date().getTime() - start.getTime()
		});
	}

	function outputError() {
		res.send(500);
	}

	function loadData () {
		cityRepository
			.country(code)
			.then(function (towns) {
				var transformedTowns = capitalTransform(towns, 'name');

				cache
					.write(cacheKey, transformedTowns)
					.then(output, outputError);

			}, outputError);
	}

	cache
		.read(cacheKey)
		.then(output, loadData);
}

function selectTown (req, res) {
	var code = req.params.code;

	if (req.query.initial) {
		return selectTownByInitial(req, res, code, req.query.initial);
	} else {
		return selectTownInitials(req, res, code);
	}
}

module.exports = selectTown;

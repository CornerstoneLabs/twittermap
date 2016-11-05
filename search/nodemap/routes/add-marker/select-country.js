var userPositionRepository = require('../../repositories/user-position.js');
var cityRepository = require('../../repositories/city-repository.js');
var distance = require('../../repositories/distance-repository.js');
var getFacebookData = require('../../viewmodels/facebook.js');
var getTwitterData = require('../../viewmodels/twitter.js');
var countryTransform = require('../country-transform.js');

function showAllCountries (req, res) {
	var start = new Date();

	cityRepository.countries().then(function (response) {
		res.render('add-marker/select-country', {
			countries: response,
			twitter: getTwitterData(req),
			facebook: getFacebookData(req),
			configuration: {
				serverUrl: process.env.SERVER_URL || ''
			},
			duration: new Date().getTime() - start.getTime()
		});
	}, function (error) {

	});
}

function popularCountryView () {
	return new Promise(function (resolve, reject) {
		userPositionRepository
			.all()
			.then(function (response) {
				distance
					.mergeDistances(response)
					.then(function (distances) {
						var countries = [];
						try {
							countries = countryTransform(distances);
						} catch (e) {
							console.log(e);
						}

						resolve(countries);
					}, function (error) {
						reject(error);
					});
			}, function (error) {
				reject(error);
			});
	});
}

function selectCountry (req, res) {
	var start = new Date();

	if (req.query.all) {
		return showAllCountries(req, res);
	}

	popularCountryView()
		.then(function (countries) {
			res.render('add-marker/select-country', {
				countries: countries,
				twitter: getTwitterData(req),
				facebook: getFacebookData(req),
				configuration: {
					serverUrl: process.env.SERVER_URL || ''
				},
				duration: new Date().getTime() - start.getTime()
			});
		}, function (error) {
			res.send(error);
		});
}

module.exports = selectCountry;

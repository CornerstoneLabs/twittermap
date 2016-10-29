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

function selectCountry (req, res) {
	var start = new Date();

	if (req.query.all) {
		return showAllCountries(req, res);
	}

	userPositionRepository
		.all()
		.then(function (response) {
			distance
				.mergeDistances(response)
				.then(function (distances) {
					try {
						var countries = countryTransform(distances);
					} catch (e) {
						console.log(e);
					}

					res.render('add-marker/select-country', {
						userPositions: distances,
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
		});
}

module.exports = selectCountry;

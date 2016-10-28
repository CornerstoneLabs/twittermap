var cityRepository = require('../../repositories/city-repository.js');
var countries = require('country-data').countries;
var capitalTransform = require('../capital-transform.js');
var getFacebookData = require('../../viewmodels/facebook.js');
var getTwitterData = require('../../viewmodels/twitter.js');

function selectCountry (req, res) {
	var code = req.params.code;
	var start = new Date();

	cityRepository
		.country(code)
		.then(function (towns) {
			var country = countries[code].name;
			var transformedTowns = capitalTransform(towns, 'name');

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
		}, function (error) {
			res.send(500);
		});
}

module.exports = selectCountry;

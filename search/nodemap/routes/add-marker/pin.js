var cityRepository = require('../../repositories/city-repository.js');
var countries = require('country-data').countries;
var capitalTransform = require('../capital-transform.js');
var getFacebookData = require('../../viewmodels/facebook.js');
var getTwitterData = require('../../viewmodels/twitter.js');

function pin (req, res) {
	var code = req.params.code;
	var town = req.params.town;
	var start = new Date();
	var country = countries[code].name;

	res.render('add-marker/pin', {
		code: code,
		town: town,
		country: country,
		twitter: getTwitterData(req),
		facebook: getFacebookData(req),
		configuration: {
			serverUrl: process.env.SERVER_URL || ''
		},
		duration: new Date().getTime() - start.getTime()
	});
}

module.exports = pin;

var cityRepository = require('../../repositories/city-repository.js');
var countries = require('country-data').countries;
var getFacebookData = require('../../viewmodels/facebook.js');
var getTwitterData = require('../../viewmodels/twitter.js');
var spoofPosition = require('./spoof-position.js');

function pinProcess (req, res, city) {
	return new Promise(function (resolve, reject) {
		if (req.session.passport.user.facebook) {
			spoofPosition(
				city.latitude,
				city.longitude,
				req.session.passport.user.facebook.displayName,
				req.session.passport.user.facebook.profileUrl,
				req.session.passport.user.facebook.facebookProfilePhoto,
				'facebook',
				function () {
					resolve();
				}, function (err) {
					reject(err);
				}
			);

			return;
		}

		if (req.session.passport.user.twitter) {
			spoofPosition(
				city.latitude,
				city.longitude,
				req.session.passport.user.twitter.displayName,
				req.session.passport.user.twitter._json.screen_name,
				req.session.passport.user.twitter._json.profile_image_url_https,
				'twitter',
				function () {
					resolve();
				}, function (err) {
					reject(err);
				}
			);
		}
	});
}

function pin (req, res) {
	var code = req.params.code;
	var town = req.params.town;
	var start = new Date();
	var country = countries[code].name;

	function done () {
		res.render('add-marker/pin-confirm', {
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

	function error () {
		res.send(500);
	}

	// find lat/lng from country code and town name
	cityRepository
		.country(code)
		.then(function (cities) {
			var findCity = cities.filter(function (item) {
				return (item.name === town);
			});

			if (findCity.length > 0) {
				var city = findCity[0];

				pinProcess(req, res, city).then(done, error);
			}
		}, function (err) {
			error();
		});
}

module.exports = pin;

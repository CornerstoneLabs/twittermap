var userPositionRepository = require('../repositories/user-position.js');
var distance = require('../repositories/distance-repository.js');
var countryTransform = require('./country-transform.js');

function home (req, res) {
	var start = new Date();

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

					res.render('list-view', {
						userPositions: distances,
						countries: countries,
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

module.exports = home;

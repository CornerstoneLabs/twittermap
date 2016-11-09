var Instance = require('../models/instance.js');
var homeViewModel = require('../viewmodels/home-view-model.js');

function home (req, res) {
	homeViewModel()
		.then((data) => {

			Instance
				.list()
				.then(function (instances) {

					data.instances = instances;
					res.render('home', data);

				}, function (error) {
					console.log(error);
				});
		});
}

module.exports = home;

var Instance = require('../../models/Instance.js');

function instances (req, res) {
	var promises = [];
	var context = {};

	if (req.query.id) {
		promises.push(new Promise((resolve, reject) => {
			Instance
				.get(req.query.id)
				.then(function (data) {
					context.data = data;

					resolve();
				}, function (error) {
					reject(error);
				});
		}));
	}

	promises.push(new Promise((resolve, reject) => {
		Instance
			.list()
			.then(function (instances) {
				context.instances = instances;

				resolve();
			}, function (error) {
				reject(error);
			});
	}));

	Promise
		.all(promises)
		.then(function () {
			res.render('instances', context);
		}, function (error) {
			res.send(500, error);
		});
}

module.exports = instances;

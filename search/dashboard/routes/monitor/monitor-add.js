var Monitor = require('../../models/monitor.js');

function monitorAdd (req, res) {
	var data = {
		name: req.body.monitorName,
		fabricCommand: req.body.fabricCommand
	};

	if (req.body._id) {
		Monitor
			.update(req.body._id, data)
			.then(function () {
				res.redirect('/monitor?id=' + req.body._id);
			}, function (error) {
				res.send(500, error);
			});
	} else {
		Monitor
			.insert(data)
			.then(function () {
				res.redirect('/monitor');
			}, function (error) {
				res.send(500, error);
			});
	}
}

module.exports = monitorAdd;

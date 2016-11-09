var Monitor = require('../../models/monitor.js');

function statusAction (req, res) {
	function success () {
		res.redirect('/monitor');
	}

	function fail () {
		res.send(500);
	}

	switch (req.body.action) {
	case 'delete':
		Monitor
			.remove(req.body.selected)
			.then(success, fail);
		break;

	default:
		success();
	}
}

module.exports = statusAction;

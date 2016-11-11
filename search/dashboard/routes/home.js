var Instance = require('../models/Instance.js');
var homeViewModel = require('../viewmodels/home-view-model.js');

async function home (req, res) {
	try {
		var context = await homeViewModel();

		context.instances = await Instance.list();

		res.render('home', context);
	} catch (e) {
		res.send(500);
	}
}

module.exports = home;

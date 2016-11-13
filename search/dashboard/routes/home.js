var Instance = require('../models/Instance.js');
var homeViewModel = require('../viewmodels/home-view-model.js');
var rulesEngine = require('../app/rules-engine.js');

async function home (req, res) {
	try {
		var context = await homeViewModel();

		context.rules = rulesEngine.status();
		context.instances = await Instance.list();

		context.rulesInstances = {};
		context.rules.forEach((rule) => {
			if (typeof context.rulesInstances[rule] === 'undefined') {
				context.rulesInstances[rule] = [];
			}

			context.rulesInstances[rule].push(rule);
		});

		res.render('home', context);
	} catch (e) {
		res.send(500);
	}
}

module.exports = home;

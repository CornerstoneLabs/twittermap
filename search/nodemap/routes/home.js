var getFacebookData = require('../viewmodels/facebook.js');
var getTwitterData = require('../viewmodels/twitter.js');

function home (req, res) {
	res.render('home', {
		twitter: getTwitterData(req),
		facebook: getFacebookData(req),
		configuration: {
			serverUrl: process.env.SERVER_URL || ''
		}
	});
}

module.exports = home;

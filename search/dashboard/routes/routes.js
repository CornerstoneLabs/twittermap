var home = require('./home.js');

function routes (app) {
	app.get('/', home);
}

module.exports = routes;

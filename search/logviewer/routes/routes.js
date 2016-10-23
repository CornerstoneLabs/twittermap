var home = require('./home.js');

function routes (app) {
	app.get('/', home);
	app.post('/', home);
}

module.exports = routes;

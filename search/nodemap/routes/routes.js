var home = require('./home.js');
var passport = require('passport');
var placeMarker = require('./place-marker.js');

function routes (app) {
	app.get('/', home);
	app.post('/', home);
	app.post('/place-marker', placeMarker);
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			// Successful authentication, redirect home.
			console.log(req);
			res.redirect('/');
		});
}

module.exports = routes;

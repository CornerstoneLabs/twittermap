var home = require('./home.js');
var passport = require('passport');
var placeMarker = require('./place-marker.js');

function routes (app) {
	app.get('/', home);
	app.post('/', home);
	app.post('/place-marker', placeMarker);

	//
	// Generic log out
	//
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	//
	// Facebook auth
	//
	app.get('/auth/facebook', passport.authenticate('facebook', {  }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/',
			failureRedirect : '/'
		}));


	//
	// Twitter auth
	//
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			failureRedirect: '/'
		}),
		function(req, res) {
			// Successful authentication, redirect home.
			res.redirect('/');
		});
}

module.exports = routes;

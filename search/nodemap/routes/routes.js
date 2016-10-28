var passport = require('passport');
var home = require('./home.js');
var placeMarker = require('./place-marker.js');

function loginRequired (request, response, next) {
	request.session.returnTo = request.path;

	if (request.isAuthenticated()) {
		return next();
	}
	response.redirect('/login');
}

function routes (app) {
	app.get('/', home);
	app.get('/list', require('./list-view.js'));
	app.get('/login', require('./login.js'));
	app.post('/', home);
	app.post('/place-marker', placeMarker);

	//
	// Add to map
	//
	app.get('/add-to-map/:code/:town/pin/', loginRequired, require('./add-marker/pin.js'));
	app.post('/add-to-map/:code/:town/pin/', loginRequired, require('./add-marker/pin-confirm.js'));
	app.get('/add-to-map/select-country', loginRequired, require('./add-marker/select-country.js'));
	app.get('/add-to-map/:code/select-town', loginRequired, require('./add-marker/select-town.js'));

	//
	// Generic log out
	//
	app.get('/logout', require('./logout.js'));

	//
	// Facebook auth
	//
	app.get('/auth/facebook', passport.authenticate('facebook', {  }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			failureRedirect : '/'
		}),
		function(req, res) {
			res.redirect(req.session.returnTo || '/');
			req.session.returnTo = null;
		});


	//
	// Twitter auth
	//
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			failureRedirect: '/'
		}),
		function(req, res) {
			res.redirect(req.session.returnTo || '/');
			req.session.returnTo = null;
		});
}

module.exports = routes;

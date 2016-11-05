var passport = require('passport');
var passportTwitter = require('./passport-twitter.js');
var passportFacebook = require('./passport-facebook.js');

module.exports = function (app) {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	passportTwitter(passport);
	passportFacebook(passport);
};

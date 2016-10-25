var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

module.exports = function (app) {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	passport.use(
		new Strategy({
			consumerKey: process.env.CONSUMER_KEY,
			consumerSecret: process.env.CONSUMER_SECRET,
			callbackURL: process.env.CALLBACK_URL
		},
		function(token, tokenSecret, profile, cb) {
			console.log(profile);
			return cb(null, {
				twitter: profile
			});
		}
	));
};

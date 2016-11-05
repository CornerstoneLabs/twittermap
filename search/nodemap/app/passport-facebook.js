var FacebookStrategy = require('passport-facebook').Strategy;

function facebookMapper(profile) {
	var user = {};

	user.profileUrl = profile.profileUrl || '';
	user.displayName  = profile.displayName || '';

	if (profile.photos && profile.photos.length > 0) {
		user.facebookProfilePhoto = profile.photos[0].value;
	}

	return user;
}

function onFacebookCallback(token, tokenSecret, profile, done) {
	return done(null, {
		facebook: facebookMapper(profile)
	});
}

function attachFacebook(passport) {
	var facebookOptions = {
		clientID: process.env.FACEBOOK_CLIENT_ID,
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		callbackURL: process.env.FACEBOOK_CALLBACK_URL,
		profileFields: ['id', 'displayName', 'photos', 'profileUrl']
	};

	var facebookStrategy = new FacebookStrategy(facebookOptions, onFacebookCallback);

	passport.use(facebookStrategy);
}

module.exports = attachFacebook;

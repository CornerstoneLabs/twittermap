var TwitterStrategy = require('passport-twitter').Strategy;

function onTwitterCallback(token, tokenSecret, profile, callback) {
	return callback(null, {
		twitter: profile
	});
}

function attachTwitter(passport) {
	var twitterOptions = {
		consumerKey: process.env.CONSUMER_KEY,
		consumerSecret: process.env.CONSUMER_SECRET,
		callbackURL: process.env.CALLBACK_URL
	};

	var twitterStrategy = new TwitterStrategy(twitterOptions, onTwitterCallback);

	passport.use(twitterStrategy);
}

module.exports = attachTwitter;

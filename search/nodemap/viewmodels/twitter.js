function getTwitterData (req) {
	var result = {};

	try {
		result = {
			displayName: req.session.passport.user.twitter.displayName,
			screenName: req.session.passport.user.twitter._json.screen_name,
			profile_image_url_https: req.session.passport.user.twitter._json.profile_image_url_https
		};
	} catch (e) {

	}

	return result;
}

module.exports = getTwitterData;

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

function home (req, res) {
	res.render('home', {
		twitter: getTwitterData(req)
	});
}

module.exports = home;

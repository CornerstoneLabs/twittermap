function getFacebookData (req) {
	var result = {};

	try {
		result = {
			displayName: req.session.passport.user.facebook.displayName,
			profileUrl: req.session.passport.user.facebook.profileUrl,
			facebookProfilePhoto: req.session.passport.user.facebook.facebookProfilePhoto
		};
	} catch (e) {

	}

	return result;
}

module.exports = getFacebookData;

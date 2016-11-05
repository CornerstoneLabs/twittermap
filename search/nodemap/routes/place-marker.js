var spoofPosition = require('./add-marker/spoof-position.js');

function placeMarker (req, res) {
	if (req.body &&
		req.body.lat &&
		req.body.lng) {

		if (req.session.passport.user.facebook) {
			spoofPosition(
				req.body.lat,
				req.body.lng,
				req.session.passport.user.facebook.displayName,
				req.session.passport.user.facebook.profileUrl,
				req.session.passport.user.facebook.facebookProfilePhoto,
				'facebook',
				function (data) {
					res.send(200, data);
					return;
				}, function (err) {
					res.send(500);
					return;
				}
			);

			return;
		}

		if (req.session.passport.user.twitter) {
			spoofPosition(
				req.body.lat,
				req.body.lng,
				req.session.passport.user.twitter.displayName,
				req.session.passport.user.twitter._json.screen_name,
				req.session.passport.user.twitter._json.profile_image_url_https,
				'twitter',
				function (data) {
					res.send(200, data);
					return;
				}, function (err) {
					res.send(500);
					return;
				}
			);

			return;
		} else {
			res.send(500);
		}
	} else {
		res.send(500);
	}
}

module.exports = placeMarker;

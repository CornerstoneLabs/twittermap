var fs = require('fs');
var guid = require('guid');


function spoofPosition (latitude, longitude, fullName, screenName, avatar, success, fail) {
	var outputObject = {};
	outputObject['name'] = fullName;
	outputObject['screen_name'] = screenName;
	outputObject['lon'] = longitude;
	outputObject['lat'] = latitude;
	outputObject['avatar'] = avatar;
	outputObject['details'] = '';
	outputObject['id'] = '_' + guid.create();
	outputObject['id_str'] = outputObject['id'];

	var output = JSON.stringify(outputObject);

	fs.appendFile('../public/data/tweets.spool', output + ',', function (err) {
		if (err) {
			console.log(err);
			fail(err);
		} else {
			success(outputObject);
		}
	});
}

function placeMarker (req, res) {
	if (req.body &&
		req.body.lat &&
		req.body.lng) {

		if (req.session.passport.user.twitter) {
			spoofPosition(
				req.body.lat,
				req.body.lng,
				req.session.passport.user.twitter.displayName,
				req.session.passport.user.twitter._json.screen_name,
				req.session.passport.user.twitter._json.profile_image_url_https,
				function (data) {
					res.send(200, data);
					return;
				}, function (err) {
					res.send(500);
					return;
				}
			);
		} else {
			res.send(500);
		}
	} else {
		res.send(500);
	}
}

module.exports = placeMarker;

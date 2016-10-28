var fs = require('fs');
var guid = require('guid');

function spoofPosition (latitude, longitude, fullName, screenName, avatar, provider, success, fail) {
	var outputObject = {};
	outputObject['name'] = fullName;
	outputObject['screen_name'] = screenName;
	outputObject['lon'] = longitude;
	outputObject['lat'] = latitude;
	outputObject['avatar'] = avatar;
	outputObject['details'] = '';
	outputObject['id'] = '_' + guid.create();
	outputObject['id_str'] = outputObject['id'];
	outputObject['provider'] = provider;

	var output = JSON.stringify(outputObject);

	fs.appendFile('../public/data/tweets.spool', output + ',', function (err) {
		if (err) {
			console.log(err);
			fail(err);
		} else {
			success(outputObject);

			fs.writeFileSync('../datastores/tweet-geocoded/pending/' + outputObject['id'] + '.json', output, 'utf-8');
		}
	});
}

module.exports = spoofPosition;

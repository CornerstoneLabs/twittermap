var repository = require('../repositories/master.js');
var couchdbDocumentMapper = require('../repositories/couchdbDocumentMapper.js');
var couchdbDocumentSorter = require('../repositories/couchdbDocumentSorter.js');

function hasTrueKey(req, res, key) {
	var metaKey;

	function complete (data) {
		try {
			var newData = data.rows.map(couchdbDocumentMapper);
			newData = newData.sort(couchdbDocumentSorter);

			var context = {
				data: newData,
				rows: data.rows.length
			};
			res.render('home', context);
		} catch (e) {
			res.render('home');
		}
	}

	repository
		.getThread(req.query.truekey)
		.then(complete);

	return;
}

function inspectMetaKey(req, res, key) {
	var metaKey;

	function complete (data) {
		try {
			var newData = data.rows.map(couchdbDocumentMapper);
			newData = newData.sort(couchdbDocumentSorter);

			var context = {
				data: newData,
				rows: data.rows.length,
				key: key
			};
			res.render('home', context);
		} catch (e) {
			res.render('home');
		}
	}

	repository
		.getMetakey(key)
		.then(function (metakey) {
			metaKey = metakey;

			repository
				.getThread(metakey)
				.then(complete);
		});
}

function listItems (req, res) {
	repository
		.getEvent('TWEET_RECEIVED')
		.then(function (data) {
			let context = {
				startTweets: data.rows || []
			};

			res.render('home', context);
		});
}

function home (req, res) {
	if (req.query.truekey) {
		return hasTrueKey(req, res, req.body.key);
	}

	if (req.body && req.body.key) {
		return inspectMetaKey(req, res, req.body.key);
	}

	return listItems(req, res);
}

module.exports = home;

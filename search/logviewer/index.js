var express = require('express');
var exphbs  = require('express-handlebars');
var request = require('request');
var Handlebars =require('handlebars');
var bodyParser = require('body-parser')
var fs = require('fs');

function initialise () {
	var app = express();

	app.use(bodyParser.urlencoded({ extended: false }));
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	return app;
}

function getMetakey(key) {
	return new Promise(function (resolve, reject) {
		var url = `http://127.0.0.1:5984/tweetmap/_design/ancestor/_view/find?key=%22${key}%22`;

		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				if (data.rows.length > 0) {
					resolve(data.rows[0].value);
				} else {
					resolve('');
				}
			} else {
				reject(error);
			}
		});
	});
}

function couchQuery(url) {
	return new Promise(function (resolve, reject) {
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				reject(error);
			}
		});
	});
}

function getThread(key) {
	var url = `http://127.0.0.1:5984/tweetmap/_design/ancestor/_view/thread?key=%22${key}%22`;

	return couchQuery(url);
}

function getEvent(key) {
	var url = `http://127.0.0.1:5984/tweetmap/_design/event/_view/datetime?key=%22${key}%22`;

	return couchQuery(url);
}

function couchdbDocumentSorter (a, b) {
	if (a.datetime <  b.datetime) {
		return -1;
	}

	if (a.datetime > b.datetime) {
		return 1;
	}

	return 0;
}

function couchdbDocumentMapper (item) {
	return item.value;
}

function home (req, res) {
	if (req.query.truekey) {
		var key = req.body.key;
		var metaKey;

		function complete (data) {
			try {
				var newData = data.rows.map(couchdbDocumentMapper);
				newData = newData.sort(couchdbDocumentSorter);

				var context = {
					data: newData,
					rows: data.rows.length,
					key: req.body.key
				};
				res.render('home', context);
			} catch (e) {
				res.render('home');
			}
		}

		getThread(req.query.truekey)
			.then(complete);

		return;
	}

	if (req.body && req.body.key) {
		var key = req.body.key;
		var metaKey;

		function complete (data) {
			try {
				var newData = data.rows.map(couchdbDocumentMapper);
				newData = newData.sort(couchdbDocumentSorter);

				var context = {
					data: newData,
					rows: data.rows.length,
					key: req.body.key
				};
				res.render('home', context);
			} catch (e) {
				res.render('home');
			}
		}

		getMetakey(key)
			.then(function (metakey) {
				metaKey = metakey;

				getThread(metakey)
					.then(complete);
			});

	} else {
		getEvent('TWEET_RECEIVED')
			.then(function (data) {
				let context = {
					startTweets: data.rows || []
				};

				res.render('home', context);
			});
	}
}

function readFile (path) {
	return fs.readFileSync(path, 'utf8')
}

function helpers (app) {
	Handlebars.registerHelper('json', function(obj) {
		return JSON.stringify(obj);
	});

	Handlebars.registerPartial('TWEET_RECEIVED', readFile('./views/partials/tweet-received.partial'));
	Handlebars.registerPartial('TWEET_REPLY_SENT', readFile('./views/partials/tweet-reply-sent.partial'));
	Handlebars.registerPartial('TWEET_GEOCODED', readFile('./views/partials/tweet-geocoded.partial'));
	Handlebars.registerPartial('TWEET_MENTIONED', readFile('./views/partials/tweet-mentioned.partial'));
}

function routes (app) {
	app.get('/', home);
	app.post('/', home);
}

function start (app) {
	app.listen(3000);
}

var app = initialise();
helpers();
routes(app);
start(app);

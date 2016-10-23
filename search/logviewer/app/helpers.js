var Handlebars = require('handlebars');
var fs = require('fs');

function readFile (path) {
	return fs.readFileSync(path, 'utf8');
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

module.exports = helpers;

var Handlebars = require('handlebars');
var fs = require('fs');

function readFile (path) {
	return fs.readFileSync(path, 'utf8');
}

function helpers (app) {
	Handlebars.registerHelper('json', function(obj) {
		return JSON.stringify(obj);
	});

}

module.exports = helpers;

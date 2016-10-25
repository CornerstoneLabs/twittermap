var express = require('express');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

function initialise () {
	var app = express();

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	var sessionOptions = {
		path: '../sessions'
	};
	app.use(session({
		store: new FileStore(sessionOptions),
		secret: 'dumteedum'
	}));

	return app;
}

module.exports = initialise;

var helpers = require('./app/helpers.js');
var initialise = require('./app/initialise.js');
var routes = require('./routes/routes.js');
var start = require('./app/start.js');
var app = initialise();

helpers();
routes(app);
start(app);

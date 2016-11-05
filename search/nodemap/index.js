var dotenv = require('dotenv');
var helpers = require('./app/helpers.js');
var initialise = require('./app/initialise.js');
var passport = require('./app/passport.js');
var routes = require('./routes/routes.js');
var start = require('./app/start.js');
var static = require('./app/static.js');

dotenv.config();

var app = initialise();
passport(app);
helpers();
routes(app);
static(app);
start(app);

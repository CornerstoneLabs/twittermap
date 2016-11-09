function routes (app) {
	app.get('/', require('./home.js'));

	app.get('/monitor/', require('./monitor/monitor.js'));
	app.post('/monitor/add', require('./monitor/monitor-add.js'));
	app.post('/monitor/action', require('./monitor/monitor-action.js'));

	app.get('/instances/', require('./instances/instances.js'));
	app.post('/instances/add', require('./instances/instances-add.js'));
	app.post('/instances/action', require('./instances/instances-action.js'));
}

module.exports = routes;

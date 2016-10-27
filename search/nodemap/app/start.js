function start (app) {
	app.listen(int(process.env.SERVER_PORT));
}

module.exports = start;

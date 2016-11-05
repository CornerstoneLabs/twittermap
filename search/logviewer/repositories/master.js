var request = require('request');

function getMetakey(key) {
	return new Promise(function (resolve, reject) {
		var url = `http://127.0.0.1:5984/dumteedum/_design/ancestor/_view/find?key=%22${key}%22`;

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
	var url = `http://127.0.0.1:5984/dumteedum/_design/ancestor/_view/thread?key=%22${key}%22`;

	return couchQuery(url);
}

function getEvent(key) {
	var url = `http://127.0.0.1:5984/dumteedum/_design/event/_view/datetime?key=%22${key}%22`;

	return couchQuery(url);
}

module.exports = {
	getMetakey: getMetakey,
	getThread: getThread,
	getEvent: getEvent
};

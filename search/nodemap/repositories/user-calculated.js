var fs = require('fs');
var filePath = '../public/data/user-calculated-nearest.spool';

function load() {
	return new Promise(function (resolve, reject) {
		console.log('Loading calculated data');

		fs.readFile(filePath, function read(err, buffer) {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve({});
					return;
				} else {
					console.log(err);
					resolve({});
					return;
				}
			} else {
				try {
					var data = buffer.toString();
					var parsedData = JSON.parse(data);

					resolve(parsedData);
				} catch (e) {
					console.log(e);
					//
					// Can't parse the file. Give up.
					//
					resolve({});
				}
			}
		});
	});
}

function save(data) {
	return new Promise(function (resolve, reject) {
		_cache = data;

		fs.writeFile(filePath, JSON.stringify(data), 'utf-8', function done (err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

module.exports = {
	load: load,
	save: save
};

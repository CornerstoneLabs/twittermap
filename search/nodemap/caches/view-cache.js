var fs = require('fs');

function read (key) {
	return new Promise(function (resolve, reject) {
		var filePath = '../public/cache/' + key;

		fs.readFile(filePath, {encoding: 'utf-8'}, function read(err, buffer) {
			if (err) {
				reject(err);
			} else {
				var data = buffer.toString();
				var parsedData = JSON.parse(data);
				console.log('Read out of cache', key);
				return resolve(parsedData);
			}
		});
	});
}

function write (key, data) {
	return new Promise(function (resolve, reject) {
		var filePath = '../public/cache/' + key;

		fs.writeFile(filePath, JSON.stringify(data), {encoding: 'utf-8'}, function written (err) {
			if (err) {
				return reject(err);
			} else {
				return resolve(data);
			}
		});
	});
}

module.exports = {
	read: read,
	write: write
};

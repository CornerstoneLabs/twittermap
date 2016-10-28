var fs = require('fs');

function all () {
	return new Promise(function (resolve, reject) {
		var filePath = '../public/data/tweets.spool';

		fs.readFile(filePath, function read(err, buffer) {
			console.log('Read all users');
			if (err) {
				console.log(err);
				reject(err);
			} else {
				var data = buffer.toString();
				var parsedData = JSON.parse('[' + data.substring(0, data.length - 1) + ']');
				resolve(parsedData);
			}
		});
	});
}

module.exports = {
	all: all
};

var csv = require('csv');
var fs = require('fs');
var _cache;

function all () {
	return new Promise(function (resolve, reject) {
		if (typeof _cache !== 'undefined') {
			resolve(_cache);
			return;
		}

		var filePath = '../geo/GeoLiteCity-Location.csv';

		fs.readFile(filePath, {encoding: 'utf-8'}, function read(err, data) {
			if (err) {
				reject(err);
			} else {
				var buffer = data.toString();
				console.log(buffer.length);

				csv.parse(buffer, {}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						_cache = data;
						resolve(data);
					}
				});

			}
		});
	});
}

module.exports = all;

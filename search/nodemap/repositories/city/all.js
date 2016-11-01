var csv = require('csv');
var fs = require('fs');
var _cache;

function allPromise(resolve, reject) {
	if (typeof _cache !== 'undefined') {
		resolve(_cache);
		return;
	}

	var filePath = '../geo/GeoLiteCity-Location.csv';

	function csvParsed(err, data) {
		if (err) {
			reject(err);
		} else {
			_cache = data;
			resolve(data);
		}
	}

	function readFileSuccess(err, data) {
		if (err) {
			reject(err);
		} else {
			var buffer = data.toString('utf-8');

			csv.parse(buffer, {}, csvParsed);
		}
	}

	fs.readFile(filePath, {encoding: 'utf-8'}, readFileSuccess);
}

function all () {
	return new Promise(allPromise);
}

//module.exports = all;

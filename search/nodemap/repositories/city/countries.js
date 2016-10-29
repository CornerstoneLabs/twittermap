var csv = require('csv');
var fs = require('fs');
var _cache;

var COUNTRY_CODE_INDEX = 4;
var COUNTRY_NAME_INDEX = 5

function haveCountryCode(data, code) {
	return data.filter(function (item) {
		return (item.code === code);
	}).length > 0;
}

function findUniqueCountries(data) {
	var result = [];

	data.forEach(function (item) {
		if (haveCountryCode(result, item[COUNTRY_CODE_INDEX]) === false) {
			result.push({
				code: item[COUNTRY_CODE_INDEX],
				name: item[COUNTRY_NAME_INDEX]
			});
		}
	});

	result.sort(function (a, b) {
		if (a.name < b.name) {
			return -1;
		}

		if (a.name > b.name) {
			return 1;
		}

		return 0;
	});

	return result;
}

function countries () {
	return new Promise(function (resolve, reject) {
		if (typeof _cache !== 'undefined') {
			resolve(_cache);
			return;
		}

		var filePath = '../geo/GeoIPCountryWhois.csv';

		fs.readFile(filePath, {encoding: 'utf-8'}, function read(err, data) {
			if (err) {
				reject(err);
			} else {
				var buffer = data.toString();

				csv.parse(buffer, {}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						_cache = findUniqueCountries(data);
						resolve(_cache);
					}
				});

			}
		});
	});
}

module.exports = countries;

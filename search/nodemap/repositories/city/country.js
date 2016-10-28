var all = require('./all.js');
var _cache = {};

function country (code) {
	return new Promise(function(resolve, reject) {

		if (typeof _cache[code] !== 'undefined') {
			resolve(_cache[code]);
		} else {
			all().then(function (data) {
				var towns = data.filter(function (item) {
					return (item[1] === code);
				});

				var remapTowns = towns.map(function (item) {
					return {
						code: item[1],
						name: item[3],
						latitude: item[5],
						longitude: item[6]
					};
				});

				_cache[code] = remapTowns;

				resolve(remapTowns);
			}, reject);
		}
	});
}

module.exports = country;

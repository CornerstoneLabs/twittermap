var all = require('./all.js');
var cache = require('../../caches/view-cache.js');

function townMapper(item) {
	return {
		code: item[1],
		name: item[3],
		latitude: item[5],
		longitude: item[6]
	};
}

function townFilter(code) {
	return function (item) {
		return (item[1] === code);
	};
}

function country (code) {
	return new Promise(function(resolve, reject) {
		var viewKey = 'country-town-list-' + code;

		function cacheLoaded(data) {
			var townsInCountry = data.filter(townFilter(code));
			var remapTowns = townsInCountry.map(townMapper);

			cache
				.write(viewKey, remapTowns)
				.then(resolve, reject);
		}

		function noCache() {
			all().then(cacheLoaded, reject);
		}

		cache
			.read(viewKey)
			.then(resolve, noCache);
	});
}

module.exports = country;

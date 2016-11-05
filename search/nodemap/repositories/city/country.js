var all = require('./all.js');
var cache = require('../../caches/view-cache.js');
var request = require('request');

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

		function cacheLoaded(remapTowns) {
			//var townsInCountry = data.filter(townFilter(code));
			//var remapTowns = townsInCountry.map(townMapper);

			cache
				.write(viewKey, remapTowns)
				.then(resolve, reject);
		}

		function noCache() {
			loadTowns(code, cacheLoaded);
			//all().then(cacheLoaded, reject);
		}

		cache
			.read(viewKey)
			.then(resolve, noCache);
	});
}

function loadTowns(countryCode, callback) {
	var results = [];
	var _scroll_id;

	var url = 'http://127.0.0.1:9200/towns/town/_search?scroll=1m';
	var q = {
		"query": {
			"constant_score": {
				"filter": {
					"term": {
						"country_code": countryCode.toLowerCase()
					}
				}
			}
		}
	};

	function requestCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			if (typeof body === 'string') {
				body = JSON.parse(body);
			}

			_scroll_id = body._scroll_id;

			url = 'http://127.0.0.1:9200/_search/scroll?scroll=1m&scroll_id=' + _scroll_id;

			if (body.hits.hits.length > 0) {
				body.hits.hits.forEach(function (item) {
					results.push({
						code: item._source.country_code.toUpperCase(),
						name: item._source.name,
						latitude: item._source.location.lat,
						longitude: item._source.location.lon
					});
				});

				request(url, requestCallback);
			} else {
				console.log('Returning results' + results.length);
				callback(results);
			}
		} else {
			console.log(body);
		}
	}

	request.post(url, { json: q }, requestCallback);
}

module.exports = country;

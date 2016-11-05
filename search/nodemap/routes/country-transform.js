var countries = require('country-data').countries;

function findCountry(list, country) {
	var result;

	list.map(function (item) {
		if (item.code === country) {
			result = item;
		}
	});

	return result;
}

function countryTransform(list) {
	var countryData = [];

	list.forEach(function (item) {
		var countryCode = 'Uncalculated';

		if (item.location && (item.location.country !== 'undefined')) {
			countryCode = item.location.country;
		}

		var c = findCountry(countryData, countryCode);

		if (typeof c === 'undefined') {
			var name = countryCode;

			if (countries[countryCode]) {
				name = countries[countryCode].name;
			}

			c = {
				code: countryCode,
				name: name,
				people: []
			};

			countryData.push(c);
		}

		c.people.push(item);
	});

	return countryData;
}

module.exports = countryTransform;

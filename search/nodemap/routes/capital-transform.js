function findCapital(list, capital) {
	var result;

	list.map(function (item) {
		if (item.code === capital) {
			result = item;
		}
	});

	return result;
}

function capitalTransform(list, key) {
	var capitalData = [];

	list.forEach(function (item) {
		if (item[key] !== '') {
			var capitalCode = item[key].substring(0, 1);

			var c = findCapital(capitalData, capitalCode);

			if (typeof c === 'undefined') {
				c = {
					code: capitalCode,
					items: []
				};

				capitalData.push(c);
			}

			var findLength = (c.items.filter(function (findItem) {
				return findItem[key] == item[key];
			})).length;

			//
			// Don't duplicate
			//
			if (findLength === 0) {
				c.items.push(item);
			}
		}
	});

	capitalData.forEach(function (item) {
		item.items.sort(function (a, b) {
			if (a[key] < b[key]) {
				return -1;
			}

			if (a[key] > b[key]) {
				return 1;
			}

			return 0;
		});
	});

	capitalData.sort(function (a, b) {
		if (a.code < b.code) {
			return -1;
		}

		if (a.code > b.code) {
			return 1;
		}

		return 0;
	});

	return capitalData;
}

module.exports = capitalTransform;

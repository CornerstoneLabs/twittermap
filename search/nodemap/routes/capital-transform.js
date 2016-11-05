function findCapital(list, capital) {
	var result;

	list.map(function (item) {
		if (item.code === capital) {
			result = item;
		}
	});

	return result;
}

function capitalDataSortDelegate(a, b) {
	if (a.code < b.code) {
		return -1;
	}

	if (a.code > b.code) {
		return 1;
	}

	return 0;
}

function itemSortDelegate(key) {
	return function (a, b) {
		if (a[key] < b[key]) {
			return -1;
		}

		if (a[key] > b[key]) {
			return 1;
		}

		return 0;
	};
}

function capitalTransform(list, key) {
	var capitalData = [];

	function handleListItem(item) {
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
			c.items.push(item);
		}
	}

	for (var i=0; i<list.length;i++) {
		handleListItem(list[i]);
	}

	function handleCapitalizeItem(item) {
		try {
			item.items = Array.from(item.items);
			item.items.sort(itemSortDelegate(key));
		} catch (e) {
			console.log(e);
		}
	}

	for(var j=0; j<capitalData.length; j++) {
		handleCapitalizeItem(capitalData[j]);
	}

	capitalData.sort(capitalDataSortDelegate);

	return capitalData;
}

module.exports = capitalTransform;

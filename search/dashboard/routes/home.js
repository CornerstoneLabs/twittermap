var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

function connect () {
	var DATABASE_CONNECTION = 'mongodb://192.168.1.90:27017/dumteedum_status';

	return new Promise(function (resolve, reject) {
		MongoClient.connect(DATABASE_CONNECTION, function (err, db) {
			if (err) {
				reject(err);
			} else {
				resolve(db);
			}
		});
	});
}

function elasticSearchMapper(input) {
	var result = {};

	try {
		result.date = input.date;
	} catch (e) {
		// do nothing
	}

	try {
		result.data = input.data._all.total.docs.count;
	} catch (e) {
		// do nothing
	}

	return result;
}

function memoryFreeMapper(input) {
	return {
		date: input.date,
		data: input.data
	};
}

var queries = [
	{
		name: 'elasticsearch',
		collection: 'elasticsearch',
		mapper: elasticSearchMapper,
		partial: 'elasticsearch'
	},
	{
		name: 'memoryFree',
		collection: 'memory-free',
		mapper: memoryFreeMapper,
		partial: 'memory-free'
	}
];

function findLatest(data) {
	var result = null;
	var oldDate = null;

	data.forEach((item) => {
		console.log(item);
		var itemIsNewer =
			(oldDate === null) ||
			(
				(oldDate !== null) &&
				(item.date > oldDate)
			);

		if (itemIsNewer) {
			oldDate = item.date;
			result = item.data;
		}
	});

	return {
		date: oldDate,
		data: result
	};
}

function home (req, res) {
	var _db;

	function executeQuery(query) {
		return new Promise((resolve, reject) => {
			var collection = _db.collection(query.collection);

			collection.find().toArray(function(err, results) {
				query.data = results.map(query.mapper);
				query.latest = findLatest(query.data);

				resolve();
			});
		});
	}

	function complete() {
		var context = {};

		queries.forEach((query) => {
			context[query.name] = query;
		});

		context.partials = queries.map((item) => {
			return () => {
				return item.partial;
			};
		});

		res.render('home', context);

		_db.close();
	}

	function checkAll() {
		console.log('Checking complete');
		var success = true;

		queries.forEach((query) => {
			console.log(query.data);
			if (typeof query.data === 'undefined') {
				success = false;
			}
		});

		if (success) {
			console.log('complete');
			complete();
		}
	}

	function executeQueries(db) {
		_db = db;
		var promises = [];

		queries.forEach((query) => {
			promises.push(executeQuery(query));
		});

		Promise.all(promises).then(checkAll, fail);
	}

	function fail() {
		res.send(500);
	}

	connect().then(executeQueries, fail);
}

module.exports = home;

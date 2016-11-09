var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

function connect () {
	var DATABASE_CONNECTION = 'mongodb://192.168.1.90:27017/dumteedum_status';

	return new Promise((resolve, reject) => {
		MongoClient.connect(DATABASE_CONNECTION, function (err, db) {
			if (err) {
				reject(err);
			} else {
				resolve(db);
			}
		});
	});
}

function get(collectionName, id) {
	return new Promise((resolve, reject) => {
		function found(err, document) {
			if (err) {
				reject(err);
			} else {
				resolve(document);
			}
		}

		function success(_db) {
			let collection = _db.collection(collectionName);
			let query = {
				_id: ObjectID(id)
			};

			collection.findOne(query, found);
		}

		connect().then(success, reject);
	});
}

function update(collectionName, id, data) {
	return new Promise((resolve, reject) => {
		function found(err, document) {
			if (err) {
				reject(err);
			} else {
				resolve(document);
			}
		}

		function success(_db) {
			let collection = _db.collection(collectionName);
			let query = {
				_id: ObjectID(id)
			};

			collection.update(query, {
				$set: data
			});

			resolve();
		}

		connect().then(success, reject);
	});
}

function remove(collectionName, id) {
	return new Promise((resolve, reject) => {
		function found(err, document) {
			if (err) {
				reject(err);
			} else {
				resolve(document);
			}
		}

		function success(_db) {
			let collection = _db.collection(collectionName);
			let query = {
				_id: ObjectID(id)
			};

			collection.findAndRemove(query, found);
		}

		connect().then(success, reject);
	});
}

function list(collectionName) {
	return new Promise((resolve, reject) => {
		function found(err, document) {
			if (err) {
				reject(err);
			} else {
				resolve(document.toArray());
			}
		}

		function success(_db) {
			let collection = _db.collection(collectionName);

			collection.find({}, found);
		}

		connect().then(success, reject);
	});
}

function insert(collectionName, data) {
	return new Promise((resolve, reject) => {
		function done(err, document) {
			if (err) {
				reject(err);
			} else {
				resolve(document);
			}
		}

		function success(_db) {
			let collection = _db.collection(collectionName);

			collection.insertOne(data, done);
		}

		connect().then(success, reject);
	});
}

module.exports = {
	connect: connect,
	get: get,
	insert: insert,
	list: list,
	remove: remove,
	update: update
};

var mongo = require('../repositories/mongo.js');

class ModelDatabase {
	get(collectionName, id) {
		return new Promise((resolve, reject) => {
			mongo
				.get(collectionName, id)
				.then(resolve, reject);
		});
	}

	update(collectionName, id, data) {
		return new Promise((resolve, reject) => {
			mongo
				.update(collectionName, id, data)
				.then(resolve, reject);
		});
	}

	remove(collectionName, id) {
		return new Promise((resolve, reject) => {
			mongo
				.remove(collectionName, id)
				.then(resolve, reject);
		});
	}

	insert(collectionName, data) {
		return new Promise((resolve, reject) => {
			mongo
				.insert(collectionName, data)
				.then(resolve, reject);
		});
	}

	list(collectionName) {
		return new Promise((resolve, reject) => {
			mongo
				.list(collectionName)
				.then(resolve, reject);
		});
	}
}

module.exports = ModelDatabase;

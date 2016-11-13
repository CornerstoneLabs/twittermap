var BaseModel = require('./BaseModel.js');
var connect = require('../repositories/mongo.js').connect;

class Monitor extends BaseModel {
	static _collection() {
		return 'MONITOR';
	}

	_latest(mongoCollection) {
		return new Promise(async function (resolve, reject) {
			try {
				let db = await connect();
				let collection = db.collection(mongoCollection);

				collection
					.find()
					.sort({date: -1})
					.limit(1)
					.toArray((err, results) => {
						console.log('returnnig from latest');
						if (err) {
							reject(err);
						} else {
							resolve(results);
						}
					});
			} catch (e) {
				reject(e);
			}
		});
	}

	latest () {
		return this._latest(this.mongoCollection);
	}
}

module.exports = Monitor;

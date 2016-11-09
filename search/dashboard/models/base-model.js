var ModelDatabase = require('./model-database.js');

class BaseModel {
	static get(id) {
		var modelDatabase = new ModelDatabase();

		return modelDatabase.get(this._collection(), id);
	}

	static update(id, data) {
		var modelDatabase = new ModelDatabase();

		return modelDatabase.update(this._collection(), id, data);
	}

	static remove(id) {
		var modelDatabase = new ModelDatabase();

		return modelDatabase.remove(this._collection(), id);
	}


	static insert(data) {
		var modelDatabase = new ModelDatabase();

		return modelDatabase.insert(this._collection(), data);
	}

	static list() {
		var modelDatabase = new ModelDatabase();

		return modelDatabase.list(this._collection());
	}
}

module.exports = BaseModel;

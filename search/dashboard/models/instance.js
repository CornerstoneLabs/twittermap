var BaseModel = require('./base-model.js');

class Instance extends BaseModel {
	static _collection() {
		return 'INSTANCES';
	}
}

module.exports = Instance;

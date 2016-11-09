var BaseModel = require('./base-model.js');

class Monitor extends BaseModel {
	static _collection() {
		return 'MONITOR';
	}
}

module.exports = Monitor;

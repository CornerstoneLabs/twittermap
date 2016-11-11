var BaseModel = require('./BaseModel.js');

class Monitor extends BaseModel {
	static _collection() {
		return 'MONITOR';
	}
}

module.exports = Monitor;

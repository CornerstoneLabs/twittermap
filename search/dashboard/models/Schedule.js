var BaseModel = require('./BaseModel.js');

class Schedule extends BaseModel {
	static _collection() {
		return 'SCHEDULE';
	}
}

module.exports = Schedule;

var BaseModel = require('./BaseModel.js');
var Monitor = require('./Monitor.js');

class Schedule extends BaseModel {
	static _collection() {
		return 'SCHEDULE';
	}

	Monitor () {
		var monitorId = this.monitor;

		return new Promise(async (resolve, reject) => {
			try {
				var monitor = await Monitor.get(monitorId);
				resolve(monitor);
			} catch (e) {
				reject(e);
			}
		})
	}
}

module.exports = Schedule;

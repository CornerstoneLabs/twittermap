var Schedule = require('../../models/Schedule.js');
var Monitor = require('../../models/Monitor.js');
var connect = require('../../repositories/mongo.js').connect;
var scheduletasks = require('../../app/scheduled-tasks.js');

async function viewLog(req, res, id) {
	let schedule = await Schedule.get(id);
	let db = await connect();
	let collection = db.collection('SCHEDULE_LOG');
	let query = {
		schedule_id: id
	};
	let orderBy = {
		date: -1
	};

	collection
		.find(query)
		.sort(orderBy)
		.toArray(function(err, results) {
			res.render("schedule-log", {
				log: results
			});
		});
}

class ScheduleAction {
	constructor(req, res) {
		this.request = req;
		this.response = res;
	}

	success () {
		this.response.redirect('/schedule');
	}

	fail () {
		this.response.send(500);
	}

	actionDelete () {
		Schedule
			.remove(this.request.body.selected)
			.then(this.success, this.fail);
	}

	async actionExecute () {
		let id = this.request.body.selected;
		let schedule = await Schedule.get(id);

		scheduletasks.executeScheduledItem(schedule);

		this.response.redirect('/schedule');
	}

	async actionLastRun () {
		try {
			let id = this.request.body.selected;
			let schedule = await Schedule.get(id);
			let monitor = await schedule.Monitor();
			let results = await monitor.latest();
			let context = {
				results: results
			};

			this.response.render("schedule-latest", context);
		} catch (e) {
			console.log(e);
			this.response.send(500);
		}
	}

	async handle () {
		switch (this.request.body.action) {
		case 'delete':
			this.actionDelete();
			break;

		case 'execute':
			this.actionExecute();
			break;

		case 'lastrun':
			this.actionLastRun();
			break;

		case 'log':
			viewLog(this.request, this.response, this.request.body.selected);
			break;

		default:
			this.success();
		}
	}
}

module.exports = ScheduleAction;
var Schedule = require('../../models/Schedule.js');
var Monitor = require('../../models/Monitor.js');
var scheduletasks = require('../../app/scheduletasks.js');
var connect = require('../../repositories/mongo.js').connect;

async function scheduleAction (req, res) {
	function success () {
		res.redirect('/schedule');
	}

	function fail () {
		res.send(500);
	}

	switch (req.body.action) {
		case 'delete':
			Schedule
				.remove(req.body.selected)
				.then(success, fail);
			break;

		case 'execute':
			var id = req.body.selected;
			var schedule = await Schedule.get(id);

			console.log(id);
			console.log('Executing ', schedule);

			scheduletasks.executeScheduledItem(schedule);

			res.redirect('/schedule');

			break;

		case 'lastrun':
			var id = req.body.selected;
			var schedule = await Schedule.get(id);
			var monitor = await Monitor.get(schedule.monitor);
			var db = await connect();
			var collection = db.collection(monitor.mongoCollection);

			collection.find().sort({date:-1}).limit(1).toArray(function(err, results) {
				console.log(monitor.mongoCollection);

				console.log(results);

				res.render("schedule-latest", {
					results: results
				});
			});

			break;

		default:
			success();
	}
}

module.exports = scheduleAction;

var nodeSchedule = require('node-schedule');
var Schedule = require('../models/Schedule.js');
var Monitor = require('../models/Monitor.js');
var Instance = require('../models/Instance.js');
var job;
var rules = [];
var output = [];

async function checkSchedule (schedule) {
	let monitorId = schedule.monitor;
	let monitor = await Monitor.get(monitorId);
	let instance = await Instance.get(schedule.instance);
	let results = await monitor.latest();

	results.forEach((result) => {
		try {
			var timeDifference = (new Date() - result.date) / 1000;
			let status = 'green';

			if (timeDifference > 60) {
				status = 'red';
			}

			output.push({
				name: monitor.name,
				instance: instance,
				status: status,
				message: `Last heard ${timeDifference}`,
				information: null
			});
		} catch (e) {
			output.push({
				name: 'MongoDB',
				instance: 'local',
				status: 'red',
				message: 'Error connecting to database',
				information: e
			});
		}
	});
}

rules.push(async () => {
	try {
		var schedules = await Schedule.list();

		schedules.forEach(checkSchedule);
	} catch (e) {
		console.log('Error getting schedule list');
		console.log(e);
	}
});

function run () {
	output = [];
	output.push({
		name: 'Rules engine',
		status: 'green',
		message: `Running ${rules.length}.`,
		information: null
	});

	rules.forEach(async (rule) => {
		var result = await rule();
	});
}

function start () {
	job = nodeSchedule.scheduleJob('* * * * * *', function () {
		run();
	});
}

function status () {
	output.sort((a, b) => {
		if (a.instance > b.instance) {
			return 1;
		}

		if (a.instance < b.instance) {
			return 0;
		}

		return 0;
	});
	return output;
}

module.exports = {
	start: start,
	status: status
};
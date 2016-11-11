var nodeSchedule = require('node-schedule');
var Instance = require('../models/Instance.js');
var Monitor = require('../models/Monitor.js');
var Schedule = require('../models/Schedule.js');
var exec = require('child_process').exec;

var jobs = [];
var CWD = './fabric-plugins/';
var COMMAND = 'fab ';

async function executeScheduledItem (schedule) {
	var monitor = await Monitor.get(schedule.monitor);
	var instance = await Instance.get(schedule.instance);
	var commandText = `${COMMAND} ${monitor.fabricCommand}`;

	console.log(commandText);

	var environment = {};
	for (var e in process.env) {
		environment[e] = process.env[e];
	}

	environment.hosts = instance.ip;
	environment.user = instance.user;

	exec(commandText, {
		cwd: CWD,
		env: environment
	}, function callback(error, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		console.log(error);
	});
}

async function scheduleJobs () {
	var schedules = await Schedule.list();

	schedules.forEach((schedule) => {
		console.log(`Scheduling task ${schedule.monitor} for ${schedule.cron}`);

		try {

			var job = nodeSchedule.scheduleJob(schedule.cron, function () {
				executeScheduledItem(schedule);
			});
		} catch (e) {
			console.log(e);
		}

		console.log('Created job, pushing into jobs stack.');

		jobs.push(job);
	});
}

async function initialise () {
	scheduleJobs();
}

function reset() {
	jobs.forEach((job) => {
		console.log('Cancelling job');
		job.cancel();
	});

	scheduleJobs();
}

module.exports = {
	initialise: initialise,
	reset: reset,
	executeScheduledItem: executeScheduledItem
};

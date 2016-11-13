var nodeSchedule = require('node-schedule');
var Instance = require('../models/Instance.js');
var Monitor = require('../models/Monitor.js');
var Schedule = require('../models/Schedule.js');
var exec = require('child_process').exec;

var jobs = [];
var CWD = './fabric-plugins/';
var COMMAND = 'fab ';

/**
 * Clone the local environment, then override some variables
 *
 * @param instance
 * @param schedule
 * @returns {{evironment}}
 */
function childEnvironmentFactory(instance, schedule) {
	var environment = {};
	for (var e in process.env) {
		environment[e] = process.env[e];
	}

	environment.hosts = instance.ip;
	environment.user = instance.user;
	environment.DASHBOARD_SCHEDULE_ID = schedule._id;

	return environment;
}

function executeScheduledItemCallback (error, stdout, stderr) {
	console.log(stdout);
	console.log(stderr);
	console.log(error);
}

/**
 * Execute the scheduled item.
 *
 * @param schedule
 */
async function executeScheduledItem (schedule) {
	console.log('Preparing to execute scheduled task');

	var monitor = await Monitor.get(schedule.monitor);
	var instance = await Instance.get(schedule.instance);
	var commandText = `${COMMAND} ${monitor.fabricCommand}`;
	var environment = childEnvironmentFactory(instance, schedule);
	var params = {
		cwd: CWD,
		env: environment
	};

	console.log(`Exec: ${commandText}`);
	console.log(environment);
	exec(commandText, params, executeScheduledItemCallback);
	console.log('Executed.')
}

/**
 * Enqueue scheduled task in the jobs list.
 *
 * @param schedule
 */
function enqueueJob (schedule) {
	console.log(`Scheduling task ${schedule.monitor} for ${schedule.cron}`);

	try {
		var job = nodeSchedule.scheduleJob(schedule.cron, function () {
			console.log(`Executing task ${schedule.monitor} for ${schedule.cron}`)
			executeScheduledItem(schedule);
		});

		jobs.push(job);
	} catch (e) {
		console.log(e);
	}

	console.log('Created job, pushing into jobs stack.');
}

/**
 * Schedule all jobs in the scheduler to be run.
 */
async function scheduleJobs () {
	var schedules = await Schedule.list();

	schedules.forEach(enqueueJob);
}

async function start () {
	scheduleJobs();
}

/**
 * Cancel all jobs and re-schedule.
 */
function reset() {
	jobs.forEach((job) => {
		job.cancel();
	});

	scheduleJobs();
}

module.exports = {
	start: start,
	reset: reset,
	executeScheduledItem: executeScheduledItem
};

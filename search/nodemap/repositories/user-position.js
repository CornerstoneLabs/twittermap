var fs = require('fs');
var diagnostics = require('../diagnostics/index.js');

function loadJsonFile(filePath) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filePath, {encoding: 'utf-8'}, function read(err, buffer) {
			if (err) {
				resolve(null);
			} else {
				var data = buffer.toString();
				var parsedData = JSON.parse(data);
				resolve(parsedData);
			}
		});
	});
}

function all () {
	return new Promise(function (resolve, reject) {
		var filePath = '../public/data/tweets.spool';
		var deletedUsers;
		var parsedData;

		function isUserDeleted(item) {
			return deletedUsers.filter(function (checkItem) {
				return (checkItem === item.id);
			}).length > 0;
		}

		function processMerge() {
			parsedData = parsedData.filter(function (item) {
				return (isUserDeleted(item) === false);
			});

			resolve(parsedData);
		}

		function onLoadDeletedUsersDelegate(_deletedUsers) {
			deletedUsers = _deletedUsers;

			if (deletedUsers === null) {
				deletedUsers = [];
			}

			processMerge();
		}

		function loadDeletedUsers() {
			loadJsonFile('../public/data/deleted.spool')
				.then(onLoadDeletedUsersDelegate, reject);
		}

		function onUsersRead(err, buffer) {
			console.log('Read all users');
			if (err) {
				console.log(err);
				reject(err);
			} else {
				var data = buffer.toString();
				parsedData = JSON.parse('[' + data.substring(0, data.length - 1) + ']');

				loadDeletedUsers();
			}
		}

		fs
			.readFile(filePath, {
				encoding: 'utf-8'
			}, onUsersRead);
	});
}

module.exports = {
	all: all
};

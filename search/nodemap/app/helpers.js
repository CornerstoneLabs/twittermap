var Handlebars = require('handlebars');
var fs = require('fs');

function readFile (path) {
	return fs.readFileSync(path, 'utf8');
}

function jsonHelper(obj) {
	return JSON.stringify(obj);
}

function round(value, precision) {
	var multiplier = Math.pow(10, precision || 0);

	return Math.round(value * multiplier) / multiplier;
}

function decimalPlaceHelper(value) {
	return round(value, 1);
}

function addS(value) {
	if (value > 1) {
		return 's';
	}
	return '';
}

function socialLinkHelper(item) {
	var result = 'https://twitter.com/' + item.screen_name;

	if (item.provider && item.provider === 'facebook') {
		result = item.screen_name;
	}

	return result;
}

function stripesHelper(array, even, odd, fn, elseFn) {
	if (array && array.length > 0) {
		var buffer = "";
		for (var i = 0, j = array.length; i < j; i++) {
			var item = array[i];

			item.stripeClass = (i % 2 == 0 ? even : odd);

			buffer += fn.fn(item);
		}

		return buffer;
	}
	else {
		return elseFn.fn();
	}
}

function helpers (app) {
	Handlebars.registerHelper('dp', decimalPlaceHelper);
	Handlebars.registerHelper('json', jsonHelper);
	Handlebars.registerHelper('socialLink', socialLinkHelper);
	Handlebars.registerHelper('addS', addS);
	Handlebars.registerHelper("stripes", stripesHelper);
}

module.exports = helpers;

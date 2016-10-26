var express = require('express');

function static(app) {
	var options = {
		dotfiles: 'ignore',
		index: false,
		maxAge: '1d',
		redirect: false
	};

	// app.use(express.static('../public', options));
}

module.exports = static;

function couchdbDocumentSorter (a, b) {
	if (a.datetime <  b.datetime) {
		return -1;
	}

	if (a.datetime > b.datetime) {
		return 1;
	}

	return 0;
}

module.exports = couchdbDocumentSorter;

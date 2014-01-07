define(function() {
	return {
		readFixture: function(name, successCb, errorCb) {
			$.getJSON('/fixtures/' + name + '.json', successCb).fail(errorCb);
		},

		writeFixture: function(name, body, successCb, errorCb) {
			$.post('/fixtures/' + name + '.json', { data: JSON.stringify(body, null, '\t')}, successCb).fail(errorCb);
		},
	};
});

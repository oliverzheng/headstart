define(function() {
	return {
		readFixture: function(name, successCb, errorCb) {
			$.getJSON('/fixture/' + name + '.json', successCb).fail(errorCb);
		},

		writeFixture: function(name, body, successCb, errorCb) {
			$.post('/fixture/' + name + '.json', { data: JSON.stringify(body, null, '\t')}, successCb).fail(errorCb);
		},

		getFixtureNames: function(cb) {
			$.getJSON('/fixtures/', function(names) {
				cb(names.map(function(name) {
					return name.slice(0, -5); // remove ".json"
				}));
			});
		},
	};
});

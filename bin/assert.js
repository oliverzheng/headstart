define(function() {
	return function(condition) {
		if (!condition) {
			throw new Error('Assert failed');
		}
	};
});

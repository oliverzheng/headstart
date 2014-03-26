var express = require('express');
var fs = require('fs');
var path = require('path');

var FIXTURE_DIR = __dirname + '/fixtures';

var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res) {
	res.redirect('/bin'); 
});

app.get('/fixtures', function(req, res) {
	var filenames = fs.readdirSync(FIXTURE_DIR);
	res.send(filenames);
});

app.post('/fixture/:name', function(req, res) {
	var name = req.params['name'];
	var data = req.body.data;

	var filename = FIXTURE_DIR + '/' + name /* HOLY GOD SECURITY HOLE */;
	var overwriting = path.existsSync(filename);
	fs.writeFile(filename, data, function(err) {
		if (err) {
			res.send(500, { success: false, error: err });
		} else {
			res.send({ success: true, overwritten: overwriting });
		}
	});
});

app.use('/bin', express.static('bin'));
app.use('/lib', express.static('lib'));
app.use('/fixture', express.static('fixtures'));
app.use('/bower_components', express.static('bower_components'));

app.listen(3000);
console.log('Listening on port 3000.');
console.log('Go to http://localhost:3000/bin/');

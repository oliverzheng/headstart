var express = require('express');
var fs = require('fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

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

var building = false;
app.get('/build', function(req, res) {
	// watchman sends double commands sometimes..?
	if (!building) {
		building = true;
		sys.print('Building... ');
		exec('node_modules/.bin/jake build', function(err, stdout, stderr) {
			building = false;
			if (stdout || stderr) {
				console.log('');
				if (stdout) {
					sys.print(stdout);
				}
				if (stderr) {
					sys.print(stderr);
				}
			} else {
				console.log('Done');
			}
		});
	}
	res.send();
});

var server = app.listen(3000);
console.log('Listening on port 3000. Go to http://localhost:3000/bin/');

// Setup watchman build
exec('watchman', function(err, stdout, stderr) {
	if (!err) {
		console.log('Adding watchman build. (Removed on exit.)');
		exec('watchman -- trigger ' + __dirname + ' build \'*.ts\' -- curl http://localhost:3000/build');

		process.on('SIGINT', function() {
			server.close();
			// Because npm, our parent process, is already dead, we can't output anything here :(
			exec('watchman trigger-del ' + __dirname + ' build', function() {
				process.exit();
			});
		});
	}
});

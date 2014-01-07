var express = require('express');
var fs = require('fs');

var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res) {
	res.redirect('/bin'); 
});

app.post('/fixtures/:name', function(req, res) {
	var name = req.params['name'];
	var data = req.body.data;

	console.log(data);
	fs.writeFile(__dirname + '/fixtures/' + name /* HOLY GOD SECURITY HOLE */, data, function(err) {
		if (err) {
			res.send(500, { success: false, error: err });
		} else {
			res.send({ success: true });
		}
	});
});

app.use('/bin', express.static('bin'));
app.use('/lib', express.static('lib'));
app.use('/fixtures', express.static('fixtures'));

app.listen(3000);
console.log('Listening on port 3000');

var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.redirect('/bin'); 
});

app.use('/bin', express.static('bin'));
app.use('/lib', express.static('lib'));

app.listen(3000);
console.log('Listening on port 3000');

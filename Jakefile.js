var path = require('path');
var fs = require('fs');
var fsextra = require('fs.extra');
var jake = require('jake');

var SRC_DIR = 'src';
var TEST_DIR = 'test';
var LIB_DIR = 'lib';
var LIBSRC_DIR = path.join(LIB_DIR, SRC_DIR);
var LIBTEST_DIR = path.join(LIB_DIR, TEST_DIR);
var TSC = 'node_modules/.bin/tsc';
var TSD = 'node_modules/.bin/tsd';
var BOWER = 'node_modules/.bin/bower';
var RED_COLOR = '\033[31m';
var RESET_COLOR = '\033[0m';
var AMD = true;

function isFileTs(path) {
	return path.match(/.ts$/);
}

var package = require('./package.json');
if (package.dependencies) {
	var deps = Object.keys(package.dependencies);
} else {
	var deps = [];
}
deps.push('node');

function touch(path) {
	var now = parseInt(Date.now() / 1000, 10);
	fs.utimesSync(path, now, now);
}

desc('Node module dependencies');
file('node_modules', ['package.json'], {async: true}, function() {
	process.stdout.write('Npm installing... ');
	var cmd = 'npm install';
	var ex = jake.createExec(cmd);
	ex.addListener('error', function(msg) {
		console.log(RED_COLOR + 'Failed.' + RESET_COLOR);
		console.log(msg);
		fail('NPM install failed');
	});
	var target = this.fullName;
	ex.addListener('cmdEnd', function() {
		console.log('Done.');
		touch(target);
		complete();
	});
	ex.run();
})

directory('d.ts');

desc('Download TypeScript definitions');
file('d.ts/typings.d.ts', ['package.json', 'd.ts'], {async: true}, function() {
	process.stdout.write('Downloading TypeScript definitions... ');
	var cmd = TSD + ' install ' + deps.join(' ');
	var ex = jake.createExec(cmd);
	ex.addListener('error', function(msg) {
		console.log(RED_COLOR + 'Failed.' + RESET_COLOR);
		console.log(msg);
		fail('Download definitions failed');
	});
	var fullName = this.fullName;
	ex.addListener('cmdEnd', function() {
		try {
			var dts = jake.readdirR('d.ts').filter(function(filename) {
				return filename.match(/.d.ts$/) && filename != fullName;
			});
		} catch(e) {
			var dts = [];
		}
		fs.writeFile(fullName, dts.map(function(def) {
			return '/// <reference path="../' + def + '" />';
		}).join('\n'), function (err) {
			if (err) {
				console.log(err);
				fail('Definitions failed to write');
			} else {
				console.log('Done.');
				complete();
			}
		});
	});
	ex.run();
});

desc('Download Bower scripts');
file('bower_components', ['bower.json', 'node_modules'], {async: true}, function() {
	process.stdout.write('Downloading Bower scripts... ');
	var cmd = BOWER + ' install --config.interactive=false';
	var ex = jake.createExec(cmd);
	ex.addListener('error', function(msg) {
		console.log(RED_COLOR + 'Failed.' + RESET_COLOR);
		console.log(msg);
		fail('Bower install failed');
	});
	var fullName = this.fullName;
	ex.addListener('cmdEnd', function() {
		console.log('Done.');
		complete();
	});
	ex.run();
});

var srcTs = [];
var testTs = [];
try {
	srcTs = jake.readdirR(SRC_DIR).filter(isFileTs);
	testTs = jake.readdirR(TEST_DIR).filter(isFileTs);
} catch(e) {
}
var tsFiles = srcTs.concat(testTs);
var srcFiles = tsFiles.slice(0);
srcFiles.unshift('d.ts/typings.d.ts');

desc('Compile source files.');
file(LIB_DIR, srcFiles, {async: true}, function() {
	if (tsFiles.length === 0) {
		fail('No source files');
	}
	process.stdout.write('Compiling... ');
	var outDir = (testTs && testTs.length > 0) ? LIB_DIR : LIBSRC_DIR;
	var cmd = TSC + ' --noImplicitAny';
	if (AMD) {
		cmd += ' -m amd --outDir ' + outDir;
	} else {
		cmd += ' -m commonjs --outDir ' + outDir;
	}
	cmd += ' ' + tsFiles.join(' ');

	var ex = jake.createExec(cmd);
	ex.addListener('error', function(msg) {
		console.log(RED_COLOR + 'Failed.' + RESET_COLOR);
		console.log(msg);
		fail('Compilation failed');
	});
	ex.addListener('cmdEnd', function() {
		console.log('Done.');
		touch('lib');
		complete();
	});
	ex.run();
});


try {
	var testOtherFiles = jake.readdirR(TEST_DIR).filter(function(filename) {
		var stats = fs.lstatSync(filename);
		return !isFileTs(filename) && !stats.isDirectory();
	});
} catch(e) {
	var testOtherFiles = [];
}

function testFileToLib(input) {
	return input.replace(/^test/, LIBTEST_DIR);
}
var testLibFiles = testOtherFiles.map(testFileToLib);
function testLibToFile(input) {
	return input.replace(/^lib\/test/, TEST_DIR);
}

rule(/^lib\/test\/.*/, testLibToFile, {async: true}, function() {
	console.log('Copying ' + this.source + '.');

	jake.mkdirP(path.dirname(this.name));
	try {
		fs.unlinkSync(this.name);
	} catch (e) {}
	var name = this.name;
	fsextra.copy(this.source, this.name, function() {
		touch(name);
		complete();
	});
});

desc('Build project.');
var buildDeps = ['node_modules', 'bower_components', 'lib'];
buildDeps.push.apply(buildDeps, testLibFiles);
task('build', buildDeps);

deleteFolderRecursive = function(path) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

task('clean', function() {
	console.log('Removing compilation...');
	deleteFolderRecursive('lib');
});

task('superclean', ['clean'], function() {
	console.log('Removing TypeScript definitions...');
	deleteFolderRecursive('d.ts');
	console.log('Removing node modules...');
	deleteFolderRecursive('node_modules');
});

task('open', function() {
	var cmd = 'open http://localhost:3000';
	var browser = jake.createExec(cmd);
	browser.run();
});

task('serve', ['build'], function() {
	var cmd = 'node ' + __dirname + '/expressApp.js';
	var ex = jake.createExec(cmd);
	ex.addListener('error', function(msg) {
		console.log(RED_COLOR + 'Failed.' + RESET_COLOR);
		console.log(msg);
		fail('Express app failed to launch');
	});
	ex.addListener('stdout', function(msg) {
		process.stdout.write(msg);
	});

	ex.run();
});


task('default', ['build']);

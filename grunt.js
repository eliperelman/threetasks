module.exports = function(grunt) {
	var semver = require('semver'),
		configFile = require('./config.js'),
		//rmrf = require('rimraf'),
		cssMinify = require('clean-css').process,
		shell = require('shelljs');

	grunt.initConfig(configFile);

	var config = grunt.config,
		file = grunt.file,
		revisions = config.get('revisions'),
		regexes = config.get('regexes'),
		deployRoot = config.get('deployRoot'),
		jsRoot = config.get('jsRoot'),
		cssRoot = config.get('cssRoot'),
		touchFiles = [],
		startingVersion;

	grunt.registerTask('deploy', function (revision) {
		if (revisions.indexOf(revision) === -1) {
			grunt.fail.fatal("A deployment revision of major, minor, or patch was not specified.");
		}

		startingVersion = config.get('version');
		config.set('version', semver.inc(startingVersion, revision));
		grunt.log.ok("Generating deployment " + config.get('version'));

		grunt.task.run('main');
	});

	grunt.registerTask('build-dirs', function () {
		var dirs = config.get('deployDirs'),
			copyDirs = config.get('copyDirs'),
			currentDir, i, il, deployDir;

		for (i = 0, il = dirs.length; i < il; i++) {
			currentDir = dirs[i];
			deployDir = deployRoot + '/' + currentDir;

			file.mkdir(deployDir);

			if (copyDirs.indexOf(currentDir) !== -1) {
				file.recurse(currentDir, function (abspath, rootdir, subdir, filename) {
					file.copy(abspath, deployDir + '/' + filename);
				});
			}
		}

		grunt.log.ok("Deployment directories and files prepared successfully.")
	});

	grunt.registerTask('build-index', function () {
		var contents = file.read('index.html');

		contents = contents.replace(regexes.js, '<scr' + 'ipt src="/' + jsRoot + '/build.min.js?v={{version}}"></script>');
		contents = contents.replace(regexes.css, '<link rel="stylesheet" href="/' + cssRoot + '/build.min.css?v={{version}}" />');
		contents = contents.replace(regexes.version, config.get('version'));

		file.write(deployRoot + '/index.html', contents);

		grunt.log.ok('index.html file generated successfully.');
	});

	grunt.registerTask('min-css', function () {
		var cssConfig = config.get('cssMin'),
			cssFiles = cssConfig.dist.src,
			destination = cssConfig.dist.dest,
			content = [],
			i, il;

		for (i = 0, il = cssFiles.length; i < il; i++) {
			content.push(file.read(cssFiles[i]));
		}

		file.write(destination, cssMinify(content.join('')));

		grunt.log.ok('CSS files concatenated and minified successfully.');
	});

	grunt.registerTask('gzip-all', function () {
		var destinations = [
				config.get('min').dist.dest,
				config.get('cssMin').dist.dest
			],
			i, il, content;

		for (i = 0, il = destinations.length; i < il; i++) {
			content = file.read(destinations[i]);
			file.write(destinations[i] + '.gz', grunt.helper('gzip', content));
			touchFiles.push(destinations[i]);
			touchFiles.push(destinations[i] + '.gz');
		}

		grunt.log.ok('Files gzipped successfully.');
	});

	grunt.registerTask('finalize', function () {
		var content = file.read('config.js'),
			done = this.async();

		file.write('config.js', content.replace(startingVersion, config.get('version')));
		//grunt.log.ok('touching: ' + touchFiles.join(' '));
		//shell.exec('touch ' + touchFiles.join(' '));

		grunt.log.ok('Deployment generation successful!');
	});

	grunt.registerTask('main', 'lint build-dirs build-index min min-css finalize');
};
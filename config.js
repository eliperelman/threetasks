module.exports = (function () {
	var jsRoot = 'assets/js',
		cssRoot = 'assets/css',
		deployRoot = '../threetasks-deploy',
		i, il,

		jsFiles = [
			'build.js'
		],

		cssFiles = [
			'bootstrap.css',
			'bootstrap-responsive.css',
			'core.css'
		],

		config = {
			version: '0.2.2',
			jsRoot: jsRoot,
			cssRoot: cssRoot,
			deployRoot: deployRoot,
			revisions: ['major', 'minor', 'patch'],
			deployDirs: [
				'assets',
				'assets/css',
				'assets/img',
				'assets/js',
				'assets/fonts',
				'assets/templates'
			],
			copyDirs: [
				'assets/img',
				'assets/fonts',
				'assets/templates'
			],
			regexes: {
				version: /{{version}}/g,
				js: /\n?<!-- #js -->([\s\S]*?)<!-- \/js -->/ig,
				css: /\n?<!-- #css -->([\s\S]*?)<!-- \/css -->/ig,
			},
			lint: {
				files: [jsRoot + '/**/*.js']
			},
			cssMin: {
				dist: {
					src: [],
					dest: deployRoot + '/' + cssRoot + '/build.min.css'
				}
			},
			min: {
				dist: {
					src: [],
					dest: deployRoot + '/' + jsRoot + '/build.min.js',
					separator: ';'
				}
			}
		};

	for (i = 0, il = jsFiles.length; i < il; i++) {
		config.min.dist.src.push(jsRoot + '/' + jsFiles[i]);
	}

	for (i = 0, il = cssFiles.length; i < il; i++) {
		config.cssMin.dist.src.push(cssRoot + '/' + cssFiles[i]);
	}

	return config;
})();
const fs = require('fs');
const path = require('path');

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

function getFiles() {
	const files = {
		'<%= dist %>/release/<%= pkg.name %>.js': ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
		'<%= dist %>/release/<%= pkg.name %>.base.js': ['src/js/core/bootstrap.js', 'src/js/**/*.js', '.tmp/template.js']
	};
	const features = getDirectories('src/features/');

	features.forEach((feat) => {
		files[`<%= dist %>/release/<%= pkg.name %>.${feat}.js`] = [`src/features/${feat}/js/**/*.js`]
	});

	return files;
}

module.exports = {
	options: {
		banner: '<%= banner %>',
		stripBanners: true
	},
	dist: {
		files: getFiles()
	}
};

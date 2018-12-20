const fs = require('fs');
const path = require('path');

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const getLanguages = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile());

function getFiles() {
	const files = {
		'<%= dist %>/release/<%= pkg.name %>.js': ['packages/core/src/js/bootstrap.js', 'packages/**/src/js/**/*.js', '.tmp/template.js'],
		'<%= dist %>/release/<%= pkg.name %>.core.js': ['src/js/core/bootstrap.js', 'packages/core/src/js/**/*.js', '.tmp/template.js']
	};
	const packages = getDirectories('packages/');

	packages.forEach((feat) => {
		if (feat === 'i18n') {
			const languages = getLanguages('packages/i18n/src/js/');

			files['<%= dist %>/release/i18n/<%= pkg.name %>.language.all.js'] = languages.map((lang) => `packages/i18n/src/js/${lang}`);

			languages.forEach((lang) => {
				files[`<%= dist %>/release/i18n/<%= pkg.name %>.language.${lang}`] = [`packages/i18n/src/js/${lang}`];
			});
		} else if (feat !== 'core') {
			files[`<%= dist %>/release/<%= pkg.name %>.${feat}.js`] = [`packages/${feat}/src/js/**/*.js`];
		}
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

const fs = require('fs');
const path = require('path');

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const getLanguages = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile());

function getFiles() {
	const files = {
		'<%= dist %>/release/<%= pkg.name %>.js': ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
		'<%= dist %>/release/<%= pkg.name %>.core.js': ['src/js/core/bootstrap.js', 'src/js/core/**/*.js', 'src/js/i18n/ui-i18n.js',
			'src/js/i18n/en.js', '.tmp/template.js']
	};
	const features = getDirectories('src/features/');

	features.forEach((feat) => {
		files[`<%= dist %>/release/<%= pkg.name %>.${feat}.js`] = [`src/features/${feat}/js/**/*.js`];
	});

	const languages = getLanguages('src/js/i18n/')
		.filter((lang) => lang !== 'en.js' && lang !== 'ui-i18n.js');

	files['<%= dist %>/release/i18n/<%= pkg.name %>.language.all.js'] = languages.map((lang) => `src/js/i18n/${lang}`);

	languages.forEach((lang) => {
		files[`<%= dist %>/release/i18n/<%= pkg.name %>.language.${lang}`] = [`src/js/i18n/${lang}`];
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

const fs = require('fs');
const path = require('path');

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const getLanguages = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isFile());
const getTemplateDirectories = p => fs.readdirSync(p)
.filter(f => fs.statSync(path.join(p, f)).isDirectory() && fs.existsSync(path.join(p, f, 'src/templates')));
const templateDirectories = getTemplateDirectories('packages/');

function getFiles() {
	const files = {
		'<%= dist %>/release/<%= pkg.name %>.js': ['packages/core/src/js/bootstrap.js', 'packages/*/src/js/**/*.js', '.tmp/template.js'],
		'packages/core/js/<%= pkg.name %>.core.js': ['src/js/core/bootstrap.js', 'packages/core/src/js/**/*.js', '.tmp/template-core.js']
	};
	const packages = getDirectories('packages/');

	packages.forEach((feat) => {
		if (feat === 'i18n') {
			const languages = getLanguages('packages/i18n/src/js/');

			files['packages/i18n/js/<%= pkg.name %>.language.all.js'] = languages.map((lang) => `packages/i18n/src/js/${lang}`);

			languages.forEach((lang) => {
				files[`packages/i18n/js/<%= pkg.name %>.language.${lang}`] = [`packages/i18n/src/js/${lang}`];
			});
		} else if (feat !== 'core') {
			let src = [`packages/${feat}/src/js/**/*.js`];

			if (templateDirectories.includes(feat)) {
				src.push(`.tmp/template-${feat}.js`);
			}
			
			files[`packages/${feat}/js/<%= pkg.name %>.${feat}.js`] = src;
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

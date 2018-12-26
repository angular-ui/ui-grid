const fs = require('fs');
const path = require('path');

const getDirectories = p => fs.readdirSync(p)
.filter(f => fs.statSync(path.join(p, f)).isDirectory() && fs.existsSync(path.join(p, f, 'less')));

function filterCoreLessFiles(filepath) {
  return filepath === 'packages/core/less/main.less' || !filepath.includes('packages/core/less/');
}

function getFiles(compress) {
  const suffix = compress ? 'min.css' : 'css';
	const files = [
    {
      src: ['packages/core/less/main.less', 'packages/*/less/**/*.less', '.tmp/font/ui-grid-codes.css'],
      dest: `dist/release/<%= pkg.name %>.${suffix}`,
      filter: filterCoreLessFiles
    }
  ];
	const packages = getDirectories('packages/');

	packages.forEach((feat) => {
    files.push({
      src: `packages/${feat}/less/*.less`,
      dest: `packages/${feat}/<%= pkg.name %>.${feat}.${suffix}`,
      filter: filterCoreLessFiles
    });
  });

	return files;
}

module.exports = {
  dist: {
    options: {
      banner: '<%= banner %>'
    },
    files: getFiles()
  },
  min: {
    options: {
      banner: '<%= banner %>',
      compress: true
    },
    files: getFiles(true)
  }
};

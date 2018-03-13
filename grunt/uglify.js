const concat = require('./concat');

function getFiles() {
	const files = {};
	const sources = Object.keys(concat.dist.files);

	sources.forEach((srcFile) => {
		files[srcFile.replace('.js', '.min.js')] = srcFile;
	});

	return files;
}

module.exports = {
  options: {
    banner: '<%= banner %>'
  },
  concat: {
  	files: getFiles()
  }
};

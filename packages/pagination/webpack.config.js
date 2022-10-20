const common = require('../../lib/webpack/webpack.common.js');
const package = require('./package.json');

module.exports = common(__dirname, package.name, true);
const fs = require('fs');
const path = require('path');

const {bannerLoader, terser} = require('../../lib/webpack/webpack.utils.js');

const pkg = require('./package.json');

function getEntry() {
  const packageName = 'ui-grid.language';
  const localeFolder = './src/js/';
  const mainJs = './src/index.js';
  const entries = {
    [`${packageName}.all`]: mainJs,
    [`${packageName}.all.min`]: mainJs
  };

  fs.readdirSync(path.resolve(__dirname, localeFolder)).forEach(lang => {
    const locale = lang.replace('.js', '');

    entries[`${packageName}.${locale}`] = `${localeFolder}${lang}`;
    entries[`${packageName}.${locale}.min`] = `${localeFolder}${lang}`;
  });

  return entries;
}

module.exports = {
  mode: 'production',
  entry: getEntry(),
  output: {
    pathinfo: false,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  optimization: {
    minimize: true,
    minimizer: [
      terser
    ]
  },
  plugins: [
    bannerLoader
  ]
};
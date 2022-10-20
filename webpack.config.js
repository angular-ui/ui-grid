const path = require('path');

const {bannerLoader, terser} = require('./lib/webpack/webpack.utils.js');

const pkg = require('./package.json');
const include = path.resolve(__dirname, 'packages');
const pathname = path.resolve(__dirname, 'dist/release');

module.exports = {
  mode: 'production',
  entry: {
    [pkg.name]: pkg.main,
    [`${pkg.name}.min`]: pkg.main
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        include,
        loader: 'text-loader'
      }
    ]
  },
  output: {
    pathinfo: false,
    path: pathname,
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
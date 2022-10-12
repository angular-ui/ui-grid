const path = require('path');

const {bannerLoader, terser} = require('./lib/webpack/webpack.utils.js');

const pkg = require('./package.json');

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
        include: path.resolve(__dirname, 'packages'),
        loader: 'text-loader'
      }
    ]
  },
  output: {
    pathinfo: false,
    path: path.resolve(__dirname, 'dist/release'),
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
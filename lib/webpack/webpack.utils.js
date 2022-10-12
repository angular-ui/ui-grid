const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const util = require('../grunt/utils');
const pkg = require('../../package.json');

const today = new Date();
const banner = `${ pkg.title || pkg.name } - v${ util.getVersion() } - ${ today.toISOString().slice(0, 10) }
  ${ pkg.homepage ? pkg.homepage : '' }
  Copyright (c) ${ today.getFullYear() } ${ pkg.author }; License: ${ pkg.license }`;

module.exports = {
  banner,
  bannerLoader: new webpack.BannerPlugin({banner}),
  terser: new TerserPlugin({
    test: /\.min.js(\?.*)?$/i
  })
};
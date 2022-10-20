const _ = require('lodash');
const path = require('path');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const {bannerLoader, terser} = require('./webpack.utils');

module.exports = (dir, name, hasCss = false) => {
  const packageName = name.replace('@ui-grid/', '')
  const mainJs = './src/index.js';
  const entry = hasCss ? [mainJs, `./less/${_.camelCase(packageName)}.less`] : [mainJs];
  const htmlLoader = {
    test: /\.html$/i,
    include: path.resolve(dir, 'src'),
    loader: 'text-loader',
  };
  const rules = hasCss ? [
    {
      test: /\.less$/,
      include: path.resolve(dir, 'less'),
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
      ]
    },
    htmlLoader
  ] : [htmlLoader];
  const minimizer = hasCss ? [
    new CssMinimizerPlugin({
      test: /\.min.css(\?.*)?$/i
    }),
    terser
  ] : [terser];
  const plugins = hasCss ? [
    new MiniCssExtractPlugin(),
    bannerLoader
  ] : [bannerLoader];

  return {
    mode: 'production',
    entry: {
      [`ui-grid.${packageName}`]: entry,
      [`ui-grid.${packageName}.min`]: entry
    },
    module: {rules},
    output: {
      pathinfo: false,
      path: path.resolve(dir, 'dist'),
      filename: '[name].js'
    },
    optimization: {
      minimize: true,
      minimizer
    },
    plugins
  };
};
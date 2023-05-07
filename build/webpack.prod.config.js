const { merge } = require('webpack-merge');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.config');

const webpackConfig = {
  mode: 'production',
  devtool: 'nosources-source-map',
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()]
  }
};

module.exports = merge(common.webpackConfig, webpackConfig);

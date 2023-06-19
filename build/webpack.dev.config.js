const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

const webpackConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    historyApiFallback: true,
    compress: false,
    server: 'spdy'
  }
};

module.exports = merge(common.webpackConfig, webpackConfig);

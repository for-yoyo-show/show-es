const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

const webpackConfig = {
  mode: 'development',
  devtool: 'eval',
  devServer: {
    static: common.distPath,
    historyApiFallback: true,
    compress: false,
    server: 'spdy'
  }
};

module.exports = merge(common.webpackConfig, webpackConfig);

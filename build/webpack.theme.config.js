const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webpackConfig = {
  entry: {
    dark: './src/theme/dark/index.scss',
    light: './src/theme/light/index.scss'
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].[fullhash].css', chunkFilename: '[name].[id].[chunkhash].css' })
  ]
};

module.exports = webpackConfig;

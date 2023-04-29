const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const targetDir = 'dist';
const staticDir = 'public';
const distPath = path.resolve(__dirname, '../', targetDir);

const themesEntry = {
  dark: './src/theme/dark/index.scss',
  light: './src/theme/light/index.scss'
};

module.exports = {
  mode: devMode ? 'development' : 'production',
  devtool: devMode ? 'eval' : 'source-map',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  entry: {
    app: {
      import: './src/index.tsx',
      dependOn: ['antd', 'reactvendors', 'three']
    },
    antd: {
      import: 'antd',
      dependOn: 'reactvendors'
    },
    reactvendors: {
      import: ['react', 'react-dom', 'redux', '@reduxjs/toolkit', 'react-router-dom'],
      runtime: 'runtime'
    },
    three: 'three',
    ...themesEntry
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        fooStyles: {
          type: 'css/mini-extract',
          name: 'styles_foo',
          chunks: chunk => {
            return chunk.name === 'foo';
          },
          enforce: true
        },
        barStyles: {
          type: 'css/mini-extract',
          name: 'styles_bar',
          chunks: chunk => {
            return chunk.name === 'bar';
          },
          enforce: true
        }
      }
    },
    minimize: !devMode,
    minimizer: [...(devMode ? [] : [new CssMinimizerPlugin(), new TerserPlugin()])]
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          // 确定使用的loader
          loader: 'babel-loader',
          // 参数配置
          options: {
            presets: [
              [
                // 预设polyfill
                '@babel/preset-env',
                {
                  // polyfill 只加载使用的部分
                  useBuiltIns: 'usage',
                  // 使用corejs解析，模块化
                  corejs: '3'
                }
              ],
              // 解析react
              '@babel/preset-react'
            ],
            // 使用transform-runtime，避免全局污染，注入helper
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|jpeg)$/,
        loader: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader'
      }
    ]
  },
  resolve: { extensions: ['.*', '.js', '.jsx', '.ts', '.tsx'] },
  output: {
    path: distPath,
    filename: '[name].bundle.js'
  },
  target: ['web', 'es2020'],
  devServer: {
    static: distPath,
    historyApiFallback: true,
    compress: false,
    server: 'spdy'
  },
  plugins: [
    new ESLintPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].[fullhash].css', chunkFilename: '[id].[contenthash].css' }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html'),
      chunks: ['app', 'antd', 'reactvendors', 'three']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../', staticDir),
          to: path.resolve(__dirname, '../', targetDir, staticDir)
        }
      ]
    }),
    new CleanWebpackPlugin()
  ]
};

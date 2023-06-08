const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const themeWebpackConfig = require('./webpack.theme.config');

const targetDir = 'dist';
const staticDir = 'public';
const distPath = path.resolve(__dirname, '../', targetDir);

const srcPath = /src/;
const modulesPath = /(node_modules|bower_components)/;

const webpackConfig = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.*'],
    mainFiles: ['index'],
    mainFields: ['browser', 'module', 'main']
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
    three: 'three'
  },
  module: {
    noParse: /^jquery|^lodash|^three/,
    rules: [
      {
        test: /\.(vert|frag)$/i,
        use: 'raw-loader',
        include: srcPath,
        exclude: modulesPath
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: modulesPath,
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
        },
        parser: {
          amd: false, // 禁用 AMD
          commonjs: false, // 禁用 CommonJS
          system: false, // 禁用 SystemJS
          // harmony: false, // 禁用 ES2015 Harmony import/export
          requireInclude: false, // 禁用 require.include
          requireEnsure: false, // 禁用 require.ensure
          requireContext: true, // 禁用 require.context
          browserify: false, // 禁用特殊处理的 browserify bundle
          requireJs: false, // 禁用 requirejs.*
          node: false, // 禁用 __dirname, __filename, module, require.extensions, require.main, 等。
          commonjsMagicComments: false, // 禁用对 CommonJS 的  magic comments 支持
          node: {}, // 在模块级别(module level)上重新配置 node 层(layer)
          worker: ['default from web-worker', '...']
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader',
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
  output: {
    path: distPath,
    filename: '[name].[chunkhash].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.js'
  },
  target: ['web', 'es2020'],
  plugins: [
    new ESLintPlugin(),
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
  ],
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
    }
  }
};

module.exports = { webpackConfig: merge(themeWebpackConfig, webpackConfig), targetDir, staticDir, distPath };

const webpack = require('webpack')
const path = require('path')
const webpackConfigBase = require('./webpack.config.base');
const {merge} = require("webpack-merge");




const webpackConfig = {
  mode: 'production',
  devtool: 'source-map'
}

module.exports = merge(webpackConfigBase, webpackConfig)
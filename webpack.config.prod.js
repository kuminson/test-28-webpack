const webpackConfigBase = require('./webpack.config.base')
const { merge } = require('webpack-merge')

const webpackConfig = {
  mode: 'production',
  devtool: 'cheap-module-source-map'
}

module.exports = merge(webpackConfigBase, webpackConfig)

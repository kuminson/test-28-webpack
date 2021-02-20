const webpackConfigBase = require('./webpack.config.base')
const MockWebpackPlugin = require('mock-webpack-plugin')
const { merge } = require('webpack-merge')

const webpackConfig = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    // new MockWebpackPlugin({
    //   config: {
    //     '/api/json/data': {
    //       data: {
    //         'data': {
    //           'test|2-10': 't',
    //           'other|1-100.1-3': 1
    //         },
    //         'msg': '',
    //         'code': 20006
    //       }
    //     }
    //   },
    //   port: 8088
    // })
  ],
  devServer: {
    // proxy: {
    //   '/api': 'http://0.0.0.0:8088'
    // }
  }
}
module.exports = merge(webpackConfigBase, webpackConfig)

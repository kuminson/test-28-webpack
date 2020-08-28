const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const { getI18nextPatterns } = require('./i18nextUtils')

const i18nPatterns = getI18nextPatterns(
  path.resolve(__dirname, './src/locales/'),
  path.resolve(__dirname, './dist/locales/')
)

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/pages/home/index.js')
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].[hash:7].js'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: '/',
    historyApiFallback: false,
    inline: false,
    hot: true,
    host: '0.0.0.0',
    port: '4201'
  },
  plugins: [
    //设置每一次build之前先删除dist
    new CleanWebpackPlugin(),
    new MomentLocalesPlugin({
      localesToKeep: ['ja', 'zh-cn', 'zh-tw'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/pages/home/index.html')
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // 不启动展示打包报告的http服务器
      generateStatsFile: true, // 是否生成stats.json文件
    }),
    new CopyPlugin({
      patterns: [
        ...i18nPatterns
      ]
    })
  ]
}
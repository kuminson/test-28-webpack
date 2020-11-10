const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const { getI18nextPatterns, getHtmlPlugin } = require('./webpackUtils')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const testEjs = {
  name: 'allalalala'
}


const i18nPatterns = getI18nextPatterns(
  path.resolve(__dirname, './src/locales/'),
  path.resolve(__dirname, './dist/locales/')
)

const res = getHtmlPlugin(
  path.resolve(__dirname, './src/pages'),
  path.resolve(__dirname, './src/assets/images/favicon.ico')
)



module.exports = {
  mode: 'production',
  entry: {
    ...res.entry,
    modernizr: path.resolve(__dirname, './src/assets/js/modernizr-webp.js')
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].[chunkhash:7].js'
  },
  resolve: {
    alias: {
      // 别名 让import/require 引入更方便
      // 在css/html里可以在地址前加上`~` 会被视作依赖模块而去解析 也就可以使用别名了
      '@': path.resolve(__dirname, 'src/'),
      'images': path.resolve(__dirname, 'src/assets/images/')
    }
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
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})  // 最小化css
    ],
    splitChunks: {
      minSize: 3,
      cacheGroups: {
        // 抽离公用代码
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
          priority: 3,
        },
        // 把所有第三方库抽成vendors
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          minChunks: 2,
          priority: 5,
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          'postcss-loader',
        ]
      }, {
        test: /\.s[ca]ss$/,
        use: [
          MiniCssExtractPlugin.loader, // 用来把css提成单独的css文件
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2, // css-loader作用@import的资源之前有多少loader
            }
          },
          'postcss-loader', // postcss-loader要在style-loader/css-loader之后 其它(sass/less)loader之前
          'sass-loader'
        ]
      }, {
        test: /\.(png|svg|jpe?g|gif|webp)$/,
        use: [
          {
            // 用来处理 引入的文件 内部调用file-loader 所以配置相同 只多一个生成base64功能
            loader: 'url-loader',
            options: {
              name: '[name].[hash:7].[ext]',
              outputPath: 'images/',
              // esModule: false,   // html-webpack-plugin 防止ejs语法解析地址变成[object Module]
              // publicPath: 'https://some-cdn/', // 请求的地址前缀 可以用来设置cdn地址
              limit: 4096 // 设置过大会增加css体积 增加css渲染时间 导致白屏时间增长
            }
          }
        ]
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash:7].[ext]',
              outputPath: 'media/',
              limit: 4096
            }
          }
        ]
      }, {
        test: /\.(woff2?|eot|ttf|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash:7].[ext]',
              outputPath: 'fonts/',
              limit: 4096
            }
          }
        ]
      }, {
        test: /\.html$/,
        use: [
          'html-loader'
        ]
      }, {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    //设置每一次build之前先删除dist
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[chunkhash:7].css',
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({                   // 配置的全局常量 (指定为生产环境，进而让一些library可以做一些优化)
      'process.env.env_config': JSON.stringify(process.env.env_config)
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['ja', 'zh-cn', 'zh-tw'], // 查询语种列表 https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // 不启动展示打包报告的http服务器
      generateStatsFile: true, // 是否生成stats.json文件
    }),
    new CopyPlugin({
      patterns: [
        ...i18nPatterns
      ]
    }),
    ...res.htmlPlugin
  ]
}
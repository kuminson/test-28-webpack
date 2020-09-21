const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const version = require('./package.json').version


/**
 * 解析国际化文件夹json文件，生成copy-webpack-plugin用的patterns数组
 * @param {string} from - 国际化文件夹地址
 * @param {string} [to=path.resolve(__dirname, './dist/locales/')] - 生成的json文件要放置的打包地址
 * @return {array} i18nPatterns - copy-webpack-plugin用的patterns数组
 */
module.exports.getI18nextPatterns = (from, to) => {
  if (to === undefined) {
    to = path.resolve(__dirname, './dist/locales/')
  }

  const dirFiles = fs.readdirSync(from)

  const i18nName = dirFiles.filter(item => {
    if (item.search(/\.json$/) !== -1) {
      return true
    }
    return false
  })

  const i18nFiles = {}

  const i18nPatterns = []

  i18nName.forEach((item) => {
    const file = fs.readFileSync(path.resolve(from, item))
    i18nFiles[item.replace(/\.json/, '')] = JSON.parse(file.toString())
  })

  for (let key in i18nFiles) {
    const item = i18nFiles[key]
    const ns = Object.keys(item)
    ns.forEach(child => {
      const pattern = {
        from: path.resolve(from, key + '.json'),
        to: path.resolve(to, key, child + '.json'),
        transform(content) {
          const lng = JSON.parse(content.toString())
          return JSON.stringify(lng[child])
        }
      }
      i18nPatterns.push(pattern)
    })
  }

  return i18nPatterns
}

/**
 * 生成input用对象和html-webpack-plugin数组
 * @param {string} pages - page文件夹地址
 * @param {string} favicon - favicon.ico地址
 * @return {{htmlPlugin: Array, entry: {}}}
 * htmlPlugin - html-webpack-plugin插件数组
 * entry - input用的对象
 */
module.exports.getHtmlPlugin = (pages, favicon) => {
  const htmlPlugin = []

  const dirFiles = fs.readdirSync(pages)

  const entry = {}

  dirFiles.forEach(item => {
    entry[item] = path.resolve(pages, item, 'index.js')
    const plugin = new HtmlWebpackPlugin({
      template: path.resolve(pages, item, 'index.html'),
      filename: item + '.html',
      favicon: favicon,
      meta: {
        version: version,
        'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
        'X-UA-Compatible': {'http-equiv': 'X-UA-Compatible', 'content': 'ie=edge'},
        'Cache-Control': {'http-equiv': 'Cache-Control', 'content': 'no-cache, no-store, must-revalidate'},
        'Pragma': {'http-equiv': 'Pragma', 'content': 'no-cache'},
        'Expires': {'http-equiv': 'Expires', 'content': '0'}
      },
      chunks: [item, 'modernizr'],
      minify: true
    })
    htmlPlugin.push(plugin)
  })

  return {htmlPlugin, entry}
}


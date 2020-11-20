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


// 带'target="_blank"'的a标签增加rel="noopener noreferrer"
module.exports.htmlWebpackAttributesPlugin = class htmlWebpackAttributesPlugin{
  apply (compiler) {
    compiler.hooks.compilation.tap('htmlWebpackAttributesPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'htmlWebpackAttributesPlugin',
        (data, cb) => {
          // 获取所有a标签
          const aTagList = data.html.match(/<a .+?>/g, )
          if (aTagList === null) {
            cb(null, data)
            return
          }
          // 过滤有'target="_blank"'的a标签
          const aTagBlankList = aTagList.filter((item) => {
            if (item.indexOf('target="_blank"') !== -1) {
              return true
            }
            return false
          })
          // 去重
          const aTagBlankSingleList = []
          for (let item of aTagBlankList) {
            if (aTagBlankSingleList.indexOf(item) === -1) {
              aTagBlankSingleList.push(item)
            }
          }
          // 生成对应修改后的内容
          const changeList = aTagBlankSingleList.map((item) => {
            let newItem = ''
            // 如果有rel 清除里面的noopener noreferrer
            if (item.indexOf('rel') !== -1) {
              const relContent = item.replace(/^.*?rel="(.*?)".*$/g, '$1')
              const relConList = relContent.split(' ')
              // 去除多除空格
              const relConSingleList = relConList.filter((item) => {
                if (item === ' ' || item === '') {
                  return false
                }
                return true
              })
              // 增加 noopener noreferrer
              if (relConSingleList.indexOf('noopener') === -1) {
                relConSingleList.push('noopener')
              }
              if (relConSingleList.indexOf('noreferrer') === -1) {
                relConSingleList.push('noreferrer')
              }
              // 增加 noopener noreferrer
              newItem = item.replace(/(rel=").*?(")/, `$1${relConSingleList.join(' ')}$2`)

            } else {
              // 没有rel  增加 rel = 'noopener noreferrer'
              newItem = item.replace(/>$/, ' rel="noopener noreferrer">')
            }
            return newItem
          })
          // 替换html内容
          for (let i = 0; i < aTagBlankSingleList.length; i++) {
            const rePara = aTagBlankSingleList[i].replace(/[\\]/g, "\\$&")
            const regExp = new RegExp(rePara, 'g')
            data.html = data.html.replace(regExp, changeList[i])
          }
          cb(null, data)
        }
      )
    })
  }
}
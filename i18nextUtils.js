const path = require('path')
const fs = require('fs')

module.exports = {
  /**
   * 解析国际化文件夹json文件，生成copy-webpack-plugin用的patterns数组
   * @param {string} from - 国际化文件夹地址
   * @param {string} [to=path.resolve(__dirname, './dist/locales/')] - 生成的json文件要放置的打包地址
   */
  getI18nextPatterns (from, to) {
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
}

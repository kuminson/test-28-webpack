import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import moment from 'moment'


const i18nData = {
  myName: 'superman',
  myLabel: '<img />',
  dateName: new Date()
}


i18next.on('languageChanged', lng => {
  const lngChange = {
    'cn_ZH': 'zh-cn',
    'zh_Hant': 'zh-tw',
    'ja': 'ja',
    'en': 'en'
  }
  moment.locale(lngChange[lng])
})


i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    lng: 'cn_ZH',
    ns: ['home', 'common'],
    defaultNS: 'home',
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      format: function (value, format) {
        if(value instanceof Date) return moment(value).format(format);
        return value;
      }
    }
  })
  .then((t) => {
    i18nextHtml(i18nData, t)
  })


/**
 * 根据data-i18n，给html加上国际化
 * @param {Object} i18nData - 国际化用的变量
 * @param {Function} t - 获取国际化方法
 */
function i18nextHtml (i18nData, t) {
  // 获取全部i18next的html
  const els = document.querySelectorAll('[data-i18n]')
  for (let i = 0; i < els.length; i++) {
    // 拆分获取全部配置
    const config = els[i].dataset.i18n.split(';')
    for (let j = 0; j < config.length; j++) {
      // 获取国际化位置
      const position = config[j].replace(/^\[.+]/, '').replace(/{{.+}}$/, '')
      // 获取属性名
      let attr = config[j].match(/^\[(.+)]/)
      if (attr !== null) {
        attr = attr[1]
      }
      // 获取设置
      let option = {}
      let set = config[j].match(/{{(.+)}}$/)
      if (set !== null) {
        set = set[1].replace(' ', '')
        let setList = set.split(',')
        setList.forEach((item) => {
          const itemList = item.split(':')
          // 如果是i18nData对象变量
          if (itemList[1].search(/^'.+'$/) !== -1) {
            option[itemList[0]] = itemList[1].replace(/^'|'$/g, '')
          } else { // 如果是字符串
            option[itemList[0]] = i18nData[itemList[1]]
          }
        })
      } else {
        option = null
      }
      // 开始国际化赋值
      if (attr !== null && attr === 'html') {
        els[i].innerHTML = t(position, option)
        continue
      }
      if (attr !== null) {
        els[i].setAttribute(attr, t(position, option))
        continue
      }
      els[i].innerText = t(position, option)
    }
  }
}

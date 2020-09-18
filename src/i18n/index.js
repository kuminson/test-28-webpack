import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import moment from 'moment'



i18next.on('languageChanged', lng => {
  const lngChange = {
    'cn_ZH': 'zh-cn',
    'zh_Hant': 'zh-tw',
    'ja': 'ja',
    'en': 'en'
  }
  moment.locale(lngChange[lng])
})

i18next.use(Backend)

export const i18nextConfig = {
  fallbackLng: 'en',
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
}

export default i18next
import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import dayjs from 'dayjs'
import dayLngMap from './dayLngMap'

// 增加本地时间扩展
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)


i18next.on('languageChanged', lng => {
  dayjs.locale(dayLngMap[lng])
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
      if(value instanceof Date) return dayjs(value).format(format);
      return value;
    }
  }
}

export default i18next
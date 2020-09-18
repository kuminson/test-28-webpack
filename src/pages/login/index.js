import './index.scss'

import i18next, {i18nextConfig} from '@/i18n/index'
import {i18nextHtml} from '@/i18n/i18nextUtils'
import Api from '@/http/api'
import {CancelHttp} from '@/http/utils'


const i18nData = {
  myName: 'superman',
  dateName: new Date()
}

const cancel = new CancelHttp()


i18next
  .init({
    ...i18nextConfig,
    lng: 'en',
    ns: ['home', 'common', 'error'],
    defaultNS: 'home',
  })
  .then((t) => {
    i18nextHtml(i18nData, t)
    const baidu = Api.testBaidu({
      para: 123
    })
    baidu.then((data) => {
      console.log('data >>>', data)
    }).catch((err) => {
      console.log('test >>>>', err)
    })
    // cancel.remove(baidu.mySourceKey)
    // cancel.fire(baidu.mySourceKey)
    // cancel.fireApi('testBaidu')
  })



setTimeout(() => {
  console.log('key是否存在 2秒后', i18next.exists('title'))
  console.log('测试异步获取i18n', i18next.t('title'))
}, 2000)
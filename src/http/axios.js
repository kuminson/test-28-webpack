import axios from 'axios'
import url from './url'
import {ErrCodeHandle} from './utils'
// import errCodeList from './error'
import i18next from '../i18n/index'

// 通用配置
const instance = axios.create({
  // 服务器根结点
  baseURL: url.request,
  withCredentials: true,
  timeout: 1500
})

// 设置超时重设次数 和 重试时间
instance.defaults.retry = 3
instance.defaults.retryDelay = 1000

// 弹出错误码处理 联动i18next
function errMsgAlert (code) {
  let resMsg = ''
  if (i18next.exists('error:' + code)) {
    resMsg = i18next.t('error:' + code)
  }
  // TODO 把console替换成 错误弹出方法
  console.log(code, '>>>>>', resMsg)
  /*if (errCodeList[code] !== -1) {
    console.log(code, '>>>>>', errCodeList[code])
  }*/
}

// 通用报错处理
const ech = new ErrCodeHandle(errMsgAlert)

// 拦截返回内容
instance.interceptors.response.use((response) => {
  if (response.data.code === 200) {
    return Promise.resolve(response.data.data)
  } else {
    ech.go(response.data.code)
    return Promise.reject(response)
  }
}, (err) => {
  // 有状态码的错误 非2xx的状态码
  if (err.response) {
    console.log('axios >>> 有状态码的错误\n', err.response.status, '\n', err.response.data, '\n', err.response.headers)
    ech.go('serverError')
  } else if (err.request) { // 无响应的错误
    // 如果是超时 重试几次
    if (err.code === 'ECONNABORTED' || err.message.indexOf('timeout') !== -1) {
      const config = err.config
      if (!config || !config.retry) {
        console.log('axios >>> 超时且没有设置重试次数的错误\n', err.request)
        return Promise.reject(err)
      }
      config.__retryCount = config.__retryCount || 0
      if (config.__retryCount >= config.retry) {
        console.log('axios >>> 超时的错误\n', err.request)
        ech.go('timeout')
        return Promise.reject(err)
      }
      config.__retryCount += 1
      const backoff = new Promise(function (resolve) {
        setTimeout(function () {
          resolve()
        }, config.retryDelay || 1)
      })
      return backoff.then(function () {
        return instance(config)
      })
    }
    console.log('axios >>> 无响应的错误\n', err.request)
    ech.go('noResponse')
  } else {  // 请求代码报错
    if (err.message === 'Manually cancel the request') {
      console.log('axios >>> 手动取消请求')
    } else {
      console.log('axios >>> 请求代码报错\n', err.message)
    }
  }
  return Promise.reject(err)
})

const action = {
  commonPost: (url, data, config) => {
    let CancelToken = axios.CancelToken;
    let source = CancelToken.source();
    const http = instance.post(url, data, {
        cancelToken: source.token,
        ...config
      })
    http.mySource = source
    return http
  },
  commonGet: (url, data, config) => {
    let CancelToken = axios.CancelToken;
    let source = CancelToken.source();
    const http = instance.get(url, {
      params: data,
      cancelToken: source.token,
      ...config
    })
    http.mySource = source
    return http
  }
}

export default action

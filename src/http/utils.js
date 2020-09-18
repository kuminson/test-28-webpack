export class ErrCodeHandle {
  /**
   * 错误码统一处理 实例化
   * @param {function} commonFun - 通用处理方法
   */
  constructor (commonFun) {
    // 通用处理方法
    this.commonFun = commonFun
    // 例外错误码
    this.exceptCode = []
    // 特殊处理错误码
    this.specialCode = {}
  }
  /**
   * 例外不处理错误码
   * @param {array} codeList - 例外不处理错误码列表
   */
  except (codeList) {
    codeList.forEach((item) => {
      this.exceptCode.push(String(item))
    })
  }
  /**
   * 增加特殊处理错误码
   * @param {string} code - 特殊处理错误码
   * @param {function} func - 特殊处理方法
   */
  on (code, func) {
    const useCode = String(code)
    if (typeof func !== 'function') {
      return
    }
    this.specialCode[useCode] = func
  }

  /**
   * 处理错误码
   * @param {string} code - 错误码
   */
  go (code) {
    const useCode = String(code)
    // 错误码是例外  不处理
    if (this.exceptCode.indexOf(useCode) !== -1) {
      return
    }
    // 如果是特殊错误码  特殊处理
    if (this.specialCode[useCode] !== undefined) {
      this.specialCode[useCode](useCode)
      return
    }
    // 通用处理
    this.commonFun(useCode)
  }
}

/**
 * 请求取消管理
 */
export class CancelHttp {
  constructor () {
    // 单例模式
    if (CancelHttp.instance) {
      return CancelHttp.instance
    }

    // 取消请求方法集合
    this.sources = {}
    // 用做id的计数器
    this.counter = 0
    // api所包含的取消请求key集合
    this.apis = {}

    // 保存单例
    CancelHttp.instance = this
  }

  /**
   * 增加需要管理的取消请求函数
   * @param {string} api - 请求api的名字
   * @param {object} source - 取消请求的CancelToken对象
   * @return {string} key - 取消请求的唯一标识key
   */
  add (api, source) {
    // 生成key
    const key = String(this.counter)
    this.counter += 1
    // 缓存取消方法
    this.sources[key] = source
    if (this.apis[api] === undefined) {
      this.apis[api] = []
    }
    this.apis[api].push(key)
    // 返回key
    return key
  }

  /**
   * 取消一个请求
   * @param {string} key - 取消请求的唯一标识key
   */
  fire (key) {
    if (this.sources[key] === undefined) {
      return
    }
    this.sources[key].cancel('Manually cancel the request')
    delete this.sources[key]
  }

  /**
   * 取消一个api下的所有请求
   * @param {string} api - 请求api的名字
   */
  fireApi (api) {
    if (this.apis[api] === undefined) {
      return
    }
    this.apis[api].forEach(key => {
      this.fire(key)
    })
    this.apis[api] = []
  }

  /**
   * 取消所有的请求
   */
  fireAll () {
    for (let key in this.sources) {
      this.sources[key].cancel('手动取消请求')
    }
    this.sources = {}
    this.apis = {}
  }

  /**
   * 移除取消请求对象
   * @param {string} key - 取消请求的唯一标识key
   */
  remove (key) {
    if (this.sources[key] === undefined) {
      return
    }
    delete this.sources[key]
  }
}
/**
 * 获取表单内容值
 * @param {string} formSelector - form表单标签的css选择器
 * @param {function} [transform] - 对获取的值进行转换
 * transform  param {string} val - 获取的值
 *            param {string} name - 值对应的名字
 *            param {string} type - 值的类型 'input'，'select'，'other'三个中的一个
 *            return {any} val - 返回转换后的值
 * @return {{}} 表单的值对象
 */
export function getInputValue (formSelector, transform) {
  const formEl = document.querySelector(formSelector)

  const itemEls = formEl.querySelectorAll('[data-validate]')

  // 获取表单对象
  const formObj = {}

  const textType = ['text', 'password', 'number', 'email', 'url', 'textarea']
  const checkType = ['checkbox', 'radio']

  for (let item of itemEls) {
    // 如果是输入框
    if (item.type && textType.indexOf(item.type) !== -1) {
      let val = item.value
      if (typeof transform === 'function') {
        const res = transform(val, item.dataset.validate, 'input')
        val = res === undefined ? val : res
      }
      formObj[item.dataset.validate] = val
      continue
    }
    // 如果是选择
    if (item.type && checkType.indexOf(item.type) !== -1) {
      let val = item.value
      if (typeof transform === 'function') {
        const res = transform(val, item.dataset.validate, 'select')
        val = res === undefined ? val : res
      }
      if (formObj[item.dataset.validate] === undefined) {
        formObj[item.dataset.validate] = []
      }
      if (item.checked) {
        formObj[item.dataset.validate].push(val)
      }
      continue
    }
    // 如果是特殊类型
    if (item.dataset.validateValue !== undefined) {
      let val = item.dataset.validateValue
      if (typeof transform === 'function') {
        const res = transform(val, item.dataset.validate, 'other')
        val = res === undefined ? val : res
      }
      formObj[item.dataset.validate] = val
    }

  }

  return formObj
}

/**
 * 输入框内容过滤
 * @param {string} formSelector - form表单css选择器
 * @param {object} config - 每个输入框标签对应的过滤方法
 * config = {key: [func1, func2]}
 *        {string} key - 标签data-validate的值
 *        {function} func1(val) - 内容过滤方法
 *                {string} val - 输入框内容
 */
export function inputfilter (formSelector, config) {

  const formEl = document.querySelector(formSelector)

  const itemEls = formEl.querySelectorAll('[data-validate]')

  const textType = ['text', 'password', 'number', 'email', 'url', 'textarea']

  const elementType = ['INPUT', 'TEXTAREA']

  const inputEls = {}

  for (let item of itemEls) {
    if (elementType.indexOf(item.nodeName) === -1) {
      continue
    }
    if (!item.type || textType.indexOf(item.type) === -1) {
      continue
    }
    inputEls[item.dataset.validate] = item
  }

  for (let key in config) {
    inputEls[key].addEventListener('input', (e) => {
      let val = e.target.value
      for (let item of config[key]) {
        val = item(val)
      }
      e.target.value = val
    }, false)
  }
}


/**
 * 输入框内容过滤方法生成集合
 * @type {{onlyNumber(*): *, noZeroBefore(): *, max(*=): *, min(*=): *}}
 */
export const inputFilterFunc = {
  /**
   * 生成只有数字过滤器方法
   * @param {number} n - 保留几位小数 -1为无限个小数 0为没有小数
   * @return {function(*)} - 返回过滤器
   */
  onlyNumber (n) {
    let re
    if (n === 0) {
      re = new RegExp(/^\d+/)
    } else if (n === -1) {
      re = new RegExp('^\\d+\\.?(?:\\d)*')
    } else {
      re = new RegExp('^\\d+\\.?(?:\\d{0,' + n + '})?')
    }
    return (val) => {
      const newVal = val.match(re)
      let res = ''
      if (newVal !== null) {
        res = newVal[0]
      }
      return res
    }
  },
  /**
   * 生成 数字前没有0 的过滤器方法
   * @return {function(*)}
   */
  noZeroBefore () {
    return (val) => {
      return val.replace(/^0+([1-9][0-9]*(?:\.|\.[0-9]+)?)$/, '$1')
    }
  },
  /**
   * 生成 数字必须小于n 的过滤器方法
   * @param {number} n - 数字最大值
   * @return {function(*=)}
   */
  max (n) {
    return (val) => {
      let res = val
      if (Number(val) > n) {
        res = String(n)
      }
      return res
    }
  },
  /**
   * 生成 数字必须大于n 的过滤器方法
   * @param {number} n - 数字最小值
   * @return {function(*=)}
   */
  min (n) {
    return (val) => {
      let res = val
      if (Number(val) < n) {
        res = String(n)
      }
      return res
    }
  }
}
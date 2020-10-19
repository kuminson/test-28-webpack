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
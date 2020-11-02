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

/**
 * 自动测试表单
 * 依赖getInputValue方法
 * @param {{}} para - 初始化参数
 * {[]} para.testConfig - 测试配置
 * {{}} para.validator - 测试库async-validator的实例
 * {string} para.formSelector - 表单选择器
 * @method test() - 进行边缘测试
 * @method fill() - 填充安全值
 */

/**
 * para.testConfig 参考
 * [
 * // 输入框
 * {
 *   key: 'name', // data-validate的值
 *   safe: 'asdfa', // 安全值
 *   test: [  // 要进行的边缘测试
 *     {type: 'required'},
 *     {type: 'max', max: 32, text: 'a'},
 *     {type: 'space', space: 'all', text: 'adbc'},
 *     {type: 'text', text: 'asd ads'},
 *     {type: 'text', text: '1231'}
 *   ]
 * },
 * // 选择框
 * {
 *   key: 'equipment',
 *   safe: ['mac', 'pc'],
 *   test: [
 *     {type: 'required'}
 *   ]
 * }
 * ]
 */
export class autoFillForm {

  constructor (para) {
    // 表单类型
    this.itemType = {
      textType: ['text', 'password', 'number', 'email', 'url', 'textarea'],
      checkType: ['checkbox', 'radio'],
    }

    // 输入框通用测试方法
    this._testValTextFunc = {
      // 必填
      required () {
        return ''
      },
      // 文本
      text (config) {
        return config.text
      },
      // 最大值
      max (config) {
        const num = Math.ceil(config.max / config.text.length) + 1
        let text = ''
        for (let i = 0; i < num; i++) {
          text += config.text
        }
        return text
      },
      // 空格
      space (config) {
        let text = config.text

        switch (config.space) {
          case 'before':
            text = ' ' + text
            break
          case 'after':
            text = text + ' '
            break
          case 'all':
            text = ' ' + text + ' '
        }

        return text
      }
    }

    // 选择框通用测试方法
    this._testValSelectFunc = {
      required () {
        return []
      }
    }

    // 测试用配置
    this.testConfig = para.testConfig

    // 效验实例
    this.validator = para.validator

    this.inputEls = this._getInputEls(para.formSelector)
  }

  // 获取表单元素
  _getInputEls (formSelector) {
    // 表单元素
    const formEl = document.querySelector(formSelector)
    const itemEls = formEl.querySelectorAll('[data-validate]')

    // 获取所有input元素
    const inputEls = {}

    for (let item of itemEls) {
      // 如果是输入框
      if (item.type && this.itemType.textType.indexOf(item.type) !== -1) {
        inputEls[item.dataset.validate] = item
      }
      // 如果是选择
      if (item.type && this.itemType.checkType.indexOf(item.type) !== -1) {
        if (inputEls[item.dataset.validate] === undefined) {
          inputEls[item.dataset.validate] = []
        }
        inputEls[item.dataset.validate].push(item)
        continue
      }
      // 如果是特殊类型
      // if (item.dataset.validateValue !== undefined) {
      //   inputEls[item.dataset.validate] = item
      // }
    }

    return inputEls
  }

  test () {
    this._fillTest(true)
  }

  fill () {
    this._fillTest(false)
  }

  async _fillTest (isTest) {
    // 对input元素进行边缘测试
    let testState = true

    for (let item of this.testConfig) {
      // 判断key对应的元素是否存在
      if (this.inputEls[item.key] === undefined) {
        continue
      }

      // 调用测试方法
      if (item.test !== undefined && isTest) {


        for (let testItem of item.test) {
          const testRes = await new Promise((resolve) => {
            // 获取焦点
            if (this.inputEls[item.key].length === undefined) {
              this.inputEls[item.key].focus()
            } else {
              this.inputEls[item.key][0].focus()
            }

            // 注入文本
            let itemVal = null
            // 如果是输入框
            if (this.inputEls[item.key].length === undefined) {
              itemVal = this._testValTextFunc[testItem.type](testItem)
              this._setValText(this.inputEls[item.key], itemVal)
            } else { // 如果是选择框
              itemVal = this._testValSelectFunc[testItem.type](testItem)
              this._setValSelect(this.inputEls[item.key], itemVal)
            }

            // 效验结果
            setTimeout(() => {
              const formObj = getInputValue('.form', (val, name, type) => {
                if (type === 'input' && typeof val === 'string') {
                  return val.trim()
                }
                return val
              })
              this.validator.validate(formObj).then(() => {
                console.log('效检');
                // 判断当前值与输入值 是否相等
                const valEqualState = this._isSameVal(this.inputEls[item.key], itemVal, formObj[item.key])
                // 如果当前值与输入值不同 则判为未通过
                if (!valEqualState) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              }).catch(({ errors }) => {
                console.log('效检', errors);
                // 如果报错里含有目标元素 则边缘检测成功
                for (let child of errors) {
                  if (child.field === item.key) {
                    resolve(true)
                  }
                }
                // 如果报错里没有目标元素 判断值是否有变
                const valEqualState = this._isSameVal(this.inputEls[item.key], itemVal, formObj[item.key])
                if (!valEqualState) {
                  resolve(true)
                }
                resolve(false)
              })
            }, 20)
          })

          if (!testRes) {
            console.log('边缘测试未通过', testItem)
            testState = false
            break
          }

        }

      }

      // 注入安全内容
      if (this.inputEls[item.key].length === undefined) {
        this._setValText(this.inputEls[item.key], item.safe)
      } else { // 如果是选择框
        this._setValSelect(this.inputEls[item.key], item.safe)
      }



    }

    if (testState) {
      console.log('边缘测试 通过')
    }
  }

  // 设置输入框内容
  _setValText(els, val) {
    const evt = new InputEvent('input', {
      inputType: 'insertText',
      data: val,
      dataTransfer: null,
      isComposing: false
    });
    els.value = val
    els.dispatchEvent(evt)
  }

  // 设置选择框内容
  _setValSelect(els, val) {
    for (let item of els) {
      if (val.indexOf(item.value) !== -1) {
        item.checked = true
      }
    }
  }

  // 判断输入值是否不一样
  _isSameVal (inputEls, testVal, inputVal) {
    // 判断当前值与输入值 是否相等
    let valEqualState = null
    if (inputEls.length === undefined) {
      valEqualState = testVal === inputVal
    } else { // 如果是选择框
      valEqualState = JSON.stringify(JSON.parse(JSON.stringify(testVal)).sort()) === JSON.stringify(JSON.parse(JSON.stringify(inputVal)).sort())
    }
    return valEqualState
  }
}
import './index.scss'

import i18next, {i18nextConfig} from '@/i18n/index'
import {i18nextHtml} from '@/i18n/i18nextUtils'
import Schema from 'async-validator'
import {getInputValue, inputfilter, inputFilterFunc, autoFillForm} from '@/assets/js/utils'

const i18nData = {
  myName: 'superman',
  dateName: new Date()
}


i18next
  .init({
    ...i18nextConfig,
    lng: 'en',
    ns: ['home', 'common', 'error'],
    defaultNS: 'home',
  })
  .then((t) => {
    i18nextHtml(i18nData, t)

  })

const descriptor = {
  name: [
    {
      // 必填
      type: 'string', required: true,
      // 国际化
      message: () => i18next.t('title')
      // transform (val) {
      //   return val.trim()
      // }
    }, {
      // 正则
      type: 'string', pattern: new RegExp('^[a-zA-Z]+$'),
      message: 'Names can only be letters'
    }, {
      type: 'string', max: 32,
      message: 'The name should be less than 32 bits'
    }
  ],
  age: [
    {
      type: 'string', required: true,
      message: 'The age cannot be empty'
    }
  ],
  password: [
    {
      type: 'string', required: true,
      message: 'The password cannot be empty'
    },{
      // 字符长度限制
      type: 'string', min: 6,
      message: 'Passwords should be larger than six digits'
    }
  ],
  confirmPassword: [
    {
      type: 'string', required: true,
      message: 'The confirm Password cannot be empty'
    }, {
      type: 'stirng',
      // 自定义验证器
      validator: (rule, value, callback, source)  => {
        return value === source.password
      },
      message: 'The password should be the same twice'
    }
  ],
  email: [
    {
      type: 'string', required: true,
      message: 'The email cannot be empty'
    }, {
      type: 'email',
      message: 'Must be in email format'
    }, {
      type: 'string',
      message: 'Email must be available',
      // 异步效验
      asyncValidator () {
        return new Promise( (resolve) => {
          setTimeout(() => {
            resolve(true)
          }, 1000)
        })
      }
    }
  ],
  equipment: [
    {
      type: 'array', required: true,
      message: 'The equipment cannot be empty'
    }
  ]
}

// 关闭warning
Schema.warning = function(){};

const validator = new Schema(descriptor)


window.onload = () => {
  const submit = document.querySelector('#submit')
  submit.addEventListener('click', () => {
    const formObj = getInputValue('.form', (val, name, type) => {
      if (type === 'input' && typeof val === 'string') {
        return val.trim()
      }
      return val
    })
    console.log('formObj', formObj);
    validator.validate(formObj, {first: true}).then(() => {
      console.log('通过效检');
    }).catch(({ errors, fields }) => {
      console.log('未通过效检', errors, fields);
    })
  })

  const config = {
    age: [
      inputFilterFunc.onlyNumber(-1),
      inputFilterFunc.max(100),
      inputFilterFunc.noZeroBefore()
    ]
  }
  inputfilter('.form', config)
  // formTest('.form', false)

  const testConfig = [
    // 输入框
    {
      key: 'name',
      safe: 'asdfa',
      test: [
        {type: 'required'},
        {type: 'max', max: 32, text: 'a'},
        {type: 'space', space: 'all', text: 'adbc'},
        {type: 'text', text: 'asd ads'},
        {type: 'text', text: '1231'}
      ]
    },
    {
      key: 'age',
      safe: '24',
      test: [
        {type: 'required'},
        // {type: 'space', space: 'all', text: '99'},
        {type: 'text', text: '3 1'},
        {type: 'text', text: '1231'}
      ]
    },
    // 选择框
    {
      key: 'equipment',
      safe: ['mac', 'pc'],
      test: [
        {type: 'required'}
      ]
    }
  ]
  const aff = new autoFillForm({
    testConfig: testConfig,
    validator: validator,
    formSelector: '.form',
  })
  aff.test()
}



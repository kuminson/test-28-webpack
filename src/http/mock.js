const Mock = require('mockjs')

// 延时
Mock.setup({
  timeout: '200-600'
})

Mock.mock(/validatorRelation\/getDelegateAddressDetail$/,{
  'data': {
    'test|2-10': 't',
    'other|1-100.1-3': 1
  },
  'msg': '',
  'code': 200
})

Mock.mock(/api\/json\/data$/,{
  'data': {
    'test|2-10': '@sentence',
    'other|1-100.1-3': 1
  },
  'msg': '',
  'code': 200
})
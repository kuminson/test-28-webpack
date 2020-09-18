let baseUrl = {}

// 判断打包方式 开发模式
if (process.env.NODE_ENV === 'development') {
  baseUrl = {
    // 请求地址
    request: '/',
  }
  if (process.env.env_config === 'mock') {
    require('./mock')
  }
// 打包模式
} else if (process.env.NODE_ENV === 'production') {
  switch (process.env.env_config) {
    // 开发环境
    case 'dev':
      baseUrl = {
        request: 'https://xwalletprocoin-fat-1.pundix.com/apiBlockExplorer/',
        ws: '/socket'
      }
      break
    // 测试环境
    case 'test':
      baseUrl = {
        request: '',
      }
      break
    // 仿真环境
    case 'uat':
      baseUrl = {
        request: '',
      }
      break
    // 生产环境
    case 'prod':
      baseUrl = {
        request: 'https://dappfx.functionx.io/testnet/apiBlockExplorer/',
      }
      break
  }
}

module.exports = baseUrl

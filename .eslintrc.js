module.exports = {
  root: true, // 当前目录为根级目录 eslint不用再往上层去找配置文件了
  parserOptions: {
    ecmaVersion: 12, // 支持的es版本
    sourceType: 'module' // 模块方式
  },
  extends: [
    'eslint:recommended', // 官方推荐规则配置
    'prettier' // prettier用来覆盖冲突的规则
  ],
  // 已经预设好的全局变量
  env: {
    node: true,
    mocha: true,
    browser: true, // 浏览器环境的全局变量
    es2021: true
  }
}

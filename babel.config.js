module.exports = {
  "presets": [
    ["@babel/env", {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      corejs: false,   // 不引入局部polyfill
      helpers: true,  // 去重
      regenerator: false,  // 不使用局部
    }]
  ]
}
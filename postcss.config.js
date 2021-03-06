module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-px-to-viewport')({
      viewportWidth: 375,
      mediaQuery: true,
      exclude: /pages\/test/
    }),
    require('css-mqpacker') // 把重复的@media合成一个
  ]
}

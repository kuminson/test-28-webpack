import './index.scss'

console.log('logout')

console.log(
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('Promise')
      resolve()
    }, 3000)
  })
)

const ll = {
  ak: 123,
  adsf: 13123
}

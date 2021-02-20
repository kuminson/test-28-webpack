import './index.scss'

window.onload = () => {
  document.body.addEventListener('focusin', (e) => {
    if (e.target.className.search(/test-input/) !== -1) {
      e.target.parentNode.classList.add('woqu')
      setTimeout(() => {
        e.target.parentNode.classList.add('zdld')
      }, 0)
    }
  })
  document.body.addEventListener('focusout', (e) => {
    if (e.target.className.search(/test-input/) !== -1) {
      e.target.parentNode.classList.remove('zdld')
      setTimeout(() => {
        e.target.parentNode.classList.remove('woqu')
      }, 300)
    }
  })
}

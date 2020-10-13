import {add, addChild} from '../../http/utils'

describe('test add function', () => {
  it('should return 3 when the value is not present', () => {
    expect(add(1, 2)).to.equal(3)
  })
})


describe('test dom function', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="testDom"></div>'
    addChild('.testDom')
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })
  it('should increase a div', () => {
    const dom = document.querySelector('.testDom')
    expect(dom.innerHTML).to.equal(`<div>lalala</div>`)
  })
})

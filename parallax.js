parallaxList = []
window.addEventListener('load', function(e) {
  for (let elm of document.getElementsByClassName('parallax-container')) parallaxList.push(new Parallax(elm))
});
window.addEventListener('scroll', function(e) {
  parallaxList.map(elm => elm.onscroll(e))
});
class Parallax {
  constructor(elm) {
    this.elm = elm
    // console.log(elm)
    this.elm.style.position = 'relative'
    this.div = createElement('div', this.elm)
    this.div.style = 'position: absolute; width: 100%; height: 100%; clip: rect(auto,auto,auto,auto)'
    this.elements = []
    for (let child of this.elm.children) {
      if (child.className.includes('parallax-element')) this.elements.push(child)
      console.log(child)
    }
    this.elements.map(elm => this.div.appendChild(elm))
    this.update()
  }
  update() {
    let prog = Math.min(1, Math.max(0, -this.elm.getBoundingClientRect().y / this.elm.clientHeight))
    this.elements.map(elm => {
      if (!!elm.dataset.animation) {
        elm.style.animationName = elm.dataset.animation
        elm.style.animationTimingFunction = elm.dataset.timing || 'linear'
        elm.style.animationPlayState = 'paused'
        elm.style.animationDuration = '1s'
        elm.style.animationDelay = -prog+'s'
      } else {
        let sensitivity = (isNaN(parseFloat(elm.dataset.sensitivity))) ? 1 : parseFloat(elm.dataset.sensitivity)
        let offset = parseFloat(elm.dataset.offset) || 0
        if (elm.dataset.fixed !== undefined) {
          elm.style.position = 'fixed'
          elm.style.top = this.elm.getBoundingClientRect().y + this.elm.clientHeight*offset + window.pageYOffset*(1-sensitivity)+'px'
        } else {
          elm.style.position = 'absolute'
          elm.style.top = this.elm.clientHeight*offset + window.pageYOffset*(1-sensitivity)+'px'
        }
      }
      // console.log(window.pageYOffset)
    })
  }
  onscroll() {
    this.update()
  }
}

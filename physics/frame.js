frames = []

class Frame {
   constructor(elm) {
      this.elm = elm
      this.children = this.elm.children
   }
   update() {
      let rect = this.elm.getBoundingClientRect()
      for (let child of this.children) {
         if (child.classList.contains('framed')) {
            child.style.width = rect.width + 'px'
            child.style.height = rect.height + 'px'
         }
      }
   }
}

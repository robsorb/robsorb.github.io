class Parallax {
   constructor(id) {
      this.elm = document.getElementById(id)
      this.objects = []
      for (let child of this.elm.children) {
         if (child.classList.contains("parallax_element")) {
            this.objects.push(new ParallaxObject(this, child))
         }
      }
      parallaxList.push(this)
   }

   update() {
      for (let object of this.objects) {
         object.update()
      }
   }

   onscroll(e) {
      for (let object of this.objects) {
         object.onscroll(e)
      }
   }
}

class ParallaxObject {
   constructor(parallax, elm) {
      this.parallax = parallax
      this.elm = elm
      this.distance = parseFloat(this.elm.getAttribute("distance"))
      this.startHeight = parseFloat(this.elm.getAttribute("position")) || 0

      this.scrollY = 0

      this.update()
   }

   update() {
      this.elm.style.top = floatToPx(this.parallax.elm.clientHeight * (1 - this.startHeight) - this.elm.clientHeight/2 - this.scrollY * this.distance + this.scrollY) //floatToPx(this.parallax.elm.clientHeight * (1 - this.startHeight) - this.elm.clientHeight/2 - this.scrollY * this.distance)
   }

   onscroll(e) {
      this.scrollY = window.scrollY

      this.update()
   }
}

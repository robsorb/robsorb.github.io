parallaxList = []
hidableList = []
animationList = []
galleryList = []
correctorList = []

window.onload = function () {

   for (let elm of document.getElementsByClassName("hidable")) {
		hidableList.push(new Hidable(elm))
	}
   for (let elm of document.getElementsByClassName("animation")) {
		animationList.push(new Animation(elm))
	}
   for (let elm of document.getElementsByClassName("image_gallery")) {
		galleryList.push(new ImgGallery(elm))
	}
   for (let elm of document.getElementsByClassName("heightCorrect")) {
		correctorList.push(new HeightCorrect(elm))
	}

   navigation = new Navigation("navigation")

   parallax = new Parallax("head_parallax")

}



window.onresize = function () {
   for (let parallax of parallaxList) {
      parallax.update()
   }
   for (let gallery of galleryList) {
      gallery.update()
   }
   for (let elm of correctorList) {
      elm.update()
   }
}

window.onscroll = function(e) {
   for (let parallax of parallaxList) {
      parallax.onscroll(e)
   }
}

function floatToPx(float) {
   return parseInt(float) + "px"
}

function addClass(elm, className) {
   if (!elm.classList.contains(className)) {
      elm.className += " "+className
   }
}
function removeClass(elm, className) {
   elm.classList.remove(className)
}

function createChild(parent, type) {

 	var elm = document.createElement(type);

	parent.appendChild(elm)

	return elm
}

class HeightCorrect {
   constructor(elm) {
      this.elm = elm
      this.elmList = document.getElementsByClassName(this.elm.getAttribute("elementClass"))
      this.update()
   }
   update() {
      this.elm.style.position = "relative"
      this.elm.style.top = this.elmList[0].clientHeight+"px"
   }
}

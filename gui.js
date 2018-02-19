class Navigation {
   constructor(id) {
      this.elm = document.getElementById(id)
   }

   onclick() {

   }
}
class ImgGallery {
	constructor(elm) {
		this.elm = elm
		this.images = []
		this.ratios = []
		this.index = 0;
		this.maxWidth = 0.8

		for (let img of this.elm.children) {
			if (!img.classList.contains("arrow")) {
				this.images.push(img)
			}
		}
		for (let img of this.images) {
			this.ratios.push(img.clientWidth/img.clientHeight)
		}

		this.createArrows()

		this.update()
	}
	createArrows() {
		this.leftArrowDiv = createChild(this.elm, "div")
		this.leftArrowDiv.className = "arrow"

		this.leftArrowDiv.style.position = "absolute"
      this.leftArrowDiv.style.cursor = "pointer"

		this.leftArrowDiv.onmouseover = function (e) { this.leftArrowImg.style.transform = "translate(-75%, -50%) rotate(-90deg) scale(1.2)" }.bind(this)
		this.leftArrowDiv.onmouseout = function (e) { this.leftArrowImg.style.transform = "translate(-40%, -50%) rotate(-90deg) scale(1)" }.bind(this)
		this.leftArrowDiv.onclick = this.left.bind(this)

		this.leftArrowImg = createChild(this.leftArrowDiv, "img")
		this.leftArrowImg.setAttribute("src", "img/gui/up_arrow.png")


		this.leftArrowImg.style.transition = "0.3s transform"
		this.leftArrowImg.style.position = "absolute"
		this.leftArrowImg.style.width = "50%"
		this.leftArrowImg.style.left = "50%"
		this.leftArrowImg.style.top = "50%"
		this.leftArrowImg.style.transform = "translate(-40%, -50%) rotate(-90deg)"



	 	this.rightArrowDiv = createChild(this.elm, "div")
		this.rightArrowDiv.className = "arrow"

		this.rightArrowDiv.style.position = "absolute"
		this.rightArrowDiv.style.left = "100%"
		this.rightArrowDiv.style.transform = "translate(-100%, 0)"
      this.rightArrowDiv.style.cursor = "pointer"

		this.rightArrowDiv.onmouseover = function (e) { this.rightArrowImg.style.transform = "translate(-40%, -50%) rotate(90deg) scale(1.2)" }.bind(this)
		this.rightArrowDiv.onmouseout = function (e) { this.rightArrowImg.style.transform = "translate(-75%, -50%) rotate(90deg) scale(1)" }.bind(this)
		this.rightArrowDiv.onclick = this.right.bind(this)

		this.rightArrowImg = createChild(this.rightArrowDiv, "img")
		this.rightArrowImg.setAttribute("src", "img/gui/up_arrow.png")

		this.rightArrowImg.style.transition = "0.3s transform"
		this.rightArrowImg.style.position = "absolute"
		this.rightArrowImg.style.width = "50%"
		this.rightArrowImg.style.top = "50%"
		this.rightArrowImg.style.left = "50%"
		this.rightArrowImg.style.transform = "translate(-50%, -50%) rotate(90deg)"

	}
	update() {

		for (let i = 0; i < this.images.length; i++) {
			if (this.elm.clientWidth/this.elm.clientHeight > this.ratios[i]/this.maxWidth) {
				this.images[i].style.width = "auto"
				this.images[i].style.height = this.elm.clientHeight+"px"
			} else {
				this.images[i].style.width = this.maxWidth * this.elm.clientWidth + "px"
				this.images[i].style.height = "auto"
			}
			if (i > this.index) {
				this.images[i].style.left = this.elm.clientWidth*2 + "px"
			}
			if (i < this.index) {
				this.images[i].style.left = -this.images[i].clientWidth-this.elm.clientWidth + "px"
			}
			if (i == this.index) {
				this.images[i].style.left = this.elm.clientWidth/2 - this.images[i].clientWidth/2 + "px"
			}
			this.images[i].style.transition = "left 0.5s"
			this.images[i].style.top = this.elm.clientHeight/2 - this.images[i].clientHeight/2 + "px"

			console.log(this.elm.clientHeight + "px")
		}
      this.leftArrowDiv.style.width = this.elm.clientWidth * (1-this.maxWidth)/2 + "px"
		this.leftArrowDiv.style.height = this.elm.clientHeight + "px"
		this.rightArrowDiv.style.width = this.elm.clientWidth * (1-this.maxWidth)/2 + "px"
		this.rightArrowDiv.style.height = this.elm.clientHeight + "px"
	}
	right() {

		this.index = Math.min(this.index+1, this.images.length-1)
		this.update()
	}
	left() {

		this.index = Math.max(this.index-1, 0)
		this.update()
	}
}

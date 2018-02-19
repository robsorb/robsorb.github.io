function initUI() {
   for (let elm of document.getElementsByClassName("numInput")) new NumberInput(elm)
   initZoom()
}

class Hidable {
	constructor(elm) {
		this.elm = elm
		this.contentElm = this.elm.children[0]
      this.paragraphs = getChildrenByTagName("P", this.elm)

		this.maxHeight = this.contentElm.scrollHeight

		this.elm.onclick = this.onclick.bind(this)
		this.contentElm.style.overflow = "hidden"
		if (this.elm.classList.contains("hidden")) {
			this.hidden = true;
			this.contentElm.style.height = "0"
		} else if (this.elm.classList.contains("unhidden")) {
			this.hidden = false;
			this.contentElm.style.height = this.maxHeight+"px"
		}

      this.update()
	}
	update() {
		if (this.hidden) {
			this.elm.classList.remove("unhidden")
			this.elm.className += " hidden"
			this.contentElm.style.height = "0"
			this.contentElm.style.transition = "height 1s"
		} else {
			this.elm.classList.remove("hidden")
			this.elm.className += " unhidden"
			this.contentElm.style.height = this.maxHeight+"px"
			this.contentElm.style.transition = "height 1s"
		}
      if (this.elm.getAttribute("constHeight") == "true") {
         this.elm.style.height = this.maxHeight+"px"
      }
	}
	onclick(e) {
      let onPar = false
      for (let p of this.paragraphs) {
         let rect = p.getBoundingClientRect()
         if (e.clientX > rect.x && e.clientX < rect.x+rect.width && e.clientY > rect.y && e.clientY < rect.y+rect.height) {
            onPar = true;
            break;
         }
      }
      if (!onPar) {
         this.hidden = !this.hidden
         this.update()
      }
	}
}

UIInitList.push(function() {initUIElms('zoom', Zoomable)})
UIResizeList.push(function() {UIElms.zoom.map(e => e.update())})

class Zoomable {
  constructor(elm) {
    this.elm = elm
    this.elm.style.cursor = 'zoom-in'
    this.src = this.elm.getAttribute('src')
    this.zoomed = createElement('img', document.body)
    this.zoomed.classList.add('zoomed')
    this.zoomed.setAttribute('src', this.src)
    this.zoomed.style = 'position: fixed; display: none'

    this.delta = 1.1
    this.scale = 1
    this.loc = Vec()
    this.mouseLoc = Vec()
    this.aspectRatio = this.elm.clientWidth/this.elm.clientHeight
    this.left = false

    this.elm.addEventListener('mousedown', this.mousedown.bind(this))
    if (this.zoomed.addEventListener) {
			// IE9, Chrome, Safari, Opera
			this.zoomed.addEventListener("mousewheel", this.onscroll.bind(this), false);
			// Firefox
			this.zoomed.addEventListener("DOMMouseScroll", this.onscroll.bind(this), false);
		}
		// IE 6/7/8
		else this.zoomed.attachEvent("onmousewheel", this.onscroll.bind(this));

    this.zoomed.addEventListener("mousedown", function(e){e.preventDefault(); this.left = true;}.bind(this), false)
    this.zoomed.addEventListener("mousemove", this.onmove.bind(this), false)
    document.addEventListener("mouseup", function(e){this.left = false;}.bind(this), false)
  }
  get width() { return this.zoomed.clientWidth }
  get height() { return this.zoomed.clientHeight }
  mousedown(e) {
    Zoomable.zoomOut()
    this.zoomed.style.display = 'block'
    Zoomable.exitZoom.style.display = 'initial'
   // for (let c of document.body.children) if (c.className !== 'zoomed' && c !== Zoomable.exitZoom) c.style.filter = 'blur(2px) contrast(50%)'
    this.update()
  }
  update() {
    if (this.scale > 1 && this.left) {
      this.zoomed.style.cursor = "-webkit-grabbing"
      this.zoomed.style.cursor = "-moz-grabbing"
    } else if (this.scale > 1 && !this.left) {
      this.zoomed.style.cursor = "-webkit-grab"
      this.zoomed.style.cursor = "-moz-grab"
    } else this.zoomed.style.cursor = "zoom-in"
    if (window.innerWidth/window.innerHeight < this.aspectRatio) {
      this.zoomed.style.width = window.innerWidth*this.scale+'px'
      this.zoomed.style.height = 'auto'
    } else {
      this.zoomed.style.width = 'auto'
      this.zoomed.style.height = window.innerHeight*this.scale+'px'
    }
    this.loc = Vec(
      min(max(0, this.width/2-window.innerWidth/2), max(min(0, window.innerWidth/2-this.width/2), this.loc.x)),
      min(max(0, this.height/2-window.innerHeight/2), max(min(0, window.innerHeight/2-this.height/2), this.loc.y))
    )
    this.zoomed.style.left = window.innerWidth/2 - this.width/2 + this.loc.x + 'px'
    this.zoomed.style.top = window.innerHeight/2 - this.height/2 + this.loc.y + 'px'
  }
  onscroll(e) {
    e.preventDefault()
    var e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    this.mouseLoc = Vec(e.clientX, e.clientY).sub(Vec(window.innerWidth/2, window.innerHeight/2))

    this.loc = this.loc.sub(this.mouseLoc).scale(this.delta**delta).add(this.mouseLoc)
    this.scale = Math.max(1, this.scale*this.delta**delta)
    this.update()
  }
  onmove(e) {
    if (this.left) {
      var dLoc = Vec(e.movementX, e.movementY)
      this.loc = this.loc.add(dLoc)
    }
    this.update()
  }
  zoomOut() {
    this.scale = 1
    this.zoomed.style.display = 'none'
  }
  static zoomOut() {
    for (let c of document.body.children) if (c.className !== 'zoomed' && c !== Zoomable.exitZoom) c.style.filter = 'none'
    Zoomable.exitZoom.style.display = 'none'
    UIElms.zoom.map(e => e.zoomOut())
  }
  static init() {
    this.exitZoom = createElement('i', document.body)
    this.exitZoom.className = "fas fa-search-minus"
    this.exitZoom.style = "position: fixed; right: 0; top: 0; cursor: pointer; padding: 20px"
    this.exitZoom.style.textShadow = '#000 0px 0px 2px'; this.exitZoom.style.fontSize = '18px'; this.exitZoom.style.display = 'none'
    this.exitZoom.style.color ="white"
    this.exitZoom.addEventListener('mousedown', this.zoomOut, false)
  }
}

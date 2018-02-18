zoomables = []

function initZoom() {
   for (let elm of document.getElementsByClassName("zoom")) new Zoomable(elm)
   if (zoomables.length > 0) {
      exitZoom = createElement('i', document.body)
      exitZoom.className = "fas fa-search-minus"
      exitZoom.style.position = 'fixed'; exitZoom.style.right = '0'; exitZoom.style.top = '0'; exitZoom.style.cursor = 'pointer'; ; exitZoom.style.padding = '20px'
      exitZoom.style.textShadow = '#000 0px 0px 2px'; exitZoom.style.fontSize = '18px'; exitZoom.style.display = 'none'
      exitZoom.style.color ="white"
      exitZoom.addEventListener('mousedown', zoomOut, false)
   }
}
function zoomOut (e) {
   for (let z of zoomables) z.zoomOut()
}

class Zoomable {
   constructor(elm) {
      this.elm = elm
      this.elm.style.cursor = 'zoom-in'
      this.src = this.elm.src

      this.mousedown = false
      this.zoomLevel = 1
      this.x = 0; this.y = 0;

      this.zoomed = createElement('img', document.body)
      this.zoomed.src = this.src
      this.zoomed.style.position = 'fixed'; this.zoomed.style.left = '50%'; this.zoomed.style.top = '50%';
      this.zoomed.style.display = 'none'; this.zoomed.style.cursor = "grab"
      this.resize()

      this.elm.addEventListener('mousedown', this.ondown.bind(this), false)
      if (this.zoomed.addEventListener) {
			// IE9, Chrome, Safari, Opera
			this.zoomed.addEventListener("mousewheel", this.onscroll.bind(this), false);

			// Firefox
			this.zoomed.addEventListener("DOMMouseScroll", this.onscroll.bind(this), false);
		}
		// IE 6/7/8
		else this.zoomed.attachEvent("onmousewheel", this.onscroll.bind(this));

      this.zoomed.addEventListener("mousedown", function(e){e.preventDefault(); this.mousedown = true; this.zoomed.style.cursor = "grabbing"}.bind(this), false)
      this.zoomed.addEventListener("mousemove", this.onmove.bind(this), false)
      document.addEventListener("mouseup", function(e){this.mousedown = false; this.zoomed.style.cursor = "grab"}.bind(this), false)

      zoomables.push(this)
   }
   onmove(e) {
      if (this.mousedown) {
         this.x += e.movementX
         this.y += e.movementY
         let rect = this.zoomed.getBoundingClientRect();
         let maxX = this.x + window.innerWidth/2 - (this.x + rect.width/2); let minX = this.x -window.innerWidth/2 - (this.x - rect.width/2)
         this.x = (rect.width > window.innerWidth) ? this.x : min(maxX, max(minX, this.x))
         let maxY = this.y + window.innerHeight/2 - (this.y + rect.height/2); let minY = this.y -window.innerHeight/2 - (this.y - rect.height/2)
         this.y = (rect.height > window.innerHeight) ? this.y : min(maxY, max(minY, this.y))
         this.resize()
      }
   }
   ondown(e) {
      e.preventDefault()
      this.zoomIn()
      this.resize()
   }
   onscroll(e) {
      e.preventDefault()
      var e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      this.x = (e.clientX - window.innerWidth/2) + max(this.zoomLevel * 1.1 ** delta, 1)/this.zoomLevel * (this.x - (e.clientX - window.innerWidth/2));
      this.y = (e.clientY - window.innerHeight/2) + max(this.zoomLevel * 1.1 ** delta, 1)/this.zoomLevel * (this.y - (e.clientY - window.innerHeight/2));

      let rect = this.zoomed.getBoundingClientRect();
      let maxX = this.x + window.innerWidth/2 - (this.x + rect.width/2); let minX = this.x -window.innerWidth/2 - (this.x - rect.width/2)
      this.x = (rect.width > window.innerWidth) ? this.x : min(maxX, max(minX, this.x))
      let maxY = this.y + window.innerHeight/2 - (this.y + rect.height/2); let minY = this.y -window.innerHeight/2 - (this.y - rect.height/2)
      this.y = (rect.height > window.innerHeight) ? this.y : min(maxY, max(minY, this.y))

      this.zoomLevel = max(this.zoomLevel * 1.1 ** delta, 1)
      this.resize()
   }
   zoomIn() {
      zoomOut()
      this.zoomed.style.display = 'initial'
      exitZoom.style.display = 'initial'
      this.zoomLevel = 1
      this.x = 0; this.y = 0;
   }
   zoomOut() {
      this.zoomed.style.display = 'none'
      exitZoom.style.display = 'none'
      this.zoomLevel = 1
      this.x = 0; this.y = 0
   }
   resize() {
      if (this.zoomed.getBoundingClientRect().width / this.zoomed.getBoundingClientRect().height > window.innerWidth/window.innerHeight) {
         this.zoomed.style.width = round(this.zoomLevel*100)+'%';
         this.zoomed.style.height = 'auto'
      } else {
         this.zoomed.style.height = round(this.zoomLevel*100)+'%';
         this.zoomed.style.width = 'auto'
      }
      let rect = this.zoomed.getBoundingClientRect()

      this.zoomed.style.transform = "translate("+(-rect.width/2+this.x)+"px, "+(-rect.height/2+this.y)+"px)"
   }
}

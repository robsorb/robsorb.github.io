numInputs = []
numInputIds = {}

class NumberInput {
   constructor(element) {
      this.elm = element

      this.mode = 0;
      this.mouseX = 0;
      this.mouseOver = false;
      this.shift = false

      this.id = this.elm.id
      this.default = parseFloat(this.elm.getAttribute('defaultValue')) || 0
      this.decimals = parseFloat(this.elm.getAttribute('decimals')) || 1
      this.min = (this.elm.getAttribute('min') === null) ? -Infinity : parseFloat(this.elm.getAttribute('min'))
      this.max = (this.elm.getAttribute('max') === null) ? Infinity : parseFloat(this.elm.getAttribute('max'))
      this.step = parseFloat(this.elm.getAttribute('step')) || 1
      this.microStep = parseFloat(this.elm.getAttribute('microStep')) || this.step/10
      this.round = true//this.elm.getAttribute('round') === ''

      this.value = this.default

      this.width = parseFloat(this.elm.getAttribute('width')) || 100; this.height = parseFloat(this.elm.getAttribute('height')) || 20
      this.buttonStyle = this.elm.dataset.buttonStyle || "angle"

      this.elm.style.display = 'inline'

      this.bgSvg = createSVG("svg", this.elm);
      this.bgSvg.style.position = "absolute"; this.bgSvg.style.left = "50%"; this.bgSvg.style.top = "50%"; this.bgSvg.style.transform = "translate(-50%, -50%)";
      this.bgSvg.setAttributeNS(null, 'width', this.width); this.bgSvg.setAttributeNS(null, 'height', this.height)

      this.bgRect = createSVG("rect", this.bgSvg);
      this.bgRect.setAttributeNS(null, 'style', "fill:white; stroke: lightgray; stroke-width:1; opacity:1")
      this.bgRect.setAttributeNS(null, 'width', this.width); this.bgRect.setAttributeNS(null, 'height', this.height); this.bgRect.setAttributeNS(null, 'rx', this.height/2); this.bgRect.setAttributeNS(null, 'ry', this.height/2)
      


      this.decrement = createElement("span", this.elm)
      // this.decrement.style.backgroundColor = 'pink'
      this.decrement.style.position = 'relative'
      this.decrement.style.display = 'inline-block'
      this.decrement.style.verticalAlign = 'middle'
      this.decrement.style.width = this.height+'px'; this.decrement.style.height = this.height+'px';
      this.decrement.style.color = "black";
      this.decrement.style.cursor = "pointer";
      this.decrementLabel = createElement('i', this.decrement);
      this.decrementLabel.style.position = 'absolute'; this.decrementLabel.style.left = '50%'; this.decrementLabel.style.top = '50%'; this.decrementLabel.style.transform = 'translate(-50%, -50%)'
      

      this.div = createElement('span', this.elm)
      this.div.style.position = "relative"
      this.div.style.zIndex = "10"
      this.input = createElement("input", this.div)
      this.input.style.width = this.width/2 +'px'; this.input.style.height = this.height+'px'; this.input.style.fontSize = 0.75 * this.height+'px'
      this.input.style.border = "none"; this.input.style.backgroundColor = "transparent"; this.input.style.color = "black"; this.input.style.textAlign = "center";
      this.input.style.cursor = "pointer"; this.input.style.outline = 'none'
      this.setValue()

      this.increment = createElement("span", this.elm)
      this.increment.style.display = 'inline-block'
      this.increment.style.verticalAlign = 'middle'
      // this.increment.style.backgroundColor = 'pink'
      this.increment.style.position = "relative";
      this.increment.style.width = this.height+'px'; this.increment.style.height = this.height+'px';
      this.increment.style.color = "black"; this.increment.style.cursor = "pointer";
      this.incrementLabel = createElement('i', this.increment);
      this.incrementLabel.style.position = 'absolute'; this.incrementLabel.style.left = '50%'; this.incrementLabel.style.top = '50%'; this.incrementLabel.style.transform = 'translate(-50%, -50%)'
      
      if (this.buttonStyle == "plusMinus") {
         this.increment.style.fontSize = this.height * 0.6 + 'px';
         this.incrementLabel.style.transform = "translate(-50%, -60%)"
         this.incrementLabel.className = "fas fa-plus"
         this.decrement.style.fontSize = this.height * 0.6 + 'px';
         this.decrementLabel.style.transform = "translate(-50%, -60%)"
         this.decrementLabel.className = "fas fa-minus"
      } else if (this.buttonStyle == "angle") {
         this.increment.style.fontSize = this.height * 0.75 + 'px';
         this.incrementLabel.className = "fas fa-angle-right"
         this.decrement.style.fontSize = this.height * 0.75 + 'px';
         this.decrementLabel.className = "fas fa-angle-left"
      } else if (this.buttonStyle == "caret") {
         this.increment.style.fontSize = this.height * 0.8 + 'px';
         this.incrementLabel.className = "fas fa-caret-right"
         this.decrement.style.fontSize = this.height * 0.8 + 'px';
         this.decrementLabel.className = "fas fa-caret-left"
      } else if (this.buttonStyle == "arrow") {
         this.increment.style.fontSize = this.height * 0.6 + 'px';
        this.incrementLabel.style.transform = "translate(-50%, -60%)"
         this.incrementLabel.className = "fas fa-arrow-right"
         this.decrement.style.fontSize = this.height * 0.6 + 'px';
        this.decrementLabel.style.transform = "translate(-50%, -60%)"
         this.decrementLabel.className = "fas fa-arrow-left"
      } else if (this.buttonStyle == "circle") {
         this.increment.style.fontSize = this.height * 0.3 + 'px';
         this.incrementLabel.className = "fas fa-circle"
         this.decrement.style.fontSize = this.height * 0.3 + 'px';
         this.decrementLabel.className = "fas fa-circle"
      }

      this.input.addEventListener("mousedown", function (e) { if (this.mode != 2) { e.preventDefault(); e.stopPropagation(); } }.bind(this), false);
      this.input.addEventListener("mouseup", this.onup.bind(this), false);
      this.input.addEventListener("mousemove", this.onmove.bind(this), false);
      this.input.addEventListener("mouseenter", function(e){this.mouseOver = true}.bind(this), false);
      this.input.addEventListener("mouseleave", function(e){this.mouseOver = false}.bind(this), false);

      this.input.addEventListener("mousedown", this.ondown.bind(this), false);
      this.input.addEventListener("change", this.onchange.bind(this), false);
      this.increment.addEventListener("mouseenter", function (e) {e.target.style.color = "lightgray"}, false); this.increment.addEventListener("mouseleave", function (e) {e.target.style.color = "black"}, false);
      this.decrement.addEventListener("mouseenter", function (e) {e.target.style.color = "lightgray"}, false); this.decrement.addEventListener("mouseleave", function (e) {e.target.style.color = "black"}, false);
      this.increment.addEventListener("mousedown", this.onright.bind(this), false);
      this.decrement.addEventListener("mousedown", this.onleft.bind(this), false);

      document.addEventListener("mousedown", function(e){ if (!this.mouseOver) {this.onchange()} }.bind(this), false);
      document.addEventListener("keydown", function(e){ if (e.keyCode == 13 && this.mode == 2) {this.onchange()} }.bind(this), false);
      document.addEventListener("keyup", function(e){ if (e.keyCode == 16) { this.shift = false }}.bind(this), false);

      numInputs.push(this)
      if (this.id !== undefined) numInputIds[this.id] = this
   }
   typeMode() {
      this.input.style.width = this.width +'px';
      this.input.style.textAlign = "left";
      this.input.style.cursor = "text"
      this.increment.style.display = 'none'; this.decrement.style.display = 'none'
      this.mode = 2
   }
   viewMode() {
      this.input.style.width = this.width - this.height*2 +'px';
      this.input.style.textAlign = "center";
      this.input.style.cursor = "pointer"
      this.increment.style.display = 'inline-block'; this.decrement.style.display = 'inline-block'
      this.mode = 0
      this.input.blur()
   }
   update() {

   }
   onmove(e) {
      if (this.mode == 1 || this.mode == 3) {
         this.mouseX += e.movementX
         if (this.mouseX > 10) {
            this.mouseX = 0
            this.increase(e.shiftKey)
            this.mode = 3
         } else if (this.mouseX < -10) {
            this.mouseX = 0
            this.decrease(e.shiftKey)
            this.mode = 3
         }
      }
   }
   ondown(e) {
      if (this.mode == 0) {
         this.mode = 1

         var element = e.target
         element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
         element.requestPointerLock();
      }
   }
   onup(e) {
      if (this.mode == 1) {
         this.typeMode();
         e.target.select()
      } else if (this.mode == 3) {
         this.viewMode();
      }
      document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;
      document.exitPointerLock();
   }
   onchange() {
      this.viewMode()
      let value = eval(this.input.value.replace(/[^-()\d/*+.]/g, ''))
      if (value !== undefined) {
         this.value = min(this.max, max(this.min, parseFloat(value)))
      }
      this.setValue()
   }
   onright(e) {
      this.increase(e.shiftKey)
   }
   onleft(e) {
      this.decrease(e.shiftKey)
   }
   increase(shift) {
      if (!isNaN(this.input.value)) {
         if (shift) this.value = min(this.max, max(this.min, parseFloat(this.input.value)+this.microStep))
         else this.value = min(this.max, max(this.min, parseFloat(this.input.value)+this.step))
      }
      this.setValue()
   }
   decrease(shift) {
      if (!isNaN(this.input.value)) {
         if (shift) this.value = min(this.max, max(this.min, parseFloat(this.input.value)-this.microStep))
         else this.value = min(this.max, max(this.min, parseFloat(this.input.value)-this.step))
      }
      this.setValue()
   }
   resetVal() {
      this.value = this.default;
      this.input.value = this.value.toFixed(this.decimals)
   }
   setValue() {
      let decimals = ((this.value+'').split('.')[1] || []).length

      this.input.value = this.value.toFixed(this.decimals)
   }
}

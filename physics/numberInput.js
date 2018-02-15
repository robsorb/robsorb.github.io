numInputs = []
numInputIds = {}

class numberInput {
   constructor(element) {
      this.elm = element

      this.default = (this.elm.getAttribute('default') !== null) ? parseFloat(this.elm.getAttribute('default')) : 0
      this.value = this.default;
      this.decimals = (this.elm.getAttribute('decimals') !== null) ? parseFloat(this.elm.getAttribute('decimals')) : 1
      this.step = (this.elm.getAttribute('step') !== null) ? parseFloat(this.elm.getAttribute('step')) : 1
      this.min = (this.elm.getAttribute('min') === null) ? -Infinity : parseFloat(this.elm.getAttribute('min'))
      this.max = (this.elm.getAttribute('max') === null) ? Infinity : parseFloat(this.elm.getAttribute('max'))
      this.id = (this.elm.getAttribute('id') !== null) ? this.elm.getAttribute('id') : undefined

      let width = parseFloat(this.elm.getAttribute('width')); let height = parseFloat(this.elm.getAttribute('height'))
      this.svgBg = createSVG('svg', this.elm)
      this.svgBg.setAttributeNS(null, 'class', "numInput-bg")
      this.svgBg.setAttributeNS(null, 'width', width); this.svgBg.setAttributeNS(null, 'height', height)
      this.bg = createSVG('rect', this.svgBg)
      this.bg.setAttributeNS(null, 'width', width-2); this.bg.setAttributeNS(null, 'height', height-2)
      this.bg.setAttributeNS(null, 'rx', height/2); this.bg.setAttributeNS(null, 'ry', height/2)
      this.bg.setAttributeNS(null, 'x', 1); this.bg.setAttributeNS(null, 'y', 1)
      this.bg.setAttributeNS(null, 'style', "fill:white; stroke-width:1; opacity:1")

      this.leftButtonSvg = createSVG('svg', this.elm)
      this.leftButtonSvg.setAttributeNS(null, 'class', "numInput-button")
      this.leftButtonSvg.setAttributeNS(null, 'width', height); this.leftButtonSvg.setAttributeNS(null, 'height', height)
      this.leftButtonSvg.setAttributeNS(null, 'style', "position: absolute; left: 0")
      this.leftButton = createSVG('polygon', this.leftButtonSvg)
      this.leftButton.setAttributeNS(null, 'points', height/3+","+height/2+" "+height/1.6+","+height/4+" "+height/1.6+","+(height - height/4)); this.leftButton.setAttributeNS(null, 'style', "stroke-width: 0;")

      this.rightButtonSvg = createSVG('svg', this.elm)
      this.rightButtonSvg.setAttributeNS(null, 'class', "numInput-button")
      this.rightButtonSvg.setAttributeNS(null, 'width', height); this.rightButtonSvg.setAttributeNS(null, 'height', height)
      this.rightButtonSvg.setAttributeNS(null, 'style', "position: absolute; right: 0; transform: rotate(180deg)")
      this.rightButton = createSVG('polygon', this.rightButtonSvg)
      this.rightButton.setAttributeNS(null, 'points', height/3+","+height/2+" "+height/1.6+","+height/4+" "+height/1.6+","+(height - height/4)); this.rightButton.setAttributeNS(null, 'style', "stroke-width: 0;")

      this.input = createElement('input', this.elm)
      this.input.style.width = width - 2 * height + 'px';
      this.input.style.height = height + 'px';
      this.input.style.fontSize = height*0.6+'px'
      this.input.style.border = 'none'; this.input.style.backgroundColor = 'transparent'; this.input.style.textAlign = 'center'
      this.input.value = this.value.toFixed(this.decimals)

      this.input.addEventListener("change", this.onchange.bind(this), false);
      this.rightButtonSvg.addEventListener("mousedown", this.onright.bind(this), false);
      this.leftButtonSvg.addEventListener("mousedown", this.onleft.bind(this), false);

      if (this.id !== undefined) numInputIds[this.id] = this
   }
   update() {

   }
   onchange(e) {
      if (!isNaN(this.input.value)) {
         this.value = min(this.max, max(this.min, parseFloat(this.input.value)))
      }
      this.input.value = this.value.toFixed(this.decimals)
   }
   onright(e) {
      if (!isNaN(this.input.value)) {
         this.value = min(this.max, max(this.min, parseFloat(this.input.value)+this.step))
      }
      this.input.value = this.value.toFixed(this.decimals)
   }
   onleft(e) {
      if (!isNaN(this.input.value)) {
         this.value = min(this.max, max(this.min, parseFloat(this.input.value)-this.step))
      }
      this.input.value = this.value.toFixed(this.decimals)
   }
   resetVal() {
      this.value = this.default;
      this.input.value = this.value.toFixed(this.decimals)
   }
}

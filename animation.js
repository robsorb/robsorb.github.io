class Animation {
	constructor(elm) {
		this.elm = elm
		this.src = this.elm.getAttribute("animSrc")
		this.fps = parseFloat(this.elm.getAttribute("fps"))
		this.frame = 0
		this.maxFrames = parseFloat(this.elm.getAttribute("frames"))
		this.int = "0000"

      for (let frame = 1; frame < this.maxFrames+1; frame++) {
         var index = this.int.substring((frame+"").length) + frame
   		this.elm.setAttribute("src", this.src+index+".png")
      }

		setInterval(this.loop.bind(this), 1000/this.fps)
	}
	loop() {
		this.frame += 1
		if (this.frame > this.maxFrames) this.frame = 1

		var index = this.int.substring((this.frame+"").length) + this.frame
		this.elm.setAttribute("src", this.src+index+".png")
	}
}

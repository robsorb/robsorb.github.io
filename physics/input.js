class Mouse {
	constructor(element) {
		this.loc = Vec(0, 0)
		this.dloc = Vec(0, 0)
		this.left = false
		this.middle = false
		this.right = false
		this._loc = Vec(0, 0)

		if (element.addEventListener) {
			// IE9, Chrome, Safari, Opera
			element.addEventListener("mousewheel", this.onscroll.bind(this), false);

			// Firefox
			element.addEventListener("DOMMouseScroll", this.onscroll.bind(this), false);
		}
		// IE 6/7/8
		else element.attachEvent("onmousewheel", this.onscroll.bind(this));

		element.addEventListener("mousemove", this.onmove.bind(this), false);
		element.addEventListener("mousedown", this.ondown.bind(this), false);
		document.addEventListener("mouseup", this.onup.bind(this), false);
	}
	onmove(e) {
		this._loc = Vec(e.clientX, e.clientY).sub(Vec(document.getElementById("simCanvas").getBoundingClientRect().x, document.getElementById("simCanvas").getBoundingClientRect().y))
	}
	ondown(e) {
		switch (e.button) {
			case 0:
				this.left = true;
				var ic = selectedcam.internalcoords(this.loc)
				for (let o of sim.s.objects) {
					if (inside(transformverts(o.verts, o.loc, o.rot), ic)) {
						sim.s.mF.o = o
						sim.s.mF.loc = rotate(vecsub(ic, o.loc), -o.rot)
					}
				}
				for (let o of sim.s.lockedDemos) {
					o.prevLoc = selectedcam.internalcoords(this.loc)
				}

			break;
			case 1: this.middle = true; break;
			case 2: this.right = true; break;
		}
	}
	onup(e) {

		switch (e.button) {
			case 0:
				this.left = false;
				sim.s.mF.o = undefined
				for (let o of sim.s.lockedDemos) {
					o.prevLoc = undefined
				}
				break;
			case 1: this.middle = false; break;
			case 2: this.right = false; break;
		}
	}
	onscroll(e) {
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if (k.shift) s.selectednode.scale *= pow(1.1, -delta), s.selectednode.update()
		else selectedcam.scale *= pow(1.1, delta)
		e.preventDefault()
	}
	update() {
		this.dloc = vecsub(this.loc, this._loc)
		var loc_ = this.loc
		this.loc = this._loc

		if (this.left) {


		} if (this.middle) {
			if (k.control) {
				var s = (hyp(this.loc.x-selectedcam.g.canvas.width/2, this.loc.y-selectedcam.g.canvas.height/2)) / (hyp(loc_.x-selectedcam.g.canvas.width/2, loc_.y-selectedcam.g.canvas.height/2))
				selectedcam.scale *= s
			} else if (k.shift) {
				var a = (Math.atan2(this.loc.x-selectedcam.g.canvas.width/2, this.loc.y-selectedcam.g.canvas.height/2))-(Math.atan2(loc_.x-selectedcam.g.canvas.width/2, loc_.y-selectedcam.g.canvas.height/2))
				selectedcam.rot += a
			} else {
				selectedcam.loc = vecadd(selectedcam.loc, vecscale(1/selectedcam.scale, Vecp(this.dloc.r, this.dloc.a+selectedcam.rot)))
			}
		} if (this.right) {

		}
	}
}
class Keyboard {
	constructor(element) {
		document.onkeydown = function(e) {
			k.ondown(e)
		}
		document.onkeyup = function(e) {
			k.onup(e)
		}
	}
	ondown(e) {
		var key = e.key.toLowerCase()
		this[key] = true
		switch (key) {

		}
	}
	onup(e) {
		var key = e.key.toLowerCase()
		this[key] = false
	}
	update() {

	}
}

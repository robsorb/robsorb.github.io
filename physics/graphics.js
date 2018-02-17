function lightvec(intensity=1, az=0, ax=0) {
	return vecscale(intensity, Vec(cos(az), sin(az), sin(ax)))
}

class Camera {
	constructor(g, loc=Vec(0, 0), rot=0, scale=1) {
		this.g = g
		this.g.cameras.push(this)
		this.loc = loc
		this.rot = rot
		this.scale = scale
		this.plumes = {red:["orangered", "#ff8b00", "#ffc300"], yellow:["#ffc300", "#ffe200", "white"], blue:["#bfcdff", "#cfeeff", "white"], white:["rgb(210,210,210)", "rgb(230,230,230)", "white"]}
		this.focus = undefined
		this.center = Vec(this.g.canvas.width/2, this.g.canvas.height/2)
	}
	displaycoords(v) {
		var v2 = vecsub(vecscale(this.scale, v), vecscale(this.scale, this.loc))
		return vecadd(this.center, Vecp(v2.r, v2.a-this.rot))
	}
	internalcoords(v) {
			v = v.duplicate()
			v = vecsub(v, this.center)
			return vecadd(Vecp(v.r/this.scale, v.a-this.rot), this.loc)
	}
	tocam(kwargs) {
		if (kwargs.loc !== undefined) kwargs.loc = this.displaycoords(kwargs.loc)
		if (kwargs.rot !== undefined) kwargs.rot -= this.rot
		if (kwargs.scale !== undefined) kwargs.scale *= this.scale
		return kwargs
	}
	line(v1, v2, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		return this.g.line(v1, v2, this.tocam(kwargs))
	}
	polygon(v, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		return this.g.polygon(v, this.tocam(kwargs))
	}
	circle(r, kwargs={}, ctx=undefined) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), scale:1})
		return this.g.circle(r, this.tocam(kwargs), ctx)
	}
	ellipse(rx, ry, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		return this.g.ellipse(rx, ry, this.tocam(kwargs))
	}
	text(t, s, c, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, font:'Arial', alignment:'start'})
		this.g.text(t, s, c, this.tocam(kwargs))
	}
	measureText(t, s, c, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, font:'Arial', alignment:'start'})
		return this.g.measureText(t, s, c, this.tocam(kwargs))
	}
	image(src, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		this.g.image(src, this.tocam(kwargs))
	}
	vector(vec, t, c, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		this.g.vector(vec, t, c, this.tocam(kwargs))
	}
	rotation(r, t, c, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		this.g.rotation(r, t, c, this.tocam(kwargs))
	}
	cross(r, t, c, kwargs={}) {
		kwargs = Object.assign({}, kwargs)
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		this.g.cross(r, t, c, this.tocam(kwargs))
	}
}
class Graphics {
	constructor(canvas, fps) {
		this.canvas = canvas
		this.cameras = []
		this.fps = fps
		this.layers = []
		this.renderables = []

		this.backGroundColour = "rgb(255,255,255)"

		this.a = 0
		this.interval = setInterval(this.update.bind(this), 1000/this.fps)

		this.test1 = 0;
		this.test2 = 1;
	}
	delete() {
      window.clearInterval(this.interval);
   }
	update() {
		let ctx = this.canvas.getContext("2d");
		ctx.fillStyle = this.backGroundColour;
		ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
		if (this.camera !== undefined) if (this.camera.focus !== undefined) {
			this.camera.loc = this.camera.focus.loc
		}
		this.render()
	}
	layerappend(l, g) {
		while (this.layers.length-1 < l) {
			this.layers.push([])
		}
		this.layers[l].push(g)
	}
	render() {
		for (let r of this.renderables) {
			r.render()
		}
		for (let i = 0; i < this.layers.length; i++) {
			for (let g of this.layers[i]) {
				g.bind(this)()
			}
			this.layers[i] = []
		}

		//this.rotation(this.test1*this.test2, 15, "orange", {loc:Vec(300, 300)})
		this.test1 += this.test2
		if (this.test1 < 1 || this.test1 > 200) this.test2 *= -1
	}

	tolayer(o) {
		while (o.kwargs.layer > this.layers.length-1) {
			this.layers.push([])
		}
		this.layers[o.kwargs.layer].push(o)
	}
	create_camera(loc=Vec(0,0), rot=0, scale=1) {
		return new Camera(this, loc, rot, scale)
	}
	stroke(ctx, c='rgb(0,0,0)', w=1, segments=[]) {
		ctx.strokeStyle = c
		ctx.lineWidth = w
		ctx.setLineDash(segments)
		ctx.stroke()
	}
	fill(ctx, c='rgb(0, 0, 0)') {

		ctx.fillStyle = c
		ctx.fill()
	}
	line(v1, v2, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		var t1 = transform(v1, kwargs.loc, kwargs.rot, kwargs.scale)
		ctx.moveTo(t1.x, t1.y);
		var t2 = transform(v2, kwargs.loc, kwargs.rot, kwargs.scale)
		ctx.lineTo(t2.x,t2.y);
		return ctx
	}
	lines(v, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		for (let i of v) {
			var t = transform(i, kwargs.loc, kwargs.rot, kwargs.scale)
			ctx.lineTo(t.x, t.y);
		}
		return ctx
	}
	polygon(v, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		for (let i of v) {
			var t = transform(i, kwargs.loc, kwargs.rot, kwargs.scale)
			ctx.lineTo(t.x, t.y);
		}
		ctx.closePath();
		return ctx
	}
	circle(r, kwargs={}, ctx) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), scale:1, start:0, end:pi*2})
		if (ctx === undefined) {
			var ctx = this.canvas.getContext("2d");
			ctx.beginPath();
		}
		ctx.arc(kwargs.loc.x,kwargs.loc.y,parseInt((r*kwargs.scale)),kwargs.start,kwargs.end);
		//ctx.closePath();
		return ctx
	}
	ellipse(rx, ry, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, start:0, end:pi*2, counterclockwise:false})
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		ctx.ellipse(kwargs.loc.x, kwargs.loc.y, rx*kwargs.scale, ry*kwargs.scale, kwargs.rot, kwargs.start, kwargs.end, kwargs.counterclockwise);
		//ctx.closePath();
		return ctx
	}
	text(t, s, c, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, font:'Arial', alignment:'start'})
		var ctx = this.canvas.getContext("2d");
		ctx.save()
		ctx.fillStyle = c
		ctx.font = s*kwargs.scale+"px "+kwargs.font;
		ctx.textAlign = kwargs.alignment;
		ctx.rotate(kwargs.rot);
		var o = rec(kwargs.loc.r, kwargs.loc.a-kwargs.rot);
		ctx.fillText(t, o.x, o.y);
		ctx.restore();
	}
	measureText(t, s, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, font:'Arial', alignment:'start'})
		var ctx = this.canvas.getContext("2d");
		ctx.save()
		ctx.font = s*kwargs.scale+"px "+kwargs.font;
		var width = ctx.measureText(t)
		ctx.restore();
		return width
	}
	image(src, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})
		var ctx = this.canvas.getContext("2d");
		ctx.save()
		var image = new Image();
		image.src = src;
		ctx.rotate(kwargs.rot)
		var o = rec(kwargs.loc.r, kwargs.loc.a-kwargs.rot);
		ctx.drawImage(image, 0, 0, image.width, image.height, o.x, o.y, image.width*kwargs.scale, image.height*kwargs.scale);
		ctx.restore();
	}
	vector(vec, t, c, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, style:"triangular"})

		if (kwargs.style == "triangular") {
			this.fill(this.polygon([Vecp(t/kwargs.scale, vec.a-pi/2), Vecp(t/kwargs.scale, vec.a+pi/2), vec], kwargs), c)
		} else if (kwargs.style == "arrow") {
			var R = 1.3
			t = min(vec.r/(2*R)*kwargs.scale, t)
			this.fill(this.polygon(transformverts([Vec(-t*R*1.3/kwargs.scale, t*R/kwargs.scale), Vec(-t*R*1.3/kwargs.scale, -t*R/kwargs.scale), Vec(0, 0)], vec, vec.a, 1), kwargs), c)
			this.stroke(this.line(Vec(0, 0), Vecp(vec.r-t*R/2/kwargs.scale, vec.a), kwargs), c, t/1.5)
			this.fill(this.circle(t/kwargs.scale, kwargs), c)
		} else if (kwargs.style == "line") {
			this.stroke(this.line(Vec(0, 0), vec, kwargs), c, t/2)
			this.stroke(this.line(Vecp(t/kwargs.scale, vec.a+pi/2), Vecp(t/kwargs.scale, vec.a-pi/2), kwargs), c, t/2)
		}
	}
	rotation(r, t, c, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1})

		t = min(t/kwargs.scale, abs(r)/4)
		let a1 = pi/12
		let a2 = asin(t*1.5/abs(r))
		let g = -r/abs(r)
		this.fill(this.polygon([Vecp(r, g*a1 + pi/2), Vecp(r - t, g*(a1 + a2) + pi/2), Vecp(r + t, g*(a1 + a2) + pi/2)], kwargs), c)
		this.fill(this.polygon([Vecp(r, g*a1 - pi/2), Vecp(r - t, g*(a1 + a2) - pi/2), Vecp(r + t, g*(a1 + a2) - pi/2)], kwargs), c)
		this.stroke(this.circle(abs(r), {loc:kwargs.loc, rot:kwargs.rot, scale:kwargs.scale, start:pi/2 + a1+a2*0.8, end:-pi/2 - a1-a2*0.8}), c, t*kwargs.scale/1.5)
		this.stroke(this.circle(abs(r), {loc:kwargs.loc, rot:kwargs.rot, scale:kwargs.scale, start:pi/2 + a1+a2*0.8 + pi, end:-pi/2 - a1-a2*0.8 + pi}), c, t*kwargs.scale/1.5)
	}
	cross(r, t, c, kwargs={}) {
		kwargs = defaultkwargs(kwargs, {loc:Vec(0, 0), rot:0, scale:1, style:"triangular"})

		this.stroke(this.line(Vecp(r,pi/4), Vecp(-r,pi/4), kwargs), c, t)
		this.stroke(this.line(Vecp(r,pi/4+pi/2), Vecp(-r,pi/4+pi/2), kwargs), c, t)
	}

	Polygon(v, kwargs={}) {
		new Graphical(this, this.polygon(v, kwargs), kwargs)
	}
	Circle(r, kwargs={}) {
		new Graphical(this, this.circle(r, kwargs), kwargs)
	}
	Ellipse(rx, ry, kwargs={}) {
		new Graphical(this, this.ellipse(rx, ry, kwargs), kwargs)
	}
}

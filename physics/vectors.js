function hyp(x, y) {
	return Math.sqrt(x*x+y*y)
}
function pol(x, y) {
	return {r:hyp(x, y), a:Math.atan2(y, x)}
}
function rec(r, a) {
	return {x:r*Math.cos(a), y:r*Math.sin(a)}
}
function vecadd(a, b) {
	return Vec(a.x+b.x, a.y+b.y, a.z+b.z)
}
function vecsub(a, b) {
	return new Vec(a.x-b.x, a.y-b.y, a.z-b.z)
}
function vecscale(a, b) {
	if (typeof(a) == 'number') {
		return Vec(a*b.x, a*b.y, a*b.z)
	} else {
		return Vec(a.x*b, a.y*b, a.z*b)
	}
}
function vecdot(a, b) {
	if (typeof(a) == 'number') {
		r = rec(1, a)
		return r.x*b.x+r.y*b.y+r.z*b.z
	} else if (typeof(b) == 'number') {
		r = rec(1, b)
		return a.x*r.x+a.y*r.y+a.z*r.z
	} else {
		return a.x*b.x+a.y*b.y+a.z*b.z
	}
}
function veccross(a, b) {
	return Vec(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x)
}
function vecaverage(a, b) {
	return vecscale(0.5, vecadd(a, b))
}
function normalize(vec) {
	return vecscale(1/vec.r, vec)
}
function getAngle(v1, v2, v3=undefined) {

	if (v3 == undefined) {

		return v2.a-v1.a
	}
}
function component(vector, axis, n=true) {
	if (n) axis = normalize(axis)
	return vecdot(axis, vector)
}
function componentVector(vector, axis, n=true) {
	if (n) axis = normalize(axis)
	return vecscale(axis, vecdot(axis, vector), false)
}

function rotate(v1, a, v2=Vec(0,0)) {
	if (!v2) return Vecp(v1.r, v1.a+a)
	else {
		d = vecsub(v1, v2)
		return vecadd(Vecp(d.r, d.a+a), v2)
	}
}
function transform(v, loc, rot=0, scale=1) {
	return vecadd(vecscale(rotate(v, rot), scale), loc)
}
function transformverts(verts, loc, rot=0, scale=1) {
	var o = []
	for (let v of verts) {
		o.push(transform(v, loc, rot, scale))
	}
	return o
}

class Vector {
	constructor(x, y, z) {
		this.x = x
		this.y = y
		this.z = z

	}
	get a() {
		return Math.atan2(this.y, this.x)
	}
	get r() {
		return hyp(hyp(this.x, this.y), this.z)
	}
	duplicate() {
		return new Vec(this.x, this.y, this.z)
	}
	add(v) {
		return vecadd(this, v)
	}
	sub(v) {
		return vecsub(this, v)
	}
	scale(s) {
		return vecscale(this, s)
	}
	dot(v) {
		return vecdot(this, v)
	}
	cross(v) {
		return veccross(this, v)
	}
}
function Vec(x, y, z=0) {
	return new Vector(x, y, z)
}
function Vecp(r, a) {
	const c = rec(r, a)
	return new Vector(c.x, c.y, 0)
}

function lineToPoint(l1, l2, p) {
	let n = normalize(veccross(vecsub(l2, l1), Vec(0, 0, 1)));
	return vecscale(vecdot(vecsub(p, l1), n), n);
}
function eqPoly(n, r) {
	let verts = []
	for (let i = 0; i < n; i++) {
		verts.push(Vecp(r, 2*pi/n * (i+0.5)))
	}
	return verts
}

function distanceToLine(p, l1, l2) {
	return abs(veccross(vecsub(p, l1), normalize(vecsub(l2, l1))).z);
}
function normalizeAngle(a) {
	return 2*atan(tan(a/2))
}
function crossing(a, b, c, d) {

	ab = vecsub(b, a)
	ac = vecsub(c, a)
	ad = vecsub(d, a)
	bc = vecsub(c, b)
	cd = vecsub(d, c)

	return (veccross(ab, ac).z * veccross(ab, ad).z <= 0) && (veccross(cd, ac).z * veccross(cd, bc).z <= 0)
}
function intersection(a, b, c, d) {
	let ab = b.sub(a); let cd = d.sub(c)
	let abPar = componentVector(ab, cd)
	let abPerp = ab.sub(abPar)
	let al = lineToPoint(c, d, a).scale(-1)

	return a.add(al.add(abPar.scale(al.r / abPerp.r)))
}
function verts(l) {

   var list = l
   if (typeof(l) == 'number') list = Array.from(arguments)

   var verts = []
   for (let i = 0; i < list.length/2; i++) {
      verts.push(Vec(list[i*2], list[i*2+1]))
   }

   return verts
}
function cloneVerts(verts) {
	newVerts = []
	for (let v of verts) {
		newVerts.push(v.duplicate())
	}
	return newVerts
}
function getOrder(verts) {
	var j = 0;

	for (let i = 0; i < verts.length; i++) {
		if (verts[i].x < verts[j].x) j = i;
	}

	if (verts[bound(j-1, 0, verts.length-1)].y > verts[bound(j+1, 0, verts.length-1)].y) return -1
	else return 1
}
function getNormals(verts) {

	var normals = []
	var order = getOrder(verts)

	for (let i = 0; i < verts.length-1; i++) {
		normals.push(normalize(veccross(vecsub(verts[i], verts[i+1]), Vec(0, 0, order))))
	}
	normals.push(normalize(veccross(vecsub(verts[verts.length-1], verts[0]), Vec(0, 0, order))))

	return normals
}
function triangulate(verts) {
	newVerts = cloneVerts(verts)
	triangles = []
	i = 0
	let q = 0

	while (newVerts.length > 3 && q < 20) {

		//q++

		if (!bounded(newVerts, i, i+2)) {
			i++
		} else {
			triangles.push([indexBound(newVerts, i), indexBound(newVerts, i+1), indexBound(newVerts, i+2)])
			newVerts.splice(bound(i+1, 0, newVerts.length), 1)
		}
	}
	triangles.push([newVerts[0], newVerts[1], newVerts[2]])

	return triangles
}

function inside(verts, p) {
	ins = false

	for (let i = 0; i < verts.length; i++) {
		let a = indexBound(verts, i); let b = indexBound(verts, i+1)
		let n = veccross(vecsub(b, a), Vec(0, 0, 1))

		if (max(a.y, b.y) > p.y && min(a.y, b.y) <= p.y && lineToPoint(a, b, p).x > 0) ins = !ins
	}

	return ins
}
function vertsInside(verts1, verts2) {
	let verts = []
	for (let i = 0; i < verts2.length; i++) {
		if (inside(verts1, verts2[i])) {
			verts.push(i)
		}
	}
	return verts;
}
function bounded(verts, i, j) {
	i = bound(i, 0, verts.length); j = bound(j, 0, verts.length)
	let a = verts[i]; let b = verts[j]

	if (!inside(verts, vecaverage(a, b))) return false

	for (let k = 0; k < verts.length; k++) {
		index1 = bound(k, 0, verts.length); index2 = bound(k+1, 0, verts.length)
		let l1 = verts[index1]; let l2 = verts[index2]
		if (!(index1 == i || index1 == j || index2 == i || index2 == j) && crossing(a, b, l1, l2)) return false
	}

	return true
}
function selfIntersection(verts, i) {
	let intersections = []
	let a = indexBound(verts, i); let b = indexBound(verts, i+1)
	for (let k = 0; k < verts.length; k++) {
		index1 = bound(k, 0, verts.length); index2 = bound(k+1, 0, verts.length)
		let l1 = verts[index1]; let l2 = verts[index2]
		if (!(index1 == i || index2 == i || index1 == bound(i+1, 0, verts.length) || index2 == bound(i+1, 0, verts.length)) && crossing(a, b, l1, l2)) {
			intersections.push(intersection(a, b, l1, l2))
		}
	}
	return intersections
}

function triArea(a, b, c) {
	if (a.x != undefined) {
		let ac = vecsub(c, a); let ab = vecsub(b, a)
		return 0.5 * abs(veccross(ac, ab).z)
	} else return triArea(a[0], a[1], a[2])
}
function area(triangulated) {
	let area = 0;
	for (let t of triangulated) area += triArea(t)
	return area
}
function triCOM(a, b, c) {
	if (a.x != undefined) {
		return vecadd(a, vecscale(2/3, vecsub(vecaverage(b, c), a)))
	} else return triCOM(a[0], a[1], a[2])
}
function COM(triangulated) {
	var com = Vec(0,0), area = 0;
	for (let t of triangulated) {
		let tArea = triArea(t)
		com = vecadd(com, vecscale(tArea, triCOM(t))); area += tArea
	}
	return vecscale(1/area, com)
}
function triMOI(m, a, b, c) {
	if (a.x != undefined) {
		let p = b.sub(a); let q = c.sub(a); let com = triCOM(a, b, c).sub(a)

		return m/6 * (vecdot(p, p) + vecdot(p, q) + vecdot(q, q)) - m * vecdot(com, com)

	} else return triMOI(m, a[0], a[1], a[2])
}
function MOI(triangulated, mass, area, com) {
	var I = 0;
	var d = mass/area
	for (let t of triangulated) {
		let tM = d * triArea(t); let r = triCOM(t).sub(com); let tI = triMOI(tM,t);
		I += tI + vecdot(r, r) * tM;
	}
	return I
}

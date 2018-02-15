const {abs, min, max, ceil, floor, pow, sqrt, PI:pi, sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, asinh, acosh, atanh, log, random} = Math
const G = 6.67408e-11

function defaultkwargs(kwargs, dkwargs) {
	for (key in dkwargs) {
		if (kwargs[key] === undefined) kwargs[key] = dkwargs[key]
	}
	return kwargs
}
function deg(radians) {
	return radians * 180 / pi
}
function rad(degrees) {
  return degrees * pi / 180;
};
function round(x, n=0) {
	return Math.round(x*pow(10, n))/pow(10, n)
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
function bound(i, min, max) {
	var j = i % (max - min) + min
	if (j < min) return j + (max-min)
	else return j
}
function indexBound(list, i) {
	return list[bound(i, 0, list.length)]
}

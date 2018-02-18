parallaxList = []
hidableList = []
animationList = []
galleryList = []
correctorList = []
selectedcam = undefined

window.onload = function () {

   for (let elm of document.getElementsByClassName("hidable")) {
		hidableList.push(new Hidable(elm))
	}
   for (let elm of document.getElementsByClassName("animation")) {
		animationList.push(new Animation(elm))
	}
   for (let elm of document.getElementsByClassName("image_gallery")) {
		galleryList.push(new ImgGallery(elm))
	}
   for (let elm of document.getElementsByClassName("heightCorrect")) {
		correctorList.push(new HeightCorrect(elm))
	}
   for (let elm of document.getElementsByClassName('frame')) frames.push(new Frame(elm))

   initUI()

   simSettingsCheckbox = document.getElementById('simSettingsCheckbox')
	simGui = document.getElementById('simGui')
	if (!simSettingsCheckbox.checked && simGui.classList.contains('active')) simGui.classList.remove('active')
	else if (simSettingsCheckbox.checked && !simGui.classList.contains('active')) simGui.classList.add('active')

   navigation = new Navigation("navigation")

   parallax = new Parallax("head_parallax")

   var element = document.getElementById("simCanvas");
   mouse = new Mouse(element)
   k = new Keyboard(element)

   sim = new Simulation()

   resize()
}
function resize() {
   for (let parallax of parallaxList) {
      parallax.update()
   }
   for (let gallery of galleryList) {
      gallery.update()
   }
   for (let elm of correctorList) {
      elm.update()
   }
   for (let f of frames) f.update()

	width = document.getElementById("simCanvas").getBoundingClientRect().width;
	height = document.getElementById("simCanvas").getBoundingClientRect().height;
	document.getElementById("simCanvas").width = width;
	document.getElementById("simCanvas").height = height;
}

window.onresize = resize

window.onscroll = function(e) {
   for (let parallax of parallaxList) {
      parallax.onscroll(e)
   }
}

function floatToPx(float) {
   return parseInt(float) + "px"
}

function addClass(elm, className) {
   if (!elm.classList.contains(className)) {
      elm.className += " "+className
   }
}
function removeClass(elm, className) {
   elm.classList.remove(className)
}

function createChild(parent, type) {

 	var elm = document.createElement(type);

	parent.appendChild(elm)

	return elm
}
function createElement(type, parent) {

   var elm = document.createElement(type)
   elm.appendChild(document.createTextNode(""))

   if (parent != undefined) parent.appendChild(elm);

   return elm
}
function createSVG(type, parent) {

   var elm = document.createElementNS("http://www.w3.org/2000/svg", type);
   elm.appendChild(document.createTextNode(""))

   if (parent != undefined) parent.appendChild(elm);

   return elm
}
function toggleSimSettings(elm) {
	if (!elm.checked) simGui.classList.remove('active')
	else simGui.classList.add('active')
}
function resetSim() {
	selectedcam = undefined
	sim.delete()
	sim = new Simulation()
}

class HeightCorrect {
   constructor(elm) {
      this.elm = elm
      this.elmList = document.getElementsByClassName(this.elm.getAttribute("elementClass"))
      this.update()
   }
   update() {
      this.elm.style.position = "relative"
      this.elm.style.top = this.elmList[0].clientHeight+"px"
   }
}

poly = verts(-10, 20, 0, 0, 100, -50, 150, -40, 130, 80, 170, 100, 160, 120, 100, 80, 80, 120, 50, 110, 30, 80, 80, 40, 50, 10)
poly2 = verts(0,0, 200, -20, 150, 200, 150, 150, 50, 100, 100, 50)
poly3 = verts(0, 0, 10, 0, 10, 200, 0, 200)
poly4 = verts(0, 0, 100, 0, 100, 100, 0, 100)
poly5 = verts(0, 0, 300, 0, 300, 200, 0, 200, 150, 120)
poly6 = verts(0, 0, 100, 0, 120, 20, 130, 40, 130, 70, 80, 80, 90, 110, 0, 100)
poly7 = verts(-1200,-200, -1000, -200, -1000, 0, 1000, 0, 1000, -200, 1200, -200, 1200, 200, -1200, 200)

class Simulation {
	constructor() {
		this.g = new Graphics(document.getElementById("simCanvas"), 30)
		this.cam = this.g.create_camera(Vec(0, 20), 0, 0.5)
		this.s = new PhysicsSpace(this.g, 240, 1)

		this.rb = new RigidBody(this.s, poly6, Vec(0, -500), -pi/3, Vec(0, 0), 0, 1);
		this.rb = new RigidBody(this.s, verts(0, 0, 100, 0, 100, 300, 0, 300), Vec(0, -300), pi/2, Vec(0, 0), 0, 1);
		this.rb2 = new RigidBody(this.s, poly5, Vec(0, -15), pi/2, Vec(-0, -50), 0, 5);

		this.so = new StaticObject(this.s, poly7, Vec(0, 300), 0)

		selectedcam = this.cam
	}
	delete() {
		this.s.delete()
		this.g.delete()
		for (let i in this) {
			delete this[i]
			this[i] = undefined
		}
	}
}

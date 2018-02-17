function gToM(g, r) {
   return g * r**2 / G
}

class PhysicsSpace {

   constructor(g, fps, speed=1) {

      this.g = g
      this.fps = fps;
      this.speed = speed

      this.e = 0;
      this.kFriction = 0.5;

      this.objects = []
      this.planets = []
      this.demoObjects = []
      this.lockedDemos = []

      this.g.renderables.push(this)

      this.mF = {o:undefined, loc:undefined, scale:2}

      this.interval = setInterval(this.update.bind(this), 1000/this.fps)
   }

   update() {
      this.speed = numInputIds.simSpeedInput.value
      this.e = numInputIds.simBounceInput.value
      this.kFriction = numInputIds.simFrictionInput.value

      this.g.cameras[0].center = Vec(this.g.canvas.width/2, this.g.canvas.height/2)
      mouse.update()

      let ic = this.g.cameras[0].internalcoords(mouse.loc)
      //this.objects[0].loc = ic

      for (let object of this.demoObjects) object.loc = object._loc
      for (let object of this.objects) object.update()
   }

   render() {

      for (let object of this.objects) object.render()
   }

   dt() { return this.speed/this.fps }

   delete() {
      window.clearInterval(this.interval);
   }
}

class Physical {

   constructor (s) {
      this.s = s
      this.g = this.s.g

      this.s.objects.push(this)
   }

   update() {}
   render() {}
}

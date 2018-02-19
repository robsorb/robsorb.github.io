class RigidBody extends Physical {
   constructor(s, verts, loc, rot, vel, aVel, mass, rel=true) {

      super(s)

      this.movable = true;
      this.translationIterations = 5;

      this._verts = verts;
      this.loc = loc;
      this.rot = rot;
      this.vel = vel;
      this.aVel = aVel;
      this.mass = mass;

      this.normals = getNormals(this._verts)
      this._triangulated = triangulate(this._verts)
      this.COM = COM(this._triangulated)
      this.area = area(this._triangulated)
      this.I = MOI(this._triangulated, this.mass, this.area, this.COM)

      this.verts = []
      for (let v of this._verts) {
         this.verts.push(vecsub(v, this.COM))
      }
      this.triangulated = []
      for (let t of this._triangulated) {
         this.triangulated.push([vecsub(t[0], this.COM), vecsub(t[1], this.COM), vecsub(t[2], this.COM)])
      }
      if (!rel) this.loc = this.loc.add(this.COM)

      this.r = 0
      for (let v of this.verts) {
         this.r = max(v.r, this.r)
      }
      this.impulseTimer = 0;
      this.impulses = []
      this.friction = []
      for (let v of this.verts) {
         this.impulses.push(Vec(0, 0))
         this.friction.push(Vec(0, 0))
      }
      this.impulseTimer = 0;

      this.prevLoc = this.loc
      this.test = []
      this.path = []
   }

   globalVerts(i) {
      return transform(this.verts[bound(i, 0, this.verts.length)], this.loc, this.rot, 1)
   }

   update() {
      this.forces = []
      this.prevLoc = this.loc


      this.move()

      var ic = this.g.cameras[0].internalcoords(mouse.loc)
      if (this.s.mF.o === this) {
         this.applyForce(vecscale(vecsub(ic, transform(this.s.mF.loc, this.loc, this.rot)), this.s.mF.scale * numInputIds.simMouseForceInput.value), rotate(this.s.mF.loc, this.rot))
      }

      for (let object of this.s.objects) { if (object!=this) {
         // this.applyForce(normalize(this.loc.sub(object.loc)).scale(-500000*this.mass*object.mass/(this.loc.sub(object.loc).r**2)))
      }}
      this.vel = this.vel.add(Vec(0, numInputIds.simGravityInput.value).scale(this.s.dt()))

      this.collision()
   }

   move(t=1) {
      this.loc = this.loc.add(this.vel.scale(this.s.dt() * t))
      this.rot += this.aVel * this.s.dt() * t
   }
   applyForce(force, loc=Vec(0, 0), rel=true) {

      let a = force.scale(1 / this.mass)
      this.vel = this.vel.add(a.scale(this.s.dt()))

      let r = rel ? loc : vecsub(loc, this.loc)
      let torque = veccross(r, force).z
      this.aVel += torque / this.I * this.s.dt()
   }
   detectCollision() {
      for (let object of this.s.objects) {
         if (object != this) {
            let rAB = object.loc.sub(this.loc)
            if (rAB.r < this.r+object.r) {
               let globalVertsA = transformverts(this.verts, this.loc, this.rot); let globalVertsB = transformverts(object.verts, object.loc, object.rot)
               if (vertsInside(globalVertsB, globalVertsA) > 0) return true
            }
         }
      }
      return false
   }

   collision() {
      this.test = []
      this.test1 = undefined
      this.test2 = undefined
      this.path = []

      this.impulseTimer += 1/this.s.fps;
      if (this.impulseTimer > 0.3) {
         for (let i = 0; i < this.impulses.length; i++) this.impulses[i] = Vec(0, 0)
         for (let i = 0; i < this.friction.length; i++) this.friction[i] = Vec(0, 0)
         this.impulseTimer = 0;
      }

      let c = false
      for (let i = 0; i < 1; i++) {
         for (let object of this.s.objects) {
            if (object != this) {
               let rAB = object.loc.sub(this.loc)
               if (rAB.r < this.r+object.r) {
                  let rPrev = vecsub(this.prevLoc, object.prevLoc)
                  this.test2 = rPrev
                  this.impulseResolution(object, rPrev)
                  this.translationResolution(object, rPrev)
               }
            }
         }
      }
   }

   impulseResolution(object, rPrev) {
      let globalVertsA = transformverts(this.verts, this.loc, this.rot); let globalVertsB = transformverts(object.verts, object.loc, object.rot)
      if (vertsInside(globalVertsB, globalVertsA).length > 0) {
         for (let i = 0; i < this.impulses.length; i++) this.impulses[i] = Vec(0, 0)
         for (let i = 0; i < this.friction.length; i++) this.friction[i] = Vec(0, 0)
      }
      for (let n = 0; n < 1; n++) {
         let globalVertsA = transformverts(this.verts, this.loc, this.rot); let globalVertsB = transformverts(object.verts, object.loc, object.rot)
         let cVertsA = vertsInside(globalVertsB, globalVertsA); let cVertsB = vertsInside(globalVertsA, globalVertsB)
         if (cVertsA.length > 0) {
            this.collisionImpulse(object, rPrev, cVertsA, globalVertsA, globalVertsB)
         } if (cVertsB.length > 0) {
            object.collisionImpulse(this, rPrev.scale(-1), cVertsB, globalVertsB, globalVertsA)
         } else {
            break;
         }
      }
   }
   getImpulse(object, point, n, e = this.s.e) {
      let rAP = point.sub(this.loc); let rBP = point.sub(object.loc)
      let velAP = veccross(Vec(0, 0, this.aVel), rAP).add(this.vel); let velBP = veccross(Vec(0, 0, object.aVel), rBP).add(object.vel)
      let velAB = vecsub(velAP, velBP)

      if (this.movable && object.movable) {
         return n.scale(-min(0, (1 + e) * vecdot(velAB, n) / (1 / this.mass + 1 / object.mass + (veccross(rAP, n).z ** 2 / this.I) + (veccross(rBP, n).z ** 2 / object.I)) ))
      } else if (this.movable && !object.movable) {
         return n.scale(-min(0, (1 + e) * vecdot(velAB, n) / (1 / this.mass + (veccross(rAP, n).z ** 2 / this.I) )))
      } else if (!this.movable && object.movable) {
         return n.scale(-min(0, (1 + e) * vecdot(velAB, n) / (1 / this.mass + (veccross(rAP, n).z ** 2 / this.I) )))
      }
   }
   getFriction(object, point, n, normalForce, sFriction = this.s.sFriction, kFriction = this.s.kFriction) {
      let rAP = point.sub(this.loc); let rBP = point.sub(object.loc)
      let velAP = veccross(Vec(0, 0, this.aVel), rAP).add(this.vel); let velBP = veccross(Vec(0, 0, object.aVel), rBP).add(object.vel)
      let velAB = vecsub(velAP, velBP)
      let dir = n.cross(Vec(0, 0, 1))

      if (this.movable && object.movable) {
         var maxFriction = abs(vecdot(velAB, dir) / (1 / this.mass + 1 / object.mass + (veccross(rAP, dir).z ** 2 / this.I) + (veccross(rBP, dir).z ** 2 / object.I)))
      } else if (this.movable && !object.movable) {
         var maxFriction =  abs(vecdot(velAB, dir) / (1 / this.mass + (veccross(rAP, dir).z ** 2 / this.I) ))
      } else if (!this.movable && object.movable) {
         var maxFriction =  abs(vecdot(velAB, dir) / (1 / this.mass + (veccross(rAP, dir).z ** 2 / this.I) ))
      }
      let friction = (maxFriction > sFriction * normalForce) ? min(abs(maxFriction), kFriction * normalForce) : abs(maxFriction)

      return normalize(dir.scale(-vecdot(velAB, dir))).scale(friction)
   }
   collisionImpulse(object, rPrev, cVerts, globalVertsA, globalVertsB) {
      let edges = []
      let distance = 0
      let col = false
      for (let i of cVerts) {
         let edge = this.findEdge(i, object, rPrev, globalVertsA, globalVertsB)
         if (edge != undefined) {
            edges.push({edge:edge, vert:i})
            distance += distanceToLine(globalVertsA[i], indexBound(globalVertsB, edge), indexBound(globalVertsB, edge+1))
            col = true;
         }
      }
      let normalForces = []
      if (col) {
         let dVelA = Vec(0, 0); let dVelB = Vec(0, 0)
         let dAvelA = 0; let dAvelB = 0

         for (let k = 0; k < edges.length; k++) {
            let edge = edges[k].edge; let i = edges[k].vert
            let n = rotate(object.normals[edge], object.rot)
            let point = globalVertsA[i]

            let rAP = point.sub(this.loc); let rBP = point.sub(object.loc)

            let j = this.getImpulse(object, point, n).scale(distanceToLine(point, indexBound(globalVertsB, edge), indexBound(globalVertsB, edge+1)) / distance)

            this.impulses[i] = this.impulses[i].add(j)
            normalForces.push(j)

            if (this.movable) dVelA = dVelA.add(j.scale(1/this.mass)); dAvelA += veccross(rAP, j).z / this.I
            if (object.movable) dVelB = dVelB.add(j.scale(-1/object.mass)); dAvelB += -veccross(rBP, j).z / object.I
         }
         this.applyImpulse(object, dVelA, dAvelA, dVelB, dAvelB)
         if (col) {
            let dVelA = Vec(0, 0); let dVelB = Vec(0, 0)
            let dAvelA = 0; let dAvelB = 0

            for (let k = 0; k < edges.length; k++) {
               let edge = edges[k].edge; let i = edges[k].vert; let normalForce = normalForces[k]
               let n = rotate(object.normals[edge], object.rot)
               let point = globalVertsA[i]

               let rAP = point.sub(this.loc); let rBP = point.sub(object.loc)

               let friction = this.getFriction(object, point, n, normalForce.r).scale(distanceToLine(point, indexBound(globalVertsB, edge), indexBound(globalVertsB, edge+1)) / distance)

               this.friction[i] = this.friction[i].add(friction);

               if (this.movable) dVelA = dVelA.add(friction.scale(1/this.mass)); dAvelA += veccross(rAP, friction).z / this.I
               if (object.movable) dVelB = dVelB.add(friction.scale(-1/object.mass)); dAvelB += -veccross(rBP, friction).z / object.I
            }
            this.applyImpulse(object, dVelA, dAvelA, dVelB, dAvelB)
         }
      }
   }
   applyImpulse(object, dVelA, dAvelA, dVelB, dAvelB) {
      this.move(-1); object.move(-1)

      if (this.movable) { this.vel = this.vel.add(dVelA); this.aVel += dAvelA }
      if (object.movable) { object.vel = object.vel.add(dVelB); object.aVel += dAvelB }

      this.move(1); object.move(1)
   }

   translationResolution(object, rPrev) {
      let c = false;
      for (let n = 0; n < this.translationIterations; n++) {
         this.path.push(this.loc)

         let globalVertsA = transformverts(this.verts, this.loc, this.rot); let globalVertsB = transformverts(object.verts, object.loc, object.rot)
         let cVertsA = vertsInside(globalVertsB, globalVertsA)
         let cVertsB = vertsInside(globalVertsA, globalVertsB)

         if (cVertsA.length > 0 || cVertsB.length > 0) {
            c = true;

            let translationA = this.vertTranslation(object, rPrev, cVertsA, globalVertsA, globalVertsB)
            let translationB = object.vertTranslation(this, rPrev.scale(-1), cVertsB, globalVertsB, globalVertsA)
            let translation = this.getFinalTranslation(object, translationA, translationB, rPrev)
            this.applyTranslation(object, translation)
         } else {
            let cEdges = {A:[], B:[]}
            for (let i = 0; i < globalVertsA.length; i++) {
               for (let j = 0; j < globalVertsB.length; j++) {
                  if (crossing(indexBound(globalVertsA, i), indexBound(globalVertsA, i+1), indexBound(globalVertsB, j), indexBound(globalVertsB, j+1))) {
                     c = true
                     cEdges.A.push(i); cEdges.B.push(j)
                  }
               }
            }
            if (cEdges.A.length > 0) {
               let cVerts = this.cEdgesToCVerts(object, rPrev, cEdges, globalVertsA, globalVertsB)
               let translationA = this.vertTranslation(object, rPrev, cVerts.A, globalVertsA, globalVertsB)
               let translationB = object.vertTranslation(this, rPrev.scale(-1), cVerts.B, globalVertsB, globalVertsA)
               let translation = this.getFinalTranslation(object, translationA, translationB, rPrev)
               this.applyTranslation(object, translation)
            }
         }

         this.path.push(this.loc)
         if (!c) break
      }
   }
   findEdge(i, object, rPrev, globalVertsA, globalVertsB) {
      let minI = undefined;
      let r = vecsub(this.loc, object.loc)
      for (let j = 0; j < globalVertsB.length; j++) {
         let distance = lineToPoint(indexBound(globalVertsB, j), indexBound(globalVertsB, j+1), globalVertsA[i])
         let normal = rotate(object.normals[j], object.rot)

         if (vecdot(normal, distance) < 0 && (vecdot(vecsub(indexBound(globalVertsA, i+1), globalVertsA[i]), distance) <= 0.1 && vecdot(vecsub(indexBound(globalVertsA, i-1), globalVertsA[i]), distance) <= 0.1)  /*(vecdot(rotate(indexBound(this.normals, i), this.rot), distance) >= 0 && vecdot(rotate(indexBound(this.normals, i-1), this.rot), distance) >= 0)*/) {
            if (minI == undefined || vecsub(r.sub(distance), rPrev).r < vecsub(r.sub(lineToPoint(indexBound(globalVertsB, minI), indexBound(globalVertsB, minI+1), globalVertsA[i])), rPrev).r/*distance.r < distanceToLine(globalVertsA[i], indexBound(globalVertsB, minI), indexBound(globalVertsB, minI+1))*/) {
               minI = j;
            }
         }
      }
      return minI
   }
   cEdgesToCVerts(object, rPrev, cEdges, globalVertsA, globalVertsB) {
      let cVertsA = []
      for (let l of cEdges.A) {
         cVertsA.push(l); cVertsA.push(bound(l+1, 0, cEdges.A.length))
      }
      let cVertsB = []
      for (let l of cEdges.B) {
         cVertsB.push(l); cVertsB.push(bound(l+1, 0, cEdges.B.length))
      }
      return {A:cVertsA, B:cVertsB}
   }
   vertTranslation(object, rPrev, cVerts, globalVertsA, globalVertsB) {
      let distances = []
      for (let i of cVerts) {
         let edge = this.findEdge(i, object, rPrev, globalVertsA, globalVertsB)
         if (edge != undefined) {
            this.test.push({p:i, d:lineToPoint(indexBound(globalVertsB, edge), indexBound(globalVertsB, edge+1), globalVertsA[i]).scale(-1)})
            distances.push(lineToPoint(indexBound(globalVertsB, edge), indexBound(globalVertsB, edge+1), globalVertsA[i]).scale(-1))
         }
      }
      let maxI = undefined;
      let r = vecsub(this.loc, object.loc)
      for (let i = 0; i < distances.length; i++) {
         if (maxI == undefined || vecsub(r.add(distances[i]), rPrev).r < vecsub(r.add(distances[maxI]), rPrev).r/*distances[i].r < distances[maxI].r*/) {
            maxI = i
         }
      }
      if (maxI != undefined) {
         this.test1 = {p:maxI, d:distances[maxI]}
         let translation = distances[maxI].add(normalize(distances[maxI]).scale(0.001))

         return translation
      }
   }
   getFinalTranslation(object, translationA, translationB, rPrev) {
      let r = vecsub(this.loc, object.loc)
      let translation = Vec(0, 0)
      if (translationB === undefined) {
         translation = translationA
      } else if (translationA === undefined) {
         translation = translationB.scale(-1)
      } else {
         if (vecsub(r.add(translationA), rPrev).r < vecsub(r.add(translationB.scale(-1)), rPrev).r) {
            translation = translationA
         } else {
            translation = translationB.scale(-1)
         }
      }
      return translation
   }
   applyTranslation(object, translation) {
      if (this.movable && object.movable) {
         this.loc = this.loc.add(translation.scale(object.mass/(this.mass + object.mass)))
         object.loc = object.loc.add(translation.scale(-this.mass/(this.mass + object.mass)))
      } else if (this.movable && !object.movable) {
         this.loc = this.loc.add(translation)
      } else if (!this.movable && object.movable) {
         object.loc = object.loc.sub(translation)
      }
   }

   drawTris(triColor="lightgray") {
      for (let t of this.triangulated) {
         this.g.stroke(this.g.cameras[0].polygon(t, {loc:this.loc, rot:this.rot}), triColor, 1)
         this.g.cameras[0].cross(5, 1, triColor, {loc:transform(triCOM(t), this.loc, this.rot), rot:this.rot, scale:1/this.g.cameras[0].scale})
      }
   }
   render() {
      let mainColor = 'gray'; let normalColors = 'black'; let triColor = 'lightgray'; let radiusColor = 'rgb(255, 200, 200)'; let textColor = 'black'
      let mouseForceColor = 'rgb(120, 120, 255)';
      let velocityColor = 'rgb(100, 200, 100)';
      let impulseColor = 'rgb(255,200,0)'; let frictionColor = 'rgb(255,100,100)'
      let fontSize = 10;

      this.g.stroke(this.g.cameras[0].polygon(this.verts, {loc:this.loc, rot:this.rot}), mainColor, 1)

      if (document.getElementById('radius'+'Checkbox').checked) this.g.stroke(this.g.cameras[0].circle(this.r, {loc:this.loc, rot:this.rot}), radiusColor, 1, [10, 10])
      if (document.getElementById('trisCheckbox').checked) this.drawTris(triColor)

      if (document.getElementById('normals'+'Checkbox').checked) {
         for (let i = 0; i < this.normals.length; i++) {
            var c = vecaverage(this.globalVerts(i), this.globalVerts(i+1))
            this.g.cameras[0].vector(this.normals[i], 3, normalColors, {loc:c, rot:this.rot, scale:10/this.g.cameras[0].scale, style:"line"})
         }
      }

      if (this.s.mF.o === this) {
         var ic = this.g.cameras[0].internalcoords(mouse.loc)
         this.g.cameras[0].vector(vecsub(ic, transform(this.s.mF.loc, this.loc, this.rot)), 3, mouseForceColor, {loc:transform(this.s.mF.loc, this.loc, this.rot), style:"arrow"})
      }


      if (document.getElementById('impulses'+'Checkbox').checked) {
         for (let i = 0; i < this.impulses.length; i++) {
            this.g.cameras[0].vector(this.impulses[i], 2, impulseColor, {loc:this.globalVerts(i), scale:10, style:"arrow"})
         }
      }
      if (document.getElementById('friction'+'Checkbox').checked) {
         for (let i = 0; i < this.friction.length; i++) {
            this.g.cameras[0].vector(this.friction[i], 2, frictionColor, {loc:this.globalVerts(i), scale:10, style:"arrow"})
         }
      }

      if (document.getElementById('velocity'+'Checkbox').checked) this.g.cameras[0].vector(this.vel, 3, velocityColor, {loc:this.loc, scale:1, style:"arrow"})
      if (document.getElementById('angularVelocity'+'Checkbox').checked) this.g.cameras[0].rotation(this.aVel * 0.2, 5, velocityColor, {loc:this.loc, scale:1, style:"arrow"})
      if (document.getElementById('COM'+'Checkbox').checked) this.g.cameras[0].cross(8, 2, mainColor, {loc:this.loc, scale:1/this.g.cameras[0].scale})

      // let textWidth = max(this.g.measureText("m: "+this.mass.toFixed(2), 10).width, this.g.measureText("I: "+round(this.I), 10).width)
      // let textHeight = 10;
      // let border = 5;
      // let width = textWidth + border; let height = textHeight + border

      // this.g.fill(this.g.cameras[0].polygon(verts(-width/2,-height, width/2,-height, width/2,height, -width/2,height), {scale:1/this.g.cameras[0].scale, loc:this.loc.add(Vec(0, (26-textHeight/2)/this.g.cameras[0].scale))}), 'rgba(255,255,255,1)')

      if (document.getElementById('mass'+'Checkbox').checked) this.g.cameras[0].text("m: "+this.mass.toFixed(2), fontSize/this.g.cameras[0].scale, textColor, {loc: this.loc.add(Vec(0, fontSize*2/this.g.cameras[0].scale)), alignment:'center'})
      if (document.getElementById('MOI'+'Checkbox').checked && document.getElementById('mass'+'Checkbox').checked) this.g.cameras[0].text("I: "+round(this.I), fontSize/this.g.cameras[0].scale, textColor, {loc: this.loc.add(Vec(0, fontSize*3/this.g.cameras[0].scale)), alignment:'center'})
      else if (document.getElementById('MOI'+'Checkbox').checked) this.g.cameras[0].text("I: "+round(this.I), fontSize/this.g.cameras[0].scale, textColor, {loc: this.loc.add(Vec(0, fontSize*2/this.g.cameras[0].scale)), alignment:'center'})

      if (document.getElementById('vertNum'+'Checkbox').checked) {
         for (let i = 0; i < this.verts.length; i++) {
            let text = i+1
            let r = ((max(this.g.measureText(text, fontSize).width, fontSize))/2+2)/this.g.cameras[0].scale
            let n1 = rotate(this.normals[i], this.rot); let n2 = rotate(indexBound(this.normals, i-1), this.rot)
            let d = normalize(vecaverage(n1, n2)).scale(r)
            this.g.cameras[0].text(text, fontSize/this.g.cameras[0].scale, mainColor, {loc: this.globalVerts(i).add(Vec(0, fontSize/2/this.g.cameras[0].scale)).add(d), alignment:'center'})
         }
      }
   }
}

class StaticObject extends RigidBody {
   constructor(s, verts, loc, rot) {
      super(s, verts, loc, rot, Vec(0, 0), 0, 1)
      this.movable = false
   }
   move(t=1) {}
   update() {
      this.collision()
   }

   render() {
      let mainColor = 'gray'; let normalColors = 'black'; let triColor = 'lightgray'; let radiusColor = 'rgb(255, 200, 200)'
      let mouseForceColor = 'rgb(120, 120, 255)';
      let velocityColor = 'rgb(100, 200, 100)';
      let impulseColor = 'rgb(255,200,0)'; let frictionColor = 'rgb(255,100,100)'

      this.g.stroke(this.g.cameras[0].polygon(this.verts, {loc:this.loc, rot:this.rot}), mainColor, 1)

      if (document.getElementById('radiusCheckbox').checked) this.g.stroke(this.g.cameras[0].circle(this.r, {loc:this.loc, rot:this.rot}), radiusColor, 1, [10, 10])
      if (document.getElementById('trisCheckbox').checked) this.drawTris(triColor)

      if (document.getElementById('normals'+'Checkbox').checked) {
         for (let i = 0; i < this.normals.length; i++) {
            var c = vecaverage(this.globalVerts(i), this.globalVerts(i+1))
            this.g.cameras[0].vector(this.normals[i], 3, normalColors, {loc:c, rot:this.rot, scale:10/this.g.cameras[0].scale, style:"line"})
         }
      }

      if (document.getElementById('impulses'+'Checkbox').checked) {
         for (let i = 0; i < this.impulses.length; i++) {
            this.g.cameras[0].vector(this.impulses[i], 2, impulseColor, {loc:this.globalVerts(i), scale:10, style:"arrow"})
         }
      }
      if (true) {
         for (let i = 0; i < this.friction.length; i++) {
            this.g.cameras[0].vector(this.friction[i], 2, frictionColor, {loc:this.globalVerts(i), scale:10, style:"arrow"})
         }
      }

      if (document.getElementById('COM'+'Checkbox').checked) this.g.cameras[0].cross(8, 2, mainColor, {loc:this.loc, scale:1/this.g.cameras[0].scale})
   }
}

'use strict'
module.exports = Universe

function Universe (opt) {
  if (!opt) opt = {}
  this.objects = []
  this.controller = opt.controller
  this.width = opt.width
  this.height = opt.height
}

Universe.prototype = {}

Universe.prototype.updatePosition = function (obj) {
  if (this.isOOBX(obj.x) || this.isOOBY(obj.y)) {
    throw new Error('Universe bounds violation ' + obj.inspect() +
      ' must be within 0,0 → ' + this.width + ',' + this.height)
  }
  this.objectsAt(obj.x, obj.y).forEach(function (otherObj) {
    if (otherObj === obj) return
    if (obj.destroyed) return
    obj.collidesWith(otherObj)
    otherObj.collidesWith(obj)
  })
}

Universe.prototype.isOOBX = function (xx) {
  return (xx < 0) || (xx > this.width)
}

Universe.prototype.isOOBY = function (yy) {
  return (yy < 0) || (yy > this.height)
}

Universe.translateX = Universe.prototype.translateX = function (xx) {
  return (xx / 2) ^ 0
}

Universe.translateY = Universe.prototype.translateY = function (yy) {
  return yy
}

Universe.prototype.objectsAt = function (xx, yy) {
  var result = []
  for (var ii = 0; ii < this.objects.length; ++ii) {
    if (this.objects[ii].x === xx && this.objects[ii].y === yy) {
      result.push(this.objects[ii])
    }
  }
  return result
}

Universe.prototype.moveObjects = function (now) {
  for (var ii = 0; ii < this.objects.length; ++ii) {
    if (this.objects[ii].destroyed) continue
    if (this.objects[ii].move) this.objects[ii].move(now)
  }
}

Universe.prototype.add = function (obj) {
  this.objects.unshift(obj)
  return obj
}

Universe.prototype.forAllObjects = function (cb) {
  this.objects.forEach(cb)
}

Universe.prototype.remove = function (obj) {
  this.objects = this.objects.filter(function (otherObj) { return otherObj !== obj })
}

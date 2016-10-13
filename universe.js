'use strict'
module.exports = Universe
var Player = require('./player.js')
var Adversary = require('./adversary.js')
var Ouch = require('./ouch.js')
var Shot = require('./shot.js')
var PlayField = require('./play-field.js')
var MersenneTwister = require('mersenne-twister')

function Universe (screen, seed) {
  this.playField = new PlayField(screen)
  this.movingObjects = []
  this.staticObjects = []
  this.warnings = []
  this.initLocations()

  this.objectOnMove = this._onMove()
  this.objectOnDestroy = this._onDestroy()
  this.refresh = false
  this.rng = new MersenneTwister(seed)
}

Universe.prototype = {}

Universe.prototype.initLocations = function () {
  this.locations = new Array((this.playField.maxX/2)^0 + 1)
  for (var ii = 0; ii < this.locations.length; ++ii) {
    this.locations[ii] = new Array((this.playField.maxY/2)^0 + 1)
  }
}

Universe.prototype.validate = function () {
  var self = this
  self.movingObjects.concat(self.staticObjects).forEach(function (obj) {
    var locObj = self.locations[obj.x][obj.y]
    if (locObj !== obj) {
      self.warn('Validate Object Failure: ' + obj.x + ',' + obj.y, obj, '!==', locObj)
process.exit()
    }
  })
  self.locations.forEach(function (col, xx) {
    col.forEach(function (locObj, yy) {
      if (!locObj) { return }
      if (locObj.x !== xx || locObj.y !== yy) {
        self.warn('Validate Location Failure: ' + xx + ',' + yy, 'contains', locObj, 'which thinks its at', locObj.x + ',' + locObj.y)
process.exit()
      }
    })
  })
}

Universe.prototype.warn = function () {
  this.warnings.push(Array.prototype.slice.call(arguments))
}

Universe.prototype.add = function (obj) {
//  this.warn('Adding', obj)
  if (obj.move) {
    this.movingObjects.push(obj)
  } else {
    this.staticObjects.push(obj)
  }
  if (obj.x != null && obj.y != null) {
    this.locations[obj.x][obj.y] = obj
  }
  obj.on('moved', this.objectOnMove)
  obj.once('destroy', this.objectOnDestroy)
  this.playField.add(obj)
  this.refresh = true
  return obj
}

Universe.prototype.destroy = function (where) {
  var uni = this
  uni.staticObjects = uni.staticObjects.filter(destroyObjects)
  uni.movingObjects = uni.movingObjects.filter(destroyObjects)

  function destroyObjects (obj) {
    if (where && !where(obj)) return true
    if (obj.x != null && obj.y != null) {
      uni.locations[obj.x][obj.y] = undefined
    }
    obj.removeAllListeners('moved')
    obj.removeAllListeners('destroy')
    uni.playField.remove(obj)
    obj.destroy()
    return false
  }
  uni.refresh = true
}

Universe.prototype.remove = function (obj) {
  if (obj.x != null && obj.y != null) {
    this.locations[obj.x][obj.y] = undefined
  }
  obj.removeListener('moved', this.objectOnMove)
  obj.removeListener('destroy', this.objectOnDestroy)
  this.playField.remove(obj)
  var self = this
  if (self.move) {
    this.movingObjects = this.movingObjects.filter(function (obj) { return self !== obj })
  } else {
    this.staticObjects = this.staticObjects.filter(function (obj) { return self !== obj })
  }
  this.refresh = true
}

Universe.prototype._onMove = function () {
  var uni = this
  return function (oldX, oldY, newX, newY) {
    if (!uni.locations[newX]) {
      uni.locations[newX] = new Array(uni.playField.maxY + 1)
//      uni.warn('Missing', newX, 'when moving')
    }
    var oldObj = uni.locations[newX][newY]
    if (oldObj && this !== oldObj) {
      this.collidesWith(oldObj)
      oldObj.collidesWith(this)
      if (this.destroyed) return
    }
    if (oldX != null && oldY != null) uni.locations[oldX][oldY] = undefined
    uni.locations[newX][newY] = this
  }
}

Universe.prototype._onDestroy = function () {
  var uni = this
  return function () {
//    uni.warn('destroy', this)
    uni.remove(this)
  }
}

Universe.prototype.newPlayer = function (icon, startX, startY, hspeed, vspeed) {
  return this.add(new Player({universe: this, icon: icon, x: startX, y: startY, hspeed: hspeed, vspeed: vspeed}))
}

Universe.prototype.newAdversary = function (icon, startX, startY, hspeed, vspeed) {
  return this.add(new Adversary({universe: this, icon: icon, x: startX, y: startY, hspeed: hspeed, vspeed: vspeed}))
}

Universe.prototype.newOuch = function (icon, startX, startY) {
  return this.add(new Ouch({universe: this, icon: icon, x: startX, y: startY}))
}

Universe.prototype.newShot = function (icons, shotBy) {
  return this.add(new Shot({universe: this, icons: icons, shotBy: shotBy}))
}

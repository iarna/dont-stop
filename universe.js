'use strict'
module.exports = Universe
var Player = require('./player.js')
var Adversary = require('./adversary.js')
var Ouch = require('./ouch.js')
var Shot = require('./shot.js')
var PlayField = require('./play-field.js')

function Universe (screen) {
  this.playField = new PlayField(screen)
  this.movingObjects = []
  this.warnings = []
  this.locations = new Array(this.playField.maxX + 1)
  for (var ii = 0; ii <= this.playField.maxX; ++ii) {
    this.locations[ii] = new Array(this.playField.maxY + 1)
  }

  this.objectOnMove = this._onMove()
  this.objectOnDestroy = this._onDestroy()
}

Universe.prototype = {}

Universe.prototype.warn = function () {
  this.warnings.push(Array.prototype.slice.call(arguments))
}

Universe.prototype.add = function (obj) {
  this.warn('Adding', obj)
  if (obj.refresh) this.movingObjects.push(obj)
  if (obj.x != null && obj.y != null) {
    this.locations[obj.x][obj.y] = obj
  }
  obj.on('moved', this.objectOnMove)
  obj.once('destroy', this.objectOnDestroy)
  this.playField.add(obj)
  return obj
}

Universe.prototype.forEach = function (cb) {
  this.movingObjects.forEach(cb)
}

Universe.prototype._onMove = function () {
  var uni = this
  return function (oldX, oldY, newX, newY) {
    if (!uni.locations[newX]) {
      uni.locations[newX] = new Array(uni.playField.maxY + 1)
      uni.warn('Missing', newX, 'when moving')
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
    uni.warn('destroy', this)
    if (this.x != null && this.y != null) {
      uni.locations[this.x][this.y] = undefined
    }
    this.removeListener('moved', uni.objectOnMove)
    var self = this
    uni.movingObjects = uni.movingObjects.filter(function (obj) { return self !== obj })
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

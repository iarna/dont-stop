'use strict'
module.exports = Control
var Universe = require('./universe.js')
var Display = require('./display.js')
var MersenneTwister = require('mersenne-twister')
var Player = require('./player.js')
var Ouch = require('./ouch.js')
var Shot = require('./shot.js')
var Adversary = require('./adversary.js')

function Control (fps, seed) {
  this.fps = fps
  this.rng = new MersenneTwister(seed)
  this.display = new Display(this)
  this.universe = new Universe({
    controller: this,
    width: Universe.translateX(this.display.playScreen.width),
    height: Universe.translateY(this.display.playScreen.height)
  })
  this.refresh = this._refresh()
  this.needsRefresh = false
  this.statusGenerator = null
  this.refreshInterval = null
  this.ouches = 0
  this.warnings = []
}
Control.prototype = {}

Control.prototype.destroy = function () {
  this.display.destroy()
}

Control.prototype.warn = function () {
  this.warnings.push(Array.prototype.slice.call(arguments))
}

Control.prototype.random = function (max) {
  return (this.rng.random() * max) ^ 0
}

Control.prototype.add = function (obj) {
  this.universe.add(obj)
  this.display.add(obj)
  this.requestRefresh()
  return obj
}

Control.prototype.remove = function (obj) {
  this.display.remove(obj)
  this.universe.remove(obj)
  obj.destroy()
  this.requestRefresh()
  return obj
}

Control.prototype.forAllObjects = function (cb) {
  return this.universe.forAllObjects(cb)
}

Control.prototype.objectsAt = function (xx, yy) {
  return this.universe.objectsAt(xx, yy)
}

Control.prototype.updatePosition = function (obj) {
  this.universe.updatePosition(obj)
  this.display.updatePosition(obj)
  this.requestRefresh()
}

Control.prototype.updateIcon = function (obj) {
  this.display.updateIcon(obj)
  this.requestRefresh()
}

Control.prototype.updateStyle = function (obj) {
  this.display.updateStyle(obj)
  this.requestRefresh()
}

Control.prototype.start = function () {
  this.display.refresh()

  this.refreshInterval = setInterval(this.refresh, Math.floor(1000 / this.fps))
}

Control.prototype.stop = function () {
  clearInterval(this.refreshInterval)
}

Control.prototype.status = function (generator) {
  this.statusGenerator = generator
}

Control.prototype.requestRefresh = function () {
  this.needsRefresh = true
}

Control.prototype.isOOBY = function (yy) {
  return this.universe.isOOBY(yy)
}

Control.prototype.isOOBX = function (xx) {
  return this.universe.isOOBX(xx)
}

Control.prototype._refresh = function () {
  var self = this
  return function refresh () {
    var now = Date.now()
    self.universe.moveObjects(Date.now())
    if (!self.needsRefresh) return
    self.needsRefresh = false
    if (self.statusGenerator) self.display.setStatus(self.statusGenerator())
    self.display.refresh()
  }
}

Control.prototype.newPlayer = function (icon, startX, startY, speed) {
  return this.add(new Player({controller: this, icon: icon, x: startX, y: startY, speed: speed}))
}

Control.prototype.newAdversary = function (icon, startX, startY, speed, player) {
  return this.add(new Adversary({controller: this, icon: icon, x: startX, y: startY, speed: speed, player}))
}

Control.prototype.newOuch = function (icon, startX, startY) {
  return this.add(new Ouch({controller: this, icon: icon, x: startX, y: startY}))
}

Control.prototype.newShot = function (shotBy, icons) {
  return this.add(new Shot({controller: this, icons: icons, shotBy: shotBy}))
}

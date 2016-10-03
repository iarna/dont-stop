'use strict'
module.exports = Shot
var Moveable = require('./moveable.js')
var Healthy = require('./healthy.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Shot (opt) {
  var hspeed = opt.shotBy.hspeed * 2
  var vspeed = opt.shotBy.vspeed * 2
  var xx = opt.shotBy.x
  var yy = opt.shotBy.y
  if (opt.shotBy.direction === 'up') {
    --yy
  } else if (opt.shotBy.direction === 'down') {
    ++yy
  } else if (opt.shotBy.direction === 'left') {
    --xx
  } else if (opt.shotBy.direction === 'right') {
    ++xx
  }
  Moveable.call(this, {universe: opt.universe, icon: ' ', x: xx, y: yy, hspeed: hspeed, vspeed: vspeed})
  Healthy.call(this, {health: opt.health || 1})
  Hurty.call(this, {damage: opt.damage || 1})

  this.icons = opt.icons
  this.point(opt.shotBy.direction)
  this.lastSeen = opt.shotBy.lastSeen
  this.safe = true
  this.shooter = opt.shotBy
  var self = this
  setTimeout(function () {
    self.safe = false
  }, 200)
}
inherits(Shot, Moveable)
mixin(Shot, Healthy)
mixin(Shot, Hurty)

Shot.prototype.point = function (dir) {
  Moveable.prototype.point.call(this, dir)
  this.render.content = this.icons[this.direction]
}

Shot.prototype.collidesWith = function (obj) {
  // bounce off other shots
  if (this.shooter === obj.shooter) {
    return Moveable.prototype.collidesWith.call(this, obj)
  }
  if (this.safe && this.shooter === obj) return
  this.takeDamage(obj.damage)
}

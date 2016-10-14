'use strict'
module.exports = Shot
var Moveable = require('./moveable.js')
var Healthy = require('./healthy.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Shot (opt) {
  if (!opt) opt = {}
  if (!opt.x) opt.x = opt.shotBy.x
  if (!opt.y) opt.y = opt.shotBy.y
  if (!opt.icon) opt.icon = ' '

  // disable distruction on collisions with the shooter for a little bit
  this.safe = true

  Moveable.call(this, opt)
  Healthy.call(this, opt)
  Hurty.call(this, opt)

  this.shooter = opt.shotBy
  this.icons = opt.icons || {
    left: '⇦',
    up: '⇑',
    right: '⇨',
    down: '⇓'
  }

  this.point(this.shooter.direction)
  this.setSpeed(this.shooter.speed * 2)
  this.lastSeen = this.shooter.lastSeen

  // we have 200ms to stop colliding with our shooter
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
  this.setIcon(this.icons[this.direction])
}

Shot.prototype.collidesWith = function (obj) {
  // bounce off other shots
  if (this.shooter === obj.shooter) {
    return Moveable.prototype.collidesWith.call(this, obj)
  }
  if (this.safe && this.shooter === obj) {
    this.moveOne()
    return
  }
  this.takeDamage(obj.damage)
}

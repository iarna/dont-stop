'use strict'
module.exports = Shooter
var Moveable = require('./moveable.js')
var Healthy = require('./healthy.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Shooter (opt) {
  if (!opt.health) opt.health = 1
  Moveable.call(this, opt)
  Healthy.call(this, opt)
  this.shotStyle = {}
}
inherits(Shooter, Moveable)
mixin(Shooter, Healthy)

Shooter.prototype.collidesWith = function (obj) {
  if (obj.safe && obj.shooter === this) return
  // bounce off objects that don't hurt us and bounce of other shooters
  if (!obj.damage || obj instanceof Shooter) {
    return Moveable.prototype.collidesWith.call(this, obj)
  }
  this.takeDamage(obj.damage)
}

Shooter.prototype.shoot = function () {
  if (this.direction === 'right' && this.x === this.playField.maxX) return
  if (this.direction === 'left' && this.x === 0) return
  if (this.direction === 'down' && this.y === this.playField.maxY) return
  if (this.direction === 'up' && this.y === 0) return
  var icons = {
    left: '←',
    up: '↑',
    right: '→',
    down: '↓'
  }
  var shot = this.universe.newShot(icons, this)
  shot.render.style = this.shotStyle
  shot.setXY(shot.x, shot.y) // count as movement to destroy things in next square
}

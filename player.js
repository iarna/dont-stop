'use strict'
module.exports = Player
var Shooter = require('./shooter.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Player (opt) {
  if (!opt) opt = {}
  if (!opt.health) opt.health = 10
  if (!opt.damage) opt.damage = 1
  if (!opt.shotStyle) {
   opt.shotStyle = {
      fg: '#ffffff',
      bold: true
    }
  }
  Shooter.call(this, opt)
  Hurty.call(this, opt)
}
inherits(Player, Shooter)
mixin(Player, Hurty)

Player.prototype.move = function (now) {
  if (Shooter.prototype.move.call(this, now)) {
    this.emit('moved')
  }
}

Player.prototype.destroy = function () {
  this.removeAllListeners('moved')
  Shooter.prototype.destroy.call(this)
}

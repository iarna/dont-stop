'use strict'
module.exports = Player
var Shooter = require('./shooter.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Player (opt) {
  if (!opt.health) opt.health = 10
  if (!opt.damage) opt.damage = 1
  Shooter.call(this, opt)
  Hurty.call(this, opt)
  this.damage = 1
  this.shotStyle = {
    fg: '#ffffff',
    bold: true
  }
}
inherits(Player, Shooter)
mixin(Player, Hurty)

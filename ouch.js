'use strict'
module.exports = Ouch
var Positioned = require('./positioned.js')
var Healthy = require('./healthy.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Ouch (opt) {
  if (!opt.health) opt.health = 1
  if (!opt.damage) opt.damage = 1
  Positioned.call(this, opt)
  Healthy.call(this, opt)
  Hurty.call(this, opt)
  this.render.style.fg = '#aaaaff'
}
inherits(Ouch, Positioned)
mixin(Ouch, Healthy)
mixin(Ouch, Hurty)

Ouch.prototype.collidesWith = function (obj) {
  if (obj.safe && this.safe) return
  this.takeDamage(obj.damage)
}

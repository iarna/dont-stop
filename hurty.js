'use strict'
module.exports = Hurty

function Hurty (opt) {
  if (!opt) opt = {}
  this.damage = opt.damage || 1
}
Hurty.prototype = {}

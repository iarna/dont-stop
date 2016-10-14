'use strict'
module.exports = Positioned

var Entity = require('./entity.js')
var inherits = require('util').inherits

function Positioned (opt) {
  Entity.call(this, opt)
  if (!opt) opt = {}

  this.x = opt.x
  this.y = opt.y
}
inherits(Positioned, Entity)

Positioned.prototype.setXY = function (xx, yy) {
  this.x = xx
  this.y = yy
  this.controller.updatePosition(this)
}

Positioned.prototype.setX = function (xx) {
  this.x = xx
  this.controller.updatePosition(this)
}

Positioned.prototype.setY = function (yy) {
  this.y = yy
  this.controller.updatePosition(this)
}

Positioned.prototype.inspectTemplate = '[{alive}{id} {class} "{icon}" @ {x},{y}]'
Positioned.prototype.inspect = function () {
  return Entity.prototype.inspect.call(this)
    .replace(/\{x\}/, this.x)
    .replace(/\{y\}/, this.y)
}

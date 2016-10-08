'use strict'
module.exports = Positioned

var Entity = require('./entity.js')
var inherits = require('util').inherits

function Positioned (opt) {
  Entity.call(this, opt)

  if (opt.x != null && opt.y != null) {
    this.setXY(opt.x, opt.y)
  } else {
    if (opt.x != null) this.setX(opt.x)
    if (opt.y != null) this.setY(opt.y)
  }
}
inherits(Positioned, Entity)

Positioned.prototype.setXY = function (xx, yy) {
  if (xx > this.playField.maxX) throw new Error('X out of bounds ' + xx + ' > ' + this.playField.maxX)
  if (xx < 0) throw new Error('X out of bounds ' + xx + ' < 0')
  if (yy > this.playField.maxY) throw new Error('Y out of bounds ' + yy + ' > ' + this.playField.maxY)
  if (yy < 0) throw new Error('Y out of bounds ' + yy + ' < 0')
  this.emit('moved', this.x, this.y, xx, yy)
  if (this.x !== xx) this.emit('movedX', this.x, xx)
  if (this.y !== yy) this.emit('movedY', this.y, yy)
  this.x = xx
  this.y = yy
  this.render.left = (xx*2) + this.playField.left
  this.render.top = yy + this.playField.top
}

Positioned.prototype.setX = function (xx) {
  if (xx > this.playField.maxX) throw new Error('X out of bounds ' + xx + ' > ' + this.playField.maxX)
  if (xx < 0) throw new Error('X out of bounds ' + xx + ' < 0')
  this.emit('moved', this.x, this.y, xx, this.y)
  this.emit('movedX', this.x, xx)
  this.x = xx
  this.render.left = (xx*2) + this.playField.left
}

Positioned.prototype.setY = function (yy) {
  if (yy > this.playField.maxY) throw new Error('Y out of bounds ' + yy + ' > ' + this.playField.maxY)
  if (yy < 0) throw new Error('Y out of bounds ' + yy + ' < 0')
  this.emit('moved', this.x, this.y, this.x, yy)
  this.emit('movedY', this.y, yy)
  this.y = yy
  this.render.top = yy + this.playField.top
}

Positioned.prototype.inspect = function () {
  return '[#' + this.id + ' ' + this['__pro' + 'to__'].constructor.name + ' "' + this.render.content + '" @ ' + this.x + ',' + this.y + (this.damage ? ' !' + this.damage : '') + ']'
}

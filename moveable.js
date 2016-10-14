'use strict'
module.exports = Moveable
var Positioned = require('./positioned.js')
var inherits = require('util').inherits

function Moveable (opt) {
  Positioned.call(this, opt)

  this.speed = null
  this.msPer = null
  this.lastMoved = null
  this.direction = 'none'
  this._debug = {}
  if (opt.speed) this.setSpeed(opt.speed)
}
inherits(Moveable, Positioned)

Moveable.prototype.point = function (dir) {
  this.direction = dir
  this.lastMoved = null
}

Moveable.prototype.setSpeed = function (speed) {
  this.speed = speed
  this.msPer = 1000 / speed
  this.lastMoved = null
}

Moveable.prototype.move = function (now) {
  if (!this.speed || this.direction === 'none') return false
  var timeSince = this.lastMoved ? now - this.lastMoved : this.msPer
  this._debug.timeSince = Math.floor(timeSince)
  if (timeSince < this.msPer) return
  var moveBy = Math.round(timeSince / this.msPer) || 0
  var jitter = timeSince % this.msPer
  this._debug.moveBy = moveBy
  this._debug.jitter = Math.floor(jitter)
  var iter = 0
  do {
    this.moveOne()
  } while (++iter < 10 && --moveBy > 0)
  this.lastMoved = (this.lastMoved || now) + (iter * this.msPer)
  return true
}

Moveable.prototype.moveOne = function () {
  var newX
  var newY
  if (this.direction === 'right') {
    newX = Math.floor(this.x + 1)
    if (this.controller.isOOBX(newX)) {
      this.point('left')
    } else {
      this.setX(newX)
    }
  } else if (this.direction === 'left') {
    newX = Math.floor(this.x - 1)
    if (this.controller.isOOBX(newX)) {
      this.point('right')
    } else {
      this.setX(newX)
    }
  } else if (this.direction === 'up') {
    newY = Math.floor(this.y - 1)
    if (this.controller.isOOBY(newY)) {
      this.point('down')
    } else {
      this.setY(newY)
    }
  } else if (this.direction === 'down') {
    newY = Math.floor(this.y + 1)
    if (this.controller.isOOBY(newY)) {
      this.point('up')
    } else {
      this.setY(newY)
    }
  }
}

Moveable.prototype.status = function () {
  return ' ' + this.direction + ': ' +
    this.x + ', ' + this.y +
    ' ' + this.speed + ' cps' +
 //   ' [' + this._debug.timeSince + ', ' + this.msPer + ']' +
    ' @ ' + this._debug.moveBy + ' (' + this._debug.jitter + ') '
}

Moveable.prototype.collidesWith = function (obj) {
  // bounce on collision
  switch (this.direction) {
    case 'up':
      this.point('down')
      break
    case 'down':
      this.point('up')
      break
    case 'left':
      this.point('right')
      break
    case 'right':
      this.point('left')
      break
  }
  // if neither we nor the other object have moved out of the way yet then
  // we'll be the one to do it.
  if (obj.x === this.x && obj.y === this.y) {
    this.moveOne()
  }
}

Moveable.prototype.inspectTemplate = '[{alive}{id} {class} "{icon}" @ {x},{y} -> {direction}{speed}{damage}]'
Moveable.prototype.inspect = function () {
  return Positioned.prototype.inspect.call(this)
    .replace(/\{direction\}/, this.direction)
    .replace(/\{speed\}/, this.speed ? '@' + this.speed + 'cps' : '')
    .replace(/\{damage\}/, this.damage ? '!' : '')
}

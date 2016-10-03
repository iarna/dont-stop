'use strict'
module.exports = Moveable
var Positioned = require('./positioned.js')
var inherits = require('util').inherits

function Moveable (opt) {
  Positioned.call(this, opt)

  this.speed = opt.speed || 0
  this.hspeed = opt.hspeed || opt.speed
  this.vspeed = opt.vspeed || this.hspeed / 2
  this.speed = null
  this.msPer = null
  this.direction = 'none'
  this._debug = {}
  this.move = {
    last: null,
    interval: null,
    action: this._move()
  }
}
inherits(Moveable, Positioned)

Moveable.prototype.point = function (dir) {
  this.direction = dir
  switch (dir) {
    case 'up':
    case 'down':
      this.setSpeed(this.vspeed)
      break
    case 'left':
    case 'right':
      this.setSpeed(this.hspeed)
      break
  }
}

Moveable.prototype.setSpeed = function (speed) {
  if (this.speed) {
    clearInterval(this.move.interval)
  }
  this.speed = speed
  this.msPer = 1000 / speed
  this.start()
}

Moveable.prototype.start = function (now) {
  if (!this.msPer) return
  this.move.last = now || Date.now()
  if (this.move.interval) clearInterval(this.move.interval)
  this.move.interval = setInterval(this.move.action, this.msPer)
}

Moveable.prototype.destroy = function () {
  Positioned.prototype.destroy.call(this)
  clearInterval(this.move.interval)
}

Moveable.prototype._move = function () {
  var self = this
  return function () {
    var now = Date.now()
    var timeSince = now - self.move.last
    var moveBy = Math.floor(timeSince / this.msPer)
    var jitter = timeSince % this.msPer
    self.move.last = now - jitter
    do {
      self.moveOne()
    } while (--moveBy)
    self._debug.timeSince = timeSince
    self._debug.moveBy = moveBy
    self._debug.jitter = jitter
    return true
  }
}

Moveable.prototype.moveOne = function () {
  var newX
  var newY
  if (this.direction === 'right') {
    newX = Math.floor(this.x + 1)
    if (newX >= this.playField.maxX) {
      this.point('left')
      newX = this.playField.maxX
    }
    this.setX(newX)
  } else if (this.direction === 'left') {
    newX = Math.floor(this.x - 1)
    if (newX <= 0) {
      this.point('right')
      newX = 0
    }
    this.setX(newX)
  } else if (this.direction === 'up') {
    newY = Math.floor(this.y - 1)
    if (newY <= 0) {
      this.point('down')
      newY = 0
    }
    this.setY(newY)
  } else if (this.direction === 'down') {
    newY = Math.floor(this.y + 1)
    if (newY >= this.playField.maxY) {
      this.point('up')
      newY = this.playField.maxY
    }
    this.setY(newY)
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
}

Moveable.prototype.inspect = function () {
  return '[#' + this.id + ' ' + this['__pro' + 'to__'].constructor.name + ' "' + this.render.content + '" @ ' +
    this.x + ',' + this.y + ' -> ' + this.direction + (this.speed ? '@' + this.speed + 'cps' : '') + (this.damage ? ' !' + this.damage : '') + ']'
}

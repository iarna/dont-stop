'use strict'
module.exports = Adversary
var Shooter = require('./shooter.js')
var Hurty = require('./hurty.js')
var inherits = require('util').inherits
var mixin = require('mixin')

function Adversary (opt) {
  if (!opt) opt = {}
  if (!opt.health) opt.health = 3
  if (!opt.damage) opt.damage = 1
  if (!opt.shotStyle) opt.shotStyle = {
    fg: '#55ffff'
  }
  if (!opt.icon) opt.icon = '🐵'
  Shooter.call(this, opt)
  Hurty.call(this, opt)
  this.navigate = {
    interval: null,
    action: this._navigate()
  }
  this.dodge = {
    last: 0,
    interval: null,
    action: this._dodge()
  }
  this.attack = {
    last: 0,
    interval: null,
    action: this._attack()
  }
  if (opt.icon !== '🐵') {
    var self = this
    setTimeout(function () {
      if (self.health > 2) {
        self.setIcon('🐵')
      }
    }, 400)
  }
  if (opt.player) this.setPlayer(opt.player)
}
inherits(Adversary, Shooter)
mixin(Adversary, Hurty)

var directions = ['up', 'down', 'left', 'right']

Adversary.prototype.takeDamage = function (amount) {
  Shooter.prototype.takeDamage.call(this, amount)
  if (this.health === 2) {
    this.setIcon('🙈')
    this.setStyle({fg: '#aa5555'})
  } else if (this.health === 1) {
    this.setIcon('🙉')
    this.setStyle({fg: '#661111'})
  }
}

Adversary.prototype.spin = function () {
  var ourDir = this.direction
  var otherDirs = directions.filter(function (dir) { return dir !== ourDir })
  this.direction = otherDirs[this.controller.random(3)]
}

Adversary.prototype.setPlayer = function (player) {
  this.player = player
  this.start()
}

Adversary.prototype.start = function (now) {
  if (!now) now = Date.now()
  if (!this.player) return
  if (this.navigate.interval) clearInterval(this.navigate.interval)
  if (this.dodge.interval) clearInterval(this.dodge.interval)
  if (this.attack.interval) clearInterval(this.attack.interval)
  this.navigate.interval = setInterval(this.navigate.action, 100)
  this.dodge.interval = setInterval(this.dodge.action, 50)
  this.attack.interval = setInterval(this.attack.action, 50)
}

Adversary.prototype.destroy = function () {
  clearInterval(this.navigate.interval)
  clearInterval(this.dodge.interval)
  clearInterval(this.attack.interval)
  Shooter.prototype.destroy.call(this)
}

Adversary.prototype._navigate = function () {
  var self = this
  return function () {
    var movement = self.direction === 'up' || self.direction === 'down' ? 'vert' : 'horiz'
    // move toward the player…
    var xDiff = self.x - self.player.x
    var yDiff = self.y - self.player.y
    if (!xDiff || !yDiff) return
    if (movement === 'vert' && Math.abs(xDiff / 2) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        self.point('left')
      } else {
        self.point('right')
      }
    } else if (movement === 'horiz' && Math.abs(xDiff / 2) < Math.abs(yDiff)) {
      if (yDiff > 0) {
        self.point('up')
      } else {
        self.point('down')
      }
    }
  }
}

Adversary.prototype.shoot = function (now) {
  this.attack.last = now
  return Shooter.prototype.shoot.call(this, now)
}

Adversary.prototype._attack = function () {
  var self = this
  return function () {
    var now = Date.now()
    if (now - self.attack.last < 1000) return
    var xDiff = self.x - self.player.x
    var yDiff = self.y - self.player.y
    if (self.direction === 'up' && !xDiff && yDiff > 0) {
      self.shoot(now)
    } else if (self.direction === 'down' && !xDiff && yDiff < 0) {
      self.shoot(now)
    } else if (self.direction === 'left' && !yDiff && xDiff > 0) {
      self.shoot(now)
    } else if (self.direction === 'right' && !yDiff && xDiff < 0) {
      self.shoot(now)
    }
  }
}

Adversary.prototype._dodge = function () {
  var self = this
  return function () {
    var now = Date.now()
    if (now - self.dodge.last < 100) return
    var movement = self.direction === 'up' || self.direction === 'down' ? 'vert' : 'horiz'
    var xMove = 0
    var yMove = 0
    if (movement === 'horiz') {
      xMove = self.direction === 'left' ? -1 : 1
    } else {
      yMove = self.direction === 'up' ? -1 : 1
    }
    var atSlot = []
    // lookahead
    var moved = 0
    var futureX = self.x
    var futureY = self.y
    while (!atSlot.length && ++moved < 5) {
      futureX += xMove
      futureY += yMove
      // don't dodge things we're already running away from
      atSlot = self.controller.objectsAt(futureX, futureY).filter(function (obj) { return obj.direction !== self.direction })
    }
    // lookbehind
    moved = 0
    xMove *= -1
    yMove *= -1
    futureX = self.x + xMove
    futureY = self.y + yMove
    while (!atSlot.length && ++moved < 3) {
      futureX += xMove
      futureY += yMove
      atSlot = self.controller.objectsAt(futureX, futureY)
    }
    if (atSlot.length) {
//      self.controller.warn('avoid!', movement, self.direction, atSlot)
      self.dodge.last = now
      self.spin()
    }
  }
}

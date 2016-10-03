'use strict'
module.exports = Entity

var blessed = require('blessed')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var maxId = 0

function Entity (opt) {
  this.universe = opt.universe
  this.playField = opt.universe.playField
  this.render = blessed.text({content: opt.icon, style: {}})
  this.id = ++maxId
  this.destroyed = false
}
inherits(Entity, EventEmitter)

Entity.prototype.destroy = function () {
  this.destroyed = true
  this.emit('destroy')
  this.universe.playField.remove(this)
}

Entity.prototype.inspect = function () {
  return '[#' + this.id + ' ' + this['__pro' + 'to__'].constructor.name + (this.damage ? ' !' + this.damage : '') + ']'
}

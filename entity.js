'use strict'
module.exports = Entity

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var maxId = 0

function Entity (opt) {
  if (!opt) opt = {}

  this.controller = opt.controller
  this.icon = opt.icon
  this.id = ++maxId
  this.destroyed = false
  this.style = opt.style
}
inherits(Entity, EventEmitter)

Entity.prototype.setIcon = function (icon) {
  if (this.destroyed) return
  this.icon = icon
  this.controller.updateIcon(this)
}

Entity.prototype.setStyle = function (style) {
  if (this.destroyed) return
  this.style = style
  this.controller.updateStyle(this)
}

Entity.prototype.destroy = function () {
  if (this.destroyed) return
  this.destroyed = true
  this.emit('destroy')
  this.removeAllListeners('destroy')
}

Entity.prototype.inspectTemplate = '[{alive}{id} {class} "{icon}"]'

Entity.prototype.inspect = function () {
  return this.inspectTemplate
    .replace(/\{alive\}/, this.destroyed ? '-' : '#')
    .replace(/\{id\}/, this.id)
    .replace(/\{class\}/, this['__' + 'proto' + '__'].constructor.name)
    .replace(/\{icon\}/, this.icon)
}

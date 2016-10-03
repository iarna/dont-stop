'use strict'
module.exports = PlayField

function PlayField (screen) {
  this.screen = screen

  this.top = 1
  this.left = 1
  this.bottom = screen.rows - 2
  this.right = screen.cols - 3
  this.maxX = this.right - this.left
  this.maxY = this.bottom - this.top
}
PlayField.prototype = {}

PlayField.prototype.add = function (obj) {
  this.screen.append(obj.render)
}

PlayField.prototype.remove = function (obj) {
  this.screen.remove(obj.render)
}

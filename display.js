'use strict'
module.exports = Display
var blessed = require('blessed')

function Display (control) {
  this.control = control
  var screen = blessed.screen({
    smartCSR: true,
    useBCE: false,
    fullUnicode: true
  })

  this.screen = screen

  var box = blessed.box({
    top: 0,
    left: 0,
    width: screen.cols - 1,
    height: '100%',
    border: {type: 'line'}
  })
  screen.append(box)

  var status = blessed.text({
    top: screen.rows - 1,
    left: screen.cols - 43,
    width: 40,
    content: 'STATUS'
  })
  screen.append(status)
  this.status = status

  this.playScreen = {
    top: 1,
    left: 1,
    bottom: screen.rows - 2,
    right: screen.cols - 3
  }
  this.playScreen.width = this.playScreen.right - this.playScreen.left
  this.playScreen.height = this.playScreen.bottom - this.playScreen.top
  this.objects = {}
}
Display.prototype = {}

Display.prototype.add = function (obj) {
  var initWith = {style: {}}
  if (obj.icon) initWith.content = obj.icon
  if (obj.x != null) initWith.left = this.translateX(obj.x)
  if (obj.y != null) initWith.top = this.translateY(obj.y)
  if (obj.style) initWith.style = obj.style
  var dobj = this.objects[obj.id] = blessed.text(initWith)
  this.screen.append(dobj)
}

Display.prototype.remove = function (obj) {
  var dobj = this.objects[obj.id]
  dobj.free()
  dobj.destroy()
  delete this.objects[obj.id]
}

Display.prototype.translateX = function (uniX) {
  return (uniX * 2) + this.playScreen.left
}

Display.prototype.translateY = function (uniY) {
  return uniY + this.playScreen.top
}

Display.prototype.updatePosition = function (obj) {
  var xx = this.translateX(obj.x)
  var yy = this.translateY(obj.y)
  if (this.isOOBX(xx) || this.isOOBY(yy)) {
    throw new Error('Screen bounds violation ' + obj.inspect() + ' @ ' + xx + ',' + yy +
      ' must be within ' + this.playScreen.left + ',' + this.playScreen.left + ' → ' + this.playScreen.right + ',' + this.playScreen.bottom)
  }
  var dobj = this.objects[obj.id]
  if (!dobj) return
  dobj.left = xx
  dobj.top = yy
}

Display.prototype.isOOBX = function (xx) {
  return xx < this.playScreen.left || xx > this.playScreen.right
}

Display.prototype.isOOBY = function (yy) {
  return yy < this.playScreen.top || yy > this.playScreen.bottom
}

Display.prototype.updateIcon = function (obj) {
  var dobj = this.objects[obj.id]
  if (dobj) dobj.content = obj.icon
}

Display.prototype.updateStyle = function (obj) {
  var dobj = this.objects[obj.id]
  if (dobj) dobj.style = obj.style
}

Display.prototype.setStatus = function (str) {
  this.status.content = str
}

Display.prototype.refresh = function (obj) {
  this.screen.render()
}

Display.prototype.destroy = function (obj) {
  this.screen.destroy()
}

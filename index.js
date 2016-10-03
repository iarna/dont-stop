'use strict'
var blessed = require('blessed')
var Universe = require('./universe.js')

var screen = initialize(blessed.screen({
  smartCSR: true,
  useBCE: true
}))
var status = blessed.text({
  top: 0,
  left: 2,
  content: ''
})
screen.append(status)

var universe = new Universe(screen)

var player = universe.newPlayer('@', 0, 0, 30)
player.on('destroy', function () {
  screen.destroy()
  console.log('GAME OVER')
  universe.warnings.forEach(function (w) { return console.log.apply(console, w) })
  process.exit(0)
})
var adversary = universe.newAdversary('*', universe.playField.maxX, universe.playField.maxY, 22)
adversary.point('up')
adversary.setPlayer(player)

for (var ii = 0; ii < 20; ++ii) {
  do {
    var xx = Math.floor(Math.random() * (universe.playField.maxX + 1))
    var yy = Math.floor(Math.random() * (universe.playField.maxY + 1))
  } while (universe.locations[xx][yy])
  universe.newOuch('·', xx, yy)
}

setInterval(function () { screen.render() }, 16) // 60fps
screen.render()

function initialize (screen) {
  screen.title = "DON'T STOP"
  screen.key('C-c', function () {
    screen.destroy()
//    console.log(universe.movingObjects)
    universe.warnings.forEach(function (w) { return console.log.apply(console, w) })
    process.exit(0)
  })
  screen.key('left', left)
  screen.key('a', left) // wasd
  screen.key('h', left) // vi
  screen.key('right', right)
  screen.key('d', right) // wasd
  screen.key('l', right) // vi
  screen.key('up', up)
  screen.key('w', up) // wasd
  screen.key('k', up) // vi
  screen.key('down', down)
  screen.key('s', down) // wasd
  screen.key('x', down) // waxd
  screen.key('j', down) // vi
  screen.key('space', shoot)

  function left () {
    player.point('left')
  }

  function right () {
    player.point('right')
  }

  function up () {
    player.point('up')
  }

  function down () {
    player.point('down')
  }

  function shoot () {
    player.shoot()
  }

  var box = blessed.box({
    top: 0,
    left: 0,
    width: screen.cols - 1,
    height: '100%',
    border: {type: 'line'}
  })
  screen.append(box)
  return screen
}

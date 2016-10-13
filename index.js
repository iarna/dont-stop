#!/usr/bin/env node
'use strict'
var blessed = require('blessed')
var Universe = require('./universe.js')
var onExit = require('signal-exit')
var MersenneTwister = require('mersenne-twister');
var fps = 60

var seed = process.argv[2]
var screen = initialize(blessed.screen({
  smartCSR: true,
  useBCE: false,
  fullUnicode: true,
  forceUnicode: true
}))

var status = blessed.text({
  top: screen.rows - 1,
  left: screen.cols - 43,
  width: 40,
  content: ''
})
screen.append(status)

var universe = new Universe(screen, seed)
var acting = false
var actionQueue = []
var player = universe.newPlayer('🐙', 0, 0, 15)
player.once('destroy', destroyPlayer)
var currentLevel
screen.render()

setInterval(refresh, Math.floor(1000 / fps))
function refresh () {
  var now = Date.now()
  for (var ii = 0; ii < universe.movingObjects.length; ++ii) {
    if (universe.movingObjects[ii].destroyed) continue
    universe.movingObjects[ii].move(now)
  }
  if (!universe.refresh) return
  universe.refresh = false
  status.content = ' Health: ' + player.health + ' Level: ' + currentLevel
  screen.render()
  universe.validate()
}

startGame()

function startGame() {
  var level = 0
  runNextLevel()
  function runNextLevel () {
    runLevel(++level, runNextLevel)
  }
}

function runLevel (level, next) {
  currentLevel = level

  universe.ouches = Math.floor(Math.pow(2, level + 2) / (level + 2))
  var maxX = (universe.playField.maxX / 2)^0
  for (var ii = 0; ii < universe.ouches; ++ii) {
    do {
      var xx = Math.floor(universe.rng.random() * (maxX + 1))
      var yy = Math.floor(universe.rng.random() * (universe.playField.maxY + 1))
    } while (universe.locations[xx][yy])
    var ouch = universe.newOuch('🌟', xx, yy)
    ouch.once('destroy', destroyOuch(ouch, player, allDone))
  }
  function allDone () {
    player.point('none')
    actionQueue = []
    player.removeListener('moved', nextAction)
    universe.destroy(function (obj) { return obj !== player })
    next()
  }
}

onExit(function () {
  universe.warnings.forEach(function (w) { return console.log.apply(console, w) })
})

function destroyPlayer () {
  screen.destroy()
  console.log('GAME OVER')
  console.log('Congratulations! You made it to level', currentLevel)
  process.exit(0)
}

var animateBooms = 0
function destroyOuch (ouch, player, allDone) {
  var top = ouch.render.top
  var left = ouch.render.left
  var xx = ouch.x
  var yy = ouch.y
  return function () {
    --universe.ouches
    ++booms
    animateBoom(left, top, function () {
      if (--booms && universe.ouches < 1) return
      if (universe.ouches < 1) return allDone()
      // one out of ten times, destroying an ouch will
      // replace it with an aversary
      if (Math.floor(universe.rng.random()*10) === 0) {
        var adversary = universe.newAdversary('🌪', xx, yy, 11)
        adversary.point('up')
        adversary.setPlayer(player)
        adversary.on('destroy', function () {
          player.takeHealing(3)
        })
      }
    })
  }
}

function initialize (screen) {
  screen.title = "DON'T STOP"
  screen.key('C-c', function () {
    screen.destroy()
//    console.log(universe.movingObjects)
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

  function move (dir) {
    action([player, player.point, dir])
  }

  function shoot () {
    action([player, player.shoot])
  }


  function left () {
    move('left')
  }

  function right () {
    move('right')
  }

  function up () {
    move('up')
  }

  function down () {
    move('down')
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

function action (todo) {
  if (acting) return actionQueue.push(todo)
  acting = true
  runAction(todo)
  player.on('moved', nextAction)
}

function runAction (todo) {
  todo[1].apply(todo[0], todo.slice(2))
}

function nextAction () {
  if (actionQueue.length == 0) {
    player.removeListener('moved', nextAction)
    acting = false
    return
  }
  runAction(actionQueue.shift())
}

function animateBoom (xx, yy, done) {
  var boom = blessed.box({
    left: xx,
    top: yy,
    width: 2,
    height: 1, 
    transparent: true,
    align: 'center',
    valign: 'middle',
    content: '',
    style: {
      fg: '#000000',
      bg: '#666666',
    }
  })
  var script = [
    ['width', 2, 'height', 1, 'content', '🔥', 'style', ['bg', '990000']],
    ['style', ['bg', 'red']],
    ['style', ['bg', 'yellow']],
    ['style', ['bg', 'white']],
    ['left', xx-2, 'top', yy-1, 'width', 6, 'height', 3],
    ['style', ['bg', 'yellow']],
    ['style', ['bg', 'red']],
    ['style', ['bg', '#990000']],
    ['style', ['bg', '#666666']]
  ] 
  function assignArray (obj, arr) {
    if (Array.isArray(obj)) return obj[1].apply(obj[0], arr)
    for (var ii = 0; ii < arr.length; ii += 2) {
      var key = arr[ii]
      var value = arr[ii+1]
      if (Array.isArray(value)) {
        if (!obj[key]) obj[key] = {}
        if (typeof obj[key] === 'function') {
          assignArray([obj, obj[key]], value)
        } else {
          assignArray(obj[key], value)
        }
      } else {
        obj[key] = value
      }
      if (ii > 10) return
    }
  }

  var int = setInterval(function () {
    if (script.length === 0) {
      boom.destroy()
      clearInterval(int)
      return done()
    }
    assignArray(boom, script.shift())
  }, 150)

  screen.insertAfter(boom, status)
}

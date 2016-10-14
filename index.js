#!/usr/bin/env node
'use strict'
var Control = require('./control.js')
var onExit = require('signal-exit')
var MersenneTwister = require('mersenne-twister');
var fps = 60


var seed = process.argv[2]
var control = new Control(fps, seed)
initialize()
control.status(function () {
  return ' Health: ' + player.health + ' Level: ' + currentLevel
})

var acting = false
var actionQueue = []
var player = control.newPlayer('🐙', 0, 0, 15)
player.once('destroy', destroyPlayer)
var currentLevel
var ouches = 0

startGame()

function startGame() {
  control.start()
  var level = 0
  runNextLevel()
  function runNextLevel () {
    runLevel(++level, runNextLevel)
  }
}

function runLevel (level, next) {
  currentLevel = level
  ouches = (Math.pow(2, level + 2) / (level + 2)) ^ 0

  for (var ii = 0; ii < ouches; ++ii) {
    do {
      var xx = control.random(control.universe.width)
      var yy = control.random(control.universe.height)
    } while (control.objectsAt(xx, yy).length)
    var ouch = control.newOuch('🌟', xx, yy)
    ouch.once('destroy', destroyOuch(ouch, player, allDone))
  }
  function allDone () {
    player.point('none')
    actionQueue = []
    player.removeListener('moved', nextAction)
    control.forAllObjects(function (obj) {
      if (obj === player) return
      // we're destroying the universe so we don't want to trigger
      // per object destroy events. This'll only really matter if
      // we animate shot or adversary destruction.
      obj.removeAllListeners('destroy')
      control.remove(obj)
    })
    next()
  }
}

onExit(function () {
  control.warnings.forEach(function (w) { return console.log.apply(console, w) })
})

function destroyPlayer () {
  control.destroy()
  console.log('GAME OVER')
  console.log('Congratulations! You made it to level', currentLevel)
  process.exit(0)
}

var booms = 0
function destroyOuch (ouch, player, allDone) {
  var xx = ouch.x
  var yy = ouch.y
  var top = control.display.translateY(yy)
  var left = control.display.translateX(xx)
  return function () {
    --ouches
    ++booms
    animateBoom(left, top, function () {
      if (--booms && ouches < 1) return
      if (ouches < 1) return allDone()
      // one out of ten times, destroying an ouch will
      // replace it with an aversary
      if (control.random(10) === 0) {
        var adversary = control.newAdversary('🌪', xx, yy, 11, player)
        adversary.point('up')
        adversary.on('destroy', function () {
          player.takeHealing(3)
        })
      }
    })
  }
}

function initialize () {
  control.display.screen.title = "DON'T STOP"
  control.display.screen.key('C-c', function () {
    control.destroy()
//    console.log(universe.movingObjects)
    process.exit(0)
  })
  control.display.screen.key('left', left)
  control.display.screen.key('a', left) // wasd
  control.display.screen.key('h', left) // vi
  control.display.screen.key('right', right)
  control.display.screen.key('d', right) // wasd
  control.display.screen.key('l', right) // vi
  control.display.screen.key('up', up)
  control.display.screen.key('w', up) // wasd
  control.display.screen.key('k', up) // vi
  control.display.screen.key('down', down)
  control.display.screen.key('s', down) // wasd
  control.display.screen.key('x', down) // waxd
  control.display.screen.key('j', down) // vi
  control.display.screen.key('space', shoot)

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

var blessed = require('blessed')
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

  control.display.screen.insertAfter(boom, control.display.status)
}

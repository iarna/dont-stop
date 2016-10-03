'use strict'
module.exports = Healthy

function Healthy (opt) {
  if (!opt) opt = {}
  this.health = opt.health || 1
}
Healthy.prototype = {}

Healthy.prototype.takeDamage = function (amount) {
  if (!amount) throw new Error()
  this.universe.warn('takeDamage', this, amount)
  if (!amount) return
  this.health -= amount
  if (this.health <= 0) this.destroy()
}

#!/usr/bin/env node

const main = require('./index.js')
let superNumber = Number(process.argv[process.argv.length - 1])
let bLaunch = process.argv[process.argv.length - 1] === '--launch'

// superNumber = 1
// bLaunch = true
if (Number.isSafeInteger(superNumber) && superNumber > 0) {
  main({ superNumber, bLaunch })
}

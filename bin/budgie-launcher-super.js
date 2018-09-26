#!/usr/bin/env node
const path = require('path')

const main = require(path.join(__dirname, '../index.js'))
let superNumber = Number(process.argv[process.argv.length - 1])
let bLaunch = process.argv[process.argv.length - 2] === '--launch'

// superNumber = 2
// bLaunch = true
if (Number.isSafeInteger(superNumber) && superNumber > 0) {
  main({ superNumber, bLaunch })
}

#!/usr/bin/env node
const main = require('budgie-launcher-super')
let superNumber = Number(process.argv[process.argv.length - 1])
let bLaunch = process.argv.indexOf('--launch') > -1

// superNumber = 1
// bLaunch = true
if (Number.isSafeInteger(superNumber) && superNumber > 0) {
  main({ superNumber, bLaunch })
} else {
  main({ sCommand: superNumber, bLaunch })
}

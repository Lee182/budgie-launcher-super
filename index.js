const fs = require('fs-extra')
const number2str = require('number2str')
const sh = require('shell-exec')
const ps = require('ps')
const awaity = require('awaity')
const wait = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const appPath = '/usr/share/applications/'
const ignoreCommand = new Set(['budgie-panel', 'budgie-helper'])

const formatCommand = (s) => {
  const sEndBit = s.split('/').pop()
  if (sEndBit === 'gnome-terminal-') {
    return 'gnome-terminal'
  }
  return sEndBit
}

const getPinned = async () => {
  const path = '/com/solus-project/budgie-panel/instance/icon-tasklist/'
  const sh1 = await sh(`dconf list ${path}`)
  const panelId = sh1.stdout.trim()
  const sh2 = await sh(`dconf read ${path}${panelId}pinned-launchers`)

  // eslint-disable-next-line
  const aPanel = Function(`"use strict";return (${sh2.stdout.trim()})`)()
  return aPanel
}

const launch = async (desktopName) => {
  const desktopExits = await fs.pathExists(`${appPath}${desktopName}`)
  if (!desktopExits) {
    throw Error('Could not find path: ' + desktopName)
  }
  sh(`gtk-launch ${desktopName}`, { detached: true })
  await wait(200)
  // const tmpName = `launcher-${number2str.random(6)}.desktop`
  // const filePath = `${process.env.HOME}/.local/share/applications/${tmpName}`
  // const pathExists = await fs.pathExists(filePath)
  // if (pathExists) {
  //   return launch(desktopName)
  // }

  // await fs.copy(`${appPath}${desktopName}`, filePath)
  // const rmTmp = () => {
  //   fs.unlink(filePath)
  // }
  // sh(`gtk-launch ${tmpName}`).then(rmTmp, rmTmp)
  // await wait(200)
}

const getApplictaionsExecPath = async () => {
  const files = await fs.readdir(appPath)
  const apps = files.filter(s => s.match(/\.desktop$/) !== null)
  const o = {
    DesktopExe: {},
    ExeDesktop: {},
    CommandDesktop: {},
    DesktopCommand: {}
  }
  await awaity.mapLimit(
    apps,
    async sDesktop => {
      const file = await fs.readFile(`${appPath}${sDesktop}`)
      let sExec = file
        .toString()
        .split('\n')
        .find(s => /^Exec=/.test(s))
      const aExec = sExec.split(/Exec=|\s/)
      aExec.shift()
      sExec = aExec.join(' ')
      const sCommand = formatCommand(aExec.shift())
      // o.DesktopExe[sDesktop] = sExec
      // o.ExeDesktop[sExec] = sDesktop
      // o.CommandDesktop[sCommand] = sDesktop
      o.DesktopCommand[sDesktop] = sCommand
    },
    12
  )
  return o
}

const getWindows = async () => {
  const sh1 = await sh(`wmctrl -lp`)
  const windows = sh1.stdout
    .trim()
    .split('\n')
    .map(line => {
      const items = line.split(/\s+/)
      return {
        hexWID: items[0],
        wid: parseInt(items[0], 16),
        desktop: items[1],
        pid: Number(items[2]),
        user: items[3],
        title: items.slice(4).join(' ')
      }
    })
  const procs = await ps({ pid: windows.map(o => o.pid) })
  return windows
    .map(o => {
      const proc = procs.find((proc) => (Number(proc.pid) === o.pid))
      if (!proc) {
        return
      }
      o.command = formatCommand(proc.command)
      return o
    })
    .filter(window => (window !== undefined))
    .filter(window => (!ignoreCommand.has(window.command)))
}

const main = async ({
  superNumber = 3,
  windowIndex = 0,
  bLaunch = false,
  bIncrementWindowIndex = true,
  attemptIndex = 0
}) => {
  if (attemptIndex > 2) {
    return
  }
  const [
    pinned,
    windows,
    execPaths,
    sh2
  ] = await awaity.map([
    getPinned(),
    getWindows(),
    getApplictaionsExecPath(),
    sh(`xdotool getactivewindow`)
  ])
  const activeWID = Number(sh2.stdout.trim())
  const pinnedAsCommands = pinned.map((sDesktop) => {
    return execPaths.DesktopCommand[sDesktop]
  })
  const pinnedIndex = pinnedAsCommands.reduce((o, sCommand, i, arr) => {
    o[sCommand] = i
    return o
  }, {})

  const aWindowsSorted = []
  let activeIndex = []
  windows.forEach((window, i) => {
    window.i = i
    window.active = window.wid === activeWID
    let index = pinnedIndex[window.command]
    if (index === undefined) {
      index = pinnedAsCommands.length - 1
      while (index < aWindowsSorted.length) {
        index++
        if (Array.isArray(aWindowsSorted[index]) && aWindowsSorted[index][0].command === window.command) {
          break
        }
      }
    }
    if (!aWindowsSorted[index]) {
      aWindowsSorted[index] = []
    }
    aWindowsSorted[index].push(window)
    if (window.active) {
      activeIndex = [index, aWindowsSorted[index].length - 1]
    }
  })
  let superIndex = superNumber - 1
  const notLaunched = aWindowsSorted[superIndex] === undefined
  if (bIncrementWindowIndex && pinned[superIndex] !== undefined && (bLaunch || notLaunched)) {
    windowIndex = notLaunched ? 0 : aWindowsSorted[superIndex].length
    await launch(pinned[superIndex])
    await main({
      superNumber,
      bLaunch: false,
      bIncrementWindowIndex: false,
      attemptIndex: attemptIndex + 1,
      windowIndex
    })
    return
  }

  if (bIncrementWindowIndex && activeIndex[0] === superIndex) {
    windowIndex = (activeIndex[1] + 1) % aWindowsSorted[superIndex].length
  }
  // switch focus to window
  if (aWindowsSorted[superIndex] && aWindowsSorted[superIndex][windowIndex]) {
    const window = aWindowsSorted[superIndex][windowIndex]
    await sh(`wmctrl -ia ${window.hexWID}`)
  }
}

module.exports = main

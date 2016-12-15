const downloader = require('github-download')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const kill = require('tree-kill')

let sourcePath
let localPyPath
let child
let handler

module.exports.setup = function (appPath, config, execHandler) {
  sourcePath = path.join(appPath, '../shadowsocksr_python')
  localPyPath = path.join(sourcePath, 'shadowsocks/local.py')
  if (fs.statSync(sourcePath).isDirectory()) {
    console.log('exist, not need to download')
  } else {
    downloader({ user: 'breakwa11', repo: 'shadowsocks' }, sourcePath).on('end', () => {
      console.log('download complete')
    })
  }
  handler = execHandler
  if (config && config.enable && config.selected > -1 && config.configs.length && config.configs[config.selected]) {
    module.exports.run(config.enable, config.configs[config.selected])
  }
}

module.exports.run = function (enable, config) {
  // kill preview
  if (child && child.pid) {
    kill(child.pid)
  }
  if (enable) {
    const params = []
    params.push(`-s ${config.host}`)
    params.push(`-p ${config.port}`)
    params.push(`-k ${config.password}`)
    params.push(`-m ${config.method}`)
    config.obfs && params.push(`-o ${config.obfs}`)
    const command = `python ${localPyPath} ${params.join(' ')}`
    console.log(command)
    child = exec(command, (error, stdout, stderr) => {
      if (error) {
        handler({ error })
      } else if (stderr) {
        handler({ stderr })
      }
    })
  }
}

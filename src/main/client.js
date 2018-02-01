import path from 'path'
import { execFile } from 'child_process'
import treeKill from 'tree-kill'
import { appConfig$ } from './data'
import { isHostPortValid } from './port'
import { alertMessage } from './ipc'
import logger from './logger'
import { isConfigEqual } from '../shared/utils'

let child

/**
 * 运行shell命令并写入到日志中
 * @param {*String} command 待执行的shell命令
 */
export function runCommand (command, params) {
  if (command) {
    child = execFile(command, params)
    child.stdout.on('data', logger.log)
    child.stderr.on('data', logger.error)
    child.on('close', logger.log)
    return child
  }
}

/**
 * 运行ssr
 * @param {*Object} config ssr配置
 * @param {*String} ssrPath local.py的路径
 * @param {*[Number|String]} localPort 本地共享端口
 */
export function run (config, ssrPath, shareOverLan = false, localPort = 1080) {
  const listenHost = shareOverLan ? '0.0.0.0' : '127.0.0.1'
  // 先结束之前的
  return stop().then(() => {
    return isHostPortValid(listenHost, localPort)
  }).then(() => {
    // 参数
    const params = [path.join(ssrPath, 'local.py')]
    params.push('-s')
    params.push(config.server)
    params.push('-p')
    params.push(config.server_port)
    params.push('-k')
    params.push(config.password)
    params.push('-m')
    params.push(config.method)
    params.push('-O')
    params.push(config.protocol)
    if (config.protocolparam) {
      params.push('-G')
      params.push(config.protocolparam)
    }
    if (config.obfs) {
      params.push('-o')
      params.push(config.obfs)
    }
    if (config.obfsparam) {
      params.push('-g')
      params.push(config.obfsparam)
    }
    params.push('-b')
    params.push(listenHost)
    params.push('-l')
    params.push(localPort)
    if (config.timeout) {
      params.push('-t')
      params.push(config.timeout)
    }
    const command = `python ${params.join(' ')}`
    if (process.env.NODE_ENV === 'development') {
      console.log('run command: %s', command)
    } else {
      logger.debug('run command: %s', command)
    }
    child = runCommand('python', params)
  }).catch(() => {
    alertMessage(`ssr端口 ${localPort} 被占用`)
  })
}

/**
 * 结束command的后台运行
 */
export async function stop () {
  if (child && child.pid) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Kill python client')
    } else {
      logger.log('Kill python client')
    }
    return new Promise((resolve, reject) => {
      treeKill(child.pid, err => {
        if (err) {
          reject(err)
        } else {
          child = null
          resolve()
        }
      })
    })
  }
  return Promise.resolve()
}

/**
 * 根据配置运行python命令
 * @param {Object} appConfig 应用配置
 */
function runWithConfig (appConfig) {
  if (appConfig.ssrPath && appConfig.enable && appConfig.configs && appConfig.configs[appConfig.index]) {
    run(appConfig.configs[appConfig.index], appConfig.ssrPath, appConfig.shareOverLan, appConfig.localPort)
  }
}

// 监听配置变化
appConfig$.subscribe(data => {
  const [appConfig, changed, oldConfig] = data
  // 初始化
  if (changed.length === 0) {
    runWithConfig(appConfig)
  } else {
    if (changed.indexOf('enable') > -1) {
      if (appConfig.enable) {
        runWithConfig(appConfig)
      } else {
        stop()
      }
    } else if (appConfig.enable) {
      if (['ssrPath', 'index', 'localPort', 'shareOverLan'].some(key => changed.indexOf(key) > -1)) {
        runWithConfig(appConfig)
      }
      if (changed.indexOf('configs') > -1) {
        // 只有选中的配置发生改变时才重新运行
        if (!isConfigEqual(appConfig.configs[appConfig.index], oldConfig.configs[oldConfig.index])) {
          runWithConfig(appConfig)
        }
      }
    }
  }
})

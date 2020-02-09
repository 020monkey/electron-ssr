/**
 * pac文件下载更新等
 */
import http from 'http'
import httpShutdown from 'http-shutdown'
import { dialog } from 'electron'
import { readFile, writeFile, pathExists } from 'fs-extra'
import logger from './logger'
import { request } from '../shared/utils'
import bootstrapPromise, { pacPath } from './bootstrap'
import { currentConfig, appConfig$ } from './data'
import { ensureHostPortValid } from './port'
import * as i18n from './locales'
const $t = i18n.default
let pacContent
let pacServer

httpShutdown.extend()

/**
 * 下载pac文件
 */
export async function downloadPac (force = false) {
  await bootstrapPromise
  const pacExisted = await pathExists(pacPath)
  if (force || !pacExisted) {
    logger.debug('start download pac')
    const pac = await request('https://raw.githubusercontent.com/shadowsocksrr/pac.txt/pac/pac.txt')
    pacContent = pac
    return writeFile(pacPath, pac)
  }
}

function readPac () {
  return new Promise(resolve => {
    if (!pacContent) {
      resolve(readFile(pacPath))
    } else {
      resolve(pacContent)
    }
  })
}
let ensurePacPromise = null
/**
 * pac server
 */
export async function serverPac (appConfig, isProxyStarted) {
  if (isProxyStarted) {
    const host = currentConfig.shareOverLan ? '0.0.0.0' : '127.0.0.1'
    const port = appConfig.pacPort !== undefined ? appConfig.pacPort : currentConfig.pacPort || 1240
    try {
      await ensureHostPortValid(host, port)
      pacServer = http.createServer(async (req, res) => {
        if ((req.url || '').startsWith('/proxy.pac')) {
          if (ensurePacPromise == null) {
            ensurePacPromise = downloadPac()
          }
          ensurePacPromise.then(() => {
            return readPac()
          }).then(buffer => buffer.toString()).then(text => {
            res.writeHead(200, {
              'Content-Type': 'application/x-ns-proxy-autoconfig',
              'Connection': 'close'
            })
            res.write(text.replace(/__PROXY__/g, `SOCKS5 127.0.0.1:${appConfig.localPort}; SOCKS 127.0.0.1:${appConfig.localPort}; PROXY 127.0.0.1:${appConfig.localPort}; ${appConfig.httpProxyEnable ? 'PROXY 127.0.0.1:' + appConfig.httpProxyPort + ';' : ''} DIRECT`))
            res.end()
          }).catch((error) => {
            logger.error(error)
          })
        } else {
          res.writeHead(200)
          res.end()
        }
      }).withShutdown().listen(port, host)
        .on('listening', () => {
          logger.info(`pac server listen at: ${host}:${port}`)
        })
        .once('error', err => {
          logger.error(`pac server error: ${err}`)
          pacServer.shutdown()
        })
    } catch (err) {
      logger.error('PAC Server Port Check failed, with error: ')
      logger.error(err)
      dialog.showErrorBox($t('NOTI_PORT_TAKEN', { 'port': port }), $t('NOTI_CHECK_PORT'))
    }
  }
}

/**
 * 关闭pac服务
 */
export async function stopPacServer () {
  if (pacServer && pacServer.listening) {
    return new Promise((resolve, reject) => {
      pacServer.shutdown(err => {
        if (err) {
          logger.warn(`close pac server error: ${err}`)
          reject(new Error(`close pac server error: ${err}`))
        } else {
          logger.info('pac server closed.')
          resolve()
        }
      })
    })
  }
  return Promise.resolve()
}

// 监听配置变化
appConfig$.subscribe(data => {
  const [appConfig, changed, , isProxyStarted, isOldProxyStarted] = data
  // 初始化
  if (changed.length === 0) {
    serverPac(appConfig, isProxyStarted)
  } else {
    if (changed.indexOf('pacPort') > -1 || isProxyStarted !== isOldProxyStarted) {
      stopPacServer().then(() => {
        serverPac(appConfig, isProxyStarted)
      })
    }
  }
})

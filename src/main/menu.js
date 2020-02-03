import { app, Menu } from 'electron'
import { appConfig$, currentConfig } from './data'
import { changeProxy } from './tray'
import * as handler from './tray-handler'
import * as events from '../shared/events'
import { checkUpdate } from './updater'
import { isMac, isLinux } from '../shared/env'
import { sendData } from './window'
import $t from './locales'
let showLinuxMenu = true
/**
 * 渲染菜单
 */
export default function renderMenu (appConfig) {
  // mac需要加上默认的一些菜单，否则没法复制粘贴
  let template
  if (isMac) {
    template = [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ] }, {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    }]
  } else if (isLinux) {
    if (showLinuxMenu) {
      template = [
        { label: $t('MENU_APPLICATION'),
          submenu: [
            { label: $t('MENU_SUB_ENABLE_APP'), type: 'checkbox', checked: appConfig.enable, click: handler.toggleEnable },
            { label: $t('MENU_SUB_COPY_HTTP_PROXY'), click: handler.copyHttpProxyCode },
            { role: 'quit' }
          ] },
        { label: $t('MENU_SYS_PROXY_MODE'),
          submenu: [
            { label: $t('MENU_SUB_NO_PROXY'), type: 'checkbox', checked: appConfig.sysProxyMode === 0, click: e => changeProxy(e, 0, appConfig) },
            { label: $t('MENU_SUB_PAC_PROXY'), type: 'checkbox', checked: appConfig.sysProxyMode === 1, click: e => changeProxy(e, 1, appConfig) },
            { label: $t('MENU_SUB_GLOBAL_PROXY'), type: 'checkbox', checked: appConfig.sysProxyMode === 2, click: e => changeProxy(e, 2, appConfig) }
          ] },
        { label: $t('MENU_PAC'),
          submenu: [
            { label: $t('MENU_SUB_UPDATE_PAC'), click: handler.updatePac },
            { label: $t('MENU_SUB_PAC_MODE'),
              submenu: [
                { label: 'GFW List' },
                { label: 'White List' }
              ]
            }
          ] },
        { label: $t('MENU_SETTINGS'),
          submenu: [
            { label: $t('MENU_SUB_SETTING_OPTIONS'), click: handler.showOptions },
            { label: $t('MENU_SUB_CONFIG_FILE'),
              submenu: [
                { label: $t('MENU_SUB_LOAD_CF'), click: handler.importConfigFromFile },
                { label: $t('MENU_SUB_EXPORT_CF'), click: handler.exportConfigToFile },
                { label: $t('MENU_SUB_OPEN_CF'), click: handler.openConfigFile }
              ]
            },
            { label: $t('MENU_SUB_ADD'),
              submenu: [
                { label: $t('MENU_SUB_ADD_SUB_LINK'), click: () => { sendData(events.EVENT_SUBSCRIBE_NEW) } },
                { label: $t('MENU_SUB_ADD_NODE'), click: createNewConfig },
                { label: $t('MENU_SUB_ADD_FROM_CB') },
                { label: $t('MENU_SUB_ADD_FROM_QR_SCAN'), click: handler.scanQRCode }
              ]
            }
          ] },
        { label: $t('MENU_HELP'),
          submenu: [
            { label: $t('MENU_SUB_CHECK_UPDATE'), click: () => checkUpdate(true) },
            { label: $t('MENU_SUB_DEVS'),
              submenu: [
                { label: $t('MENU_SUB_DEVS_INSPECT_LOG'), click: handler.openLog },
                { role: 'toggleDevTools' },
                { role: 'reload' },
                { role: 'forceReload' }
              ]
            }
            // { label: '项目主页', click: () => { handler.openURL('https://github.com/shadowsocksrr/electron-ssr') } },
            // { label: 'Bug反馈', click: () => { handler.openURL('https://github.com/shadowsocksrr/electron-ssr/issues') } },
            // { label: '捐赠', click: () => { handler.openURL('https://github.com/erguotou520/donate') } },
          ] }
      ]
    }
  }
  template && Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/**
 * 切换是否显示menu
 */
export function toggleMenu () {
  if (isLinux) {
    if (Menu.getApplicationMenu()) {
      showLinuxMenu = false
      Menu.setApplicationMenu(null)
    } else {
      showLinuxMenu = true
      renderMenu(currentConfig)
    }
  }
}
function createNewConfig () {
  sendData(events.EVENT_CONFIG_CREATE)
}
// 监听数据变更
appConfig$.subscribe(data => {
  const [appConfig, changed] = data
  if (!changed.length) {
    renderMenu(appConfig)
  } else {
    if (['enable', 'sysProxyMode'].some(key => changed.indexOf(key) > -1)) {
      renderMenu(appConfig)
    }
  }
})

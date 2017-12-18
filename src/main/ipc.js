import { ipcMain } from 'electron'
import { Observable } from 'rxjs/Observable'
import {
  EVENT_APP_ERROR_RENDER,
  EVENT_APP_HIDE_WINDOW,
  EVENT_APP_SHOW_WINDOW,
  EVENT_RX_SYNC_RENDER
} from '../shared/events'

/**
 * ipc-main事件
 */
ipcMain.on(EVENT_APP_ERROR_RENDER, () => {
  //
}).on(EVENT_APP_HIDE_WINDOW, () => {

}).on(EVENT_APP_SHOW_WINDOW, () => {

})

export const ipc$ = Observable.create(observe => {
  ipcMain.on(EVENT_RX_SYNC_RENDER, data => {
    observe.next(data)
  })
})

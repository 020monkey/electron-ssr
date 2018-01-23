# electron-ssr

## Telegram交流
[![](https://img.shields.io/badge/Telegram-electron--ssr-blue.svg)](https://t.me/electron_ssr)

## 功能特性
- 跨平台 支持Windows MacOS Linux系统
- 功能丰富 支持原版大部分功能，更有更多人性化功能
- 开源 来源于开源，回馈以开源

## 环境要求
- 只需要系统已安装 [python](https://www.python.org/downloads/) 可正常执行`shadowsocksr`的python版即可

## 功能特性
- 支持手动、服务器订阅、二维码扫描、粘贴板复制、配置文件导入等方式添加配置
- 支持切换系统代理模式:PAC、全局、不代理
- 支持配置项变更
- 更多功能尽在任务栏菜单中

## 已知Bug
- Linux中非gnome桌面无法切换系统代理模式，如果你知道如何实现，欢迎发issue告知。

## 应用截图
![](doc/assets/main.jpg)
![](doc/assets/subscribe.jpg)
![](doc/assets/tray.jpg)

## FAQ
[FAQ](./docs/FAQ.md)

## 打赏
[如果觉得本项目对你有所帮助，欢迎打赏](https://github.com/erguotou520/donate)

## 开发和构建

``` bash
# or npm install
yarn

# 开发时
npm run dev

# 打包构建
npm run build

# 单元测试
npm test

# 代码风格检查
npm run lint

```

## ShadowsocksR 参考文档
- [Python client setup (Mult language)](https://github.com/breakwa11/shadowsocks-rss/wiki/Python-client-setup-(Mult-language))
- [Python client setup (Mult language)备份](https://github.com/shadowsocksr-backup/shadowsocks-rss/wiki/Python-client-setup-(Mult-language))
- [SSR QRcode scheme](https://github.com/breakwa11/shadowsocks-rss/wiki/SSR-QRcode-scheme)
- [SSR QRcode scheme备份](https://github.com/shadowsocksr-backup/shadowsocks-rss/wiki/SSR-QRcode-scheme)

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[1c165f7](https://github.com/SimulatedGREG/electron-vue/tree/1c165f7c5e56edaf48be0fbb70838a1af26bb015) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

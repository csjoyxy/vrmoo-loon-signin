# 魔趣 (vrmoo.vip) Loon 自动签到插件

[![Loon](https://img.shields.io/badge/Loon-Plugin-blue)](https://nsloon.app/)

> 🎯 一键安装，全自动签到。在 Safari 中登录一次后永久有效。

## 一键安装

在 Loon 中点击下方链接安装：

```
https://raw.githubusercontent.com/csjoy/vrmoo-loon-signin/main/vrmoo.plugin
```

## 手动配置

如果不使用插件，也可在配置中添加：

```ini
[Script]
http-response ^https://www\.vrmoo\.vip/ script-path=https://raw.githubusercontent.com/csjoy/vrmoo-loon-signin/main/vrmoo-capture.js, tag=魔趣Cookie捕获, requires-body=0
cron "0 8 * * *" script-path=https://raw.githubusercontent.com/csjoy/vrmoo-loon-signin/main/vrmoo-signin.js, tag=魔趣每日签到

[MITM]
hostname = %APPEND% www.vrmoo.vip
```

## 首次使用

1. 安装插件（见上方）
2. Loon → 配置 → MITM → 添加 `www.vrmoo.vip`，安装证书
3. Safari 打开 https://www.vrmoo.vip 并登录
4. 看到「魔趣 - Cookie已捕获」通知即成功
5. 第二天早上 8:00 自动签到

## 文件

| 文件 | 说明 |
|------|------|
| vrmoo.plugin | Loon 插件文件 |
| vrmoo-capture.js | Cookie 自动捕获 |
| vrmoo-signin.js | 每日签到 |

# 魔趣 (vrmoo.vip) Loon 自动签到插件

[![Loon](https://img.shields.io/badge/Loon-Plugin-blue)](https://nsloon.app/)

> 🎯 一键安装，全自动签到。在 Safari 中登录一次后永久有效。

## 一键安装

在 Loon 中点击下方链接安装：

```
https://raw.githubusercontent.com/csjoyxy/vrmoo-loon-signin/main/vrmoo.plugin
```

## 手动配置

如果不使用插件，也可在配置中添加：

```ini
[Script]
http-response ^https://www\.vrmoo\.vip/ script-path=https://raw.githubusercontent.com/csjoyxy/vrmoo-loon-signin/main/vrmoo-capture.js, tag=魔趣Cookie捕获, requires-body=0
cron "0 8 * * *" script-path=https://raw.githubusercontent.com/csjoyxy/vrmoo-loon-signin/main/vrmoo-signin.js, tag=魔趣每日签到

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
| vrmoo.loon.plugin | 抓包分析生成的 JWT 登录版 Loon 插件 |
| vrmoo_signin.js | JWT 登录版每日签到脚本 |

## JWT 登录版

本仓库另附一个根据抓包分析生成的账号密码登录版插件，不依赖 Cookie 捕获。

插件地址：

```text
https://raw.githubusercontent.com/csjoyxy/vrmoo-loon-signin/main/vrmoo.loon.plugin
```

脚本地址：

```text
https://raw.githubusercontent.com/csjoyxy/vrmoo-loon-signin/main/vrmoo_signin.js
```

在 Loon 插件参数中填写：

```text
VRMOO_USERNAME=你的账号邮箱&VRMOO_PASSWORD=你的密码
```

已确认接口：

- 登录：`POST /wp-json/jwt-auth/v1/token`
- 查询签到状态：`POST /wp-json/b2/v1/getUserMission`
- 执行签到：`POST /wp-json/b2/v1/userMission`
- 查询积分：`POST /wp-json/b2/v1/getUserGoldData`

默认每天 08:10 执行一次。该站点有接口频率限制提示，不建议设置高频运行。

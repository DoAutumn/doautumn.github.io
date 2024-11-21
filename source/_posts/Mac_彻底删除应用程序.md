---
title: Mac_彻底删除应用程序
toc: false
date: 2023-01-11 17:42:00
tags:
category: Mac
---
不论是通过Finder还是Launchpad卸载应用程序之后，还需要清除应用程序残留的文件，如首选项、支持文件、缓存、隐藏文件等。这些残留文件，目前通过自己使用的情况来看，即使使用CleanMyMac X也无法清除。不过我们可以通过如下方式达到目的：\
我们只需要在如下目录找到相关目录文件，将其删除即可。
- 应用程序支持文件：`~/Library/Application Support/(App Name)`
- 首选项：`~/Library/Preferences/(App Name)`
- 资料包：`~/Library/Containers/(App Name)`
- 缓存：`~/Library/Caches/(App Name)`

如果某些应用在安装时，自动添加到了 `设置 > 通用 > 登录项 > 允许在后台`，则还需执行如下步骤：
- `cd /Library/LaunchDaemons/`，找到该应用相关的.plist文件，`rm -rf xxx`删除
- `cd /Library/LaunchAgents/`，找到该应用相关的.plist文件，`rm -rf xxx`删除
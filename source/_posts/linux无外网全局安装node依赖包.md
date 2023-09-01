---
title: linux无外网全局安装node依赖包
toc: false
date: 2023-03-27 15:16:36
category: 技术分享
---
- 首先在本地全局安装需要的包`npm i -g http-server`，（注意：本地必须是全局安装），进入全局安装路径，比如我的电脑安装路径在这里：`/usr/local/lib/node_modules/`，
- 在linux上找到node安装路径，进入其`lib/node_modules/`目录下，将上述包上传至该目录下
- 建立软连接以便全局使用命令：
```
ln -s /usr/local/src/nodejs/lib/node_modules/http-server/bin/http-server /usr/local/bin/http-server
```
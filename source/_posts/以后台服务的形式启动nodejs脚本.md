---
title: 以后台服务的形式启动nodejs脚本
toc: false
date: 2023-03-27 15:03:45
tags: [pm2]
category: 技术分享
---
我们都知道，当我们以`node server.js`执行`server.js`服务脚本时，如果`ctrl + c`结束该进程，则对应的服务也就停止了，那如何以后台服务的形式执行该脚本呢？

### 方法一 利用 forever
[forever](https://www.npmjs.com/package/forever)
### 方法二 利用 pm2
[pm2](https://www.npmjs.com/package/pm2)
```
npm install -g pm2
pm2 start server.js   // 启动
pm2 stop server.js    // 停止
pm2 list              // 列出所有服务，包括运行的和停止的
pm2 delete server.js  // 删除该服务
```
### 方法三 利用nodejs自带服务nohub，不需要安装别的包
```
nohup node server.js &
// 存在无法查询日志等问题，关闭终端后服务也就关闭了
```
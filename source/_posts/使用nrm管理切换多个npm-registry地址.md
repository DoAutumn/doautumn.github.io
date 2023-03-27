---
title: 使用nrm管理切换多个npm registry地址
toc: true
date: 2023-03-15 13:14:06
tags: [nrm,npm registry]
category: 技术分享
---
## 前言
大家在工作时可能需要连接公司的私服下载前端依赖，这个时候会把npm的地址设置为公司的私服，但是这样的话自己开发自己的项目所需要的依赖在公司私服上找不到，因此又得重新设置npm下载的地址，因此在这推荐一个插件能够很方便的切换公司私服地址和淘宝镜像地址。

## 一、nrm
nrm（npm registry manager）是npm的镜像管理工具，用来切换npm下载镜像源

## 二、使用步骤
### 1、安装nrm
```
npm i -g nrm
```
安装之后，可通过`nrm ls`查看默认提供的镜像源
```
npm ---------- https://registry.npmjs.org/
yarn --------- https://registry.yarnpkg.com/
tencent ------ https://mirrors.cloud.tencent.com/npm/
cnpm --------- https://r.cnpmjs.org/
taobao ------- https://registry.npmmirror.com/
npmMirror ---- https://skimdb.npmjs.com/registry/
```

### 2、添加registry
```
nrm add topsec http://10.63.78.76/repository/npm-group/
// topsec 为自定义名称
// 成功将会提示：add registry topsec success
```

### 3、切换registry
```
nrm use topsec
// 成功将会提示：Registry has been set to: http://10.63.78.76/repository/npm-group/
```
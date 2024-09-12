---
title: yalc:最好用的前端link调试方案
toc: true
date: 2024-04-08 15:11:34
tags: [yalc]
category: 工具
---
## 一、什么是yalc
对包开发者而言，一种比`yarn/npm link`更好的开发流程。
它的主要对标者就是`yarn/npm link`，它主要解决了一些`yarn/npm link`本身存在的缺陷，满足了包开发者的实际需求。
## 二、yalc的安装
```shell
npm i yalc -g
# or
yarn global add yalc
```
## 三、yalc的基本使用
### 1. yalc publish (发布依赖)
在已经构建完成的包(比如good-ui)中执行
```shell
yalc publish
```
在`yalc publish`后，它会逐一执行npm生命周期脚本，如：`prepublish、prepare、prepublishOnly、prepack`...等。
同时，你也可以通过`--no-script`禁用钩子钩动各种脚本。
### 2. yalc add (添加依赖)
在目标包(比如admin-management)中执行：
```shell
yalc add good-ui
```

现在，你可以在项目中通过
```js
import { Button } from 'good-ui';
```

用到你本地good-ui中的最新代码了！
而且！
admin-management/node_modules中原本依赖的good-ui文件也并没有丢，它们被放到了一个缓存文件中，你可以轻松还原，如下：
### 3. yalc remove (移除依赖)
在admin-management项目中执行：
```shell
yalc remove good-ui
```

嘿！我又重新用上了node_modules中原本依赖的good-ui，而且快如闪电！太完美了！
### 4. yalc push (更新和推送)
没有人能做到一次成功！
如果在你修改了good-ui里的一些代码，你只需要执行：
```shell
yalc publish --push
# 简化为：
yalc push
```

你的最新的包，直接在admin-management中生效了！
甚至能触发了HRM！
## 四、其他
需要注意的是，yalc会把包发布到`~/.yalc/packages`中，如果必要的话，需要定时清理，以免占用过多磁盘空间。
---
title: Lerna学习与使用
toc: true
date: 2023-09-05 10:44:14
tags: [Lerna]
category: 工具
---
## 一、介绍
在学习[wangEditor](/2023/09/01/wangEditor%E5%AD%A6%E4%B9%A0%E4%B8%8E%E4%BD%BF%E7%94%A8/)的过程中，了解到Lerna，这里记录下学习与使用过程。

基本概念就不再赘述了，直接参考[这里](https://lerna.js.org/)。在学习过程中也查阅了部分博文，发现有些朋友不是很清楚这个东西是解决什么问题的，这里举例说明下。

在一个成熟的开发团队中，往往比较注重代码的积累、复用、共享，单就前端来说，一般会积累如下几个开发包：frame、components、charts、utils等等
- **frame**：路由复用策略、路由守卫、HTTP拦截器、国际化、主题。。。
- **components、charts**：和开源的基础组件库、图表库不同，可能是包含一些它们没有的组件、图表，也可能是一些包含通用业务的组件、图表
- **utils**：uuid、deepMerge。。。

这些开发包如果是独立的，也不是不可以，只是管理、使用起来比较麻烦，如果相互之前再有依赖关系的话，那就不是比较麻烦了，而是相当麻烦。那么Lerna就是为了解决这个问题的。同时它还能够根据Git提交记录，自动生成版本号、ChangeLog，省去了繁琐的配置步骤，何乐不为呢？
## 二、基本使用
参考这里的[入门](https://lerna.js.org/docs/getting-started)，很容易初始化一个Lerna工程。
接下来就是创建子包了，可以直接手动创建，比如：
```shell
# 在packages下创建文件夹sub-package
$ cd packages
$ mkdir sub-package
       
# 进入文件夹初始包
$ cd sub-package
$ yarn init
```
或者采用lerna指令创建文件夹并初始化，比如：
```shell
$ lerna create sub-package
```
在我看来，一般我们不会从零初始化一个Lerna工程，现在3大前端框架、webpack、vite等都提供了脚手架，直接一个命令就可以初始化一个前端工程，对应的tsconfig.json、package.json、README.md、angular.json、vue.config.js等都有了，如果要是从一个空的Lerna工程手动新建这些，着实费劲。
所以这里就不过多介绍创建子包之后的操作了，直接进入下一环节。
## 三、在Angular工程中使用Lerna@7
我们都知道，Angular是提供在一个工程中创建多个Library的功能的，只不过这些Library的发包仍然是独立的，版本号、ChangeLog也是需要手动维护的，并不友好。
那么在现有的Angular工程中如何使用Lerna呢？具体步骤如下：
### 1、初始化Angular工程
```shell
$ ng new my-test
```
### 2、新建Library
```shell
$ cd my-test
$ ng g lib my-lib1
$ ng g lib my-lib2
```
### 3、初始化Lerna
```shell
$ lerna init --packages="projects/*"  // Angular管理子包的目录名默认为projects
```
此时会在`my-test`目录下多出一个`lerna.json`文件。
### 4、调整Library配置
Angular默认是将Library打包到工程根目录下的`dist`目录的，这里做个调整，打包到各自的`dist`目录：
```json
// ng-package.json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "./dist",  // 这里
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```
在各自的`package.json`中添加如下内容（具体package.json详解请参考[这里](https://blog.csdn.net/qq_45492057/article/details/115318557)）：
```json
{
  ...
  "repository": {
    "type": "git",
    "url": "git+https://gitee.com/xxxx/my-test.git"
  },
  // 如果不配置，默认就是https://www.npmjs.com/
  "publishConfig": {
    "access": "public",
    "registry": "http://npm:npm@ip:port/nexus/content/repositories/npm-repo/"
  },
  // Lerna默认会将package.json所在目录的所有子内容都发布出去，这里配置只发布dist目录下的内容
  "files": [
    "dist"
  ],
  // 下面的视情况而定
  "main": "dist/bundles/my-lib1.umd.js",
  "module": "dist/fesm2015/my-lib1.js",
  "es2015": "dist/fesm2015/my-lib1.js",
  "esm2015": "dist/esm2015/my-lib1.js",
  "fesm2015": "dist/fesm2015/my-lib1.js",
  "typings": "dist/my-lib1.d.ts"
}
```
### 5、自动生成版本号和ChangeLog
正常开发完代码并`git commit`之后，
```shell
$ lerna version --conventional-commits
```
这将会根据[Git commit规范](/2023/01/11/%E5%85%B3%E4%BA%8Ecommitlint%E5%92%8Chusky%E7%9A%84%E5%AE%89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8/#3%E3%80%81%E5%B8%B8%E7%94%A8%E7%9A%84commit-message%E7%9A%84%E7%B1%BB%E5%9E%8B)生成版本号和ChangeLog，同时会生成Tag并一起推送到远程Git仓。
### 6、发布
```shell
$ lerna publish from-git --yes
```
### 7、安装依赖
~~如果只想给某个子包安装依赖 或者 子包之间有依赖关系，可通过如下命令实现：~~
```shell
$ npm install <dependency> -w <package>
// dependency可以是子包名称，也可以是开源依赖
// package为目标子包名称，是子包的package.json中的name值
```
### 8、2024-08-11更新
Lerna@8版本，已经不需要像步骤7那样执行命令了，正常使用`npm install\uninstall`即可，当安装的是自己的子包时，也无需添加任何额外的参数，Lerna会自动帮我们处理，并且在`node_modules`目录下，子包的目录会通过软链接的形式指向实际的代码目录，就像这样
<img width="300" alt="软链接.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Vue3入门/软链接.png">

更多细节可参考[这里](https://lerna.js.org/docs/legacy-package-management)。

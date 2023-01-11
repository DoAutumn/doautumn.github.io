---
title: 关于commitlint和husky的安装和使用
toc: true
date: 2023-01-11 17:41:55
tags: [Git_hooks,commitlint,husky]
category: 技术分享
---

现在大部分公司和项目用的代码管理工具基本都是git，在一个大的项目组中，会涉及很多的开发人员，这就会面临着频繁的提交代码。规范的提交代码规则会有利于问题的查找和回归，所以提交规范变得尤其的重要。下面我会为大家介绍一下，关于git的代码提交规则的约束工具：commitlint和husky。
<!--more-->

## 一、commitlint [链接](https://commitlint.js.org/)
### 1、安装

`npm i -D @commitlint/cli @commitlint/config-conventional`

### 2、生成commitlint配置文件

项目根目录下执行：

`echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js`

可以在这个文件里设置自定义的git提交message的规则。

### 3、常用的commit message的类型

`build:`编译相关的修改，例如发布版本、对项目构建或者依赖的改动
`chore:`其他修改, 比如改变构建流程、或者增加依赖库、工具等
`ci:`持续集成修改
`docs:`文档修改
`feat:`新特性、新功能
`fix:`修改bug
`perf:`优化相关，比如提升性能、体验
`refactor:`代码重构
`revert:`回滚到上一个版本
`style:`代码格式修改, 注意不是 css 修改
`test:`测试用例修改

## 二、husky [链接](https://typicode.github.io/husky)
husky可以让我们向项目中方便添加git hooks。

### 1、安装

`npm i -D husky`

### 2、编辑package.json > prepare 脚本并运行

`npm pkg set scripts.prepare="husky install"`
`npm run prepare`

此时会在项目根目录下创建一个.husky目录
后续，当别人clone了你的仓(意味着项目根目录下有.git目录)，并执行npm install(无参数)时，husky install命令会自动执行

### 3、添加一个钩子

`npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`

此时会在.husky目录下创建一个commit-msg文件

### 4、测试

`git commit -m "新增了一个xxx功能"`*这样的commit message将会直接报错*
`git commit -m "feat(scope?): 新增了一个xxx功能"`*这样规范的commit message是被允许的*

## 三、根据commit message自动生成changelog
### 1、安装依赖

`npm i -D conventional-changelog conventional-changelog-cli`

### 2、编辑package.json > changelog 脚本

`npm pkg set scripts.changelog="conventional-changelog -p angular -i CHANGELOG.md -s"`

各参数含义：
-p 指定风格
-i 指定输出的文件名称
-s 输出到infile，这样就不需要指定与outfile相同的文件
-r 从最新的版本生成多少个版本。如果为0，则整个更改日志将被重新生成，输出文件将被覆盖。默认值:1
-n ./changelog-option.js 指定自定义配置

### 3、生成changelog

运行命令即可生成changelog

`npm run changelog`

---
最后附上一个开源项目[https://github.com/ng-docs/awesome-angular](https://github.com/ng-docs/awesome-angular)，关于husky的使用，即是从这里学到的。
另外，作者还用到了[prestart、prebuild](https://blog.csdn.net/duansamve/article/details/122644111)钩子，实现了启动、打包项目之前的一些校验工作。
还有，作者还通过nodejs实现了获取文件git提交历史等的相关信息。
后续如果有需要，可以参考。
---
title: Mac_tree命令
toc: false
date: 2023-03-06 13:53:35
category: Mac
---
## Tree命令简介
Tree是一个递归目录列表命令，使用它可以生成一个深度缩进的目录列表，如下形式：
```
├── ngx-planet-master
│   ├── docs
│   │   ├── api
│   │   └── guides
│   ├── examples
│   │   ├── app1
│   │   ├── app2
│   │   ├── common
│   │   └── portal
│   └── packages
│       └── planet
└── tree-2.1.0
    └── doc
```
当我们需要详细介绍每个目录的作用时，这将会很有用。
## Tree命令安装（源码安装）
1、[下载安装包](https://gitlab.com/OldManProgrammer/unix-tree)
2、安装步骤
- `tar -zxvf tree-2.1.0.tgz`
- 进入tree-2.1.0目录，修改tree的配置文件Makefile，将其中61行左右的注释去掉，内容参照如下：
![Makefile部分内容.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_tree命令/Makefile部分内容.png)
- 修改完之后，执行命令：`make`
- 使用管理员身份安装，执行命令：`sudo cp tree /usr/local/bin/`
- 测试使用tree命令：`tree --version`

---

顺便再记录下Linux下安装步骤

1、yum安装
- `yum install tree`

2、源码安装
- `tar -zxvf tree-2.1.0.tgz`
- `cd tree-2.1.0`
- `make install`
- `tree --version`

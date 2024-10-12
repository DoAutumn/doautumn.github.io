---
title: Mac_文件添加到Docker并自定义图标
toc: false
date: 2024-05-10 15:17:40
tags:
category: Mac
---
有些时候我们需要将文件、目录添加到Docker中实现快速访问，默认地，Mac支持将文件、目录添加到Docker的活动区，非活动区是不能添加的，那如何解决呢？
![活动区、非活动区.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_文件添加到Docker并自定义图标/活动区、非活动区.png)

- 1.将文件、目录后缀名改为`.app`即可
- 2.将文件、目录拖入Docker之后记得再改回去

### 自定义图标
- 3.右键文件、目录 -> 显示简介
- 4.复制一个图标之后，点击弹窗中的图标，直接粘贴即可
![粘贴图标.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_文件添加到Docker并自定义图标/粘贴图标.png)

### 设置打开方式
- 5.如果是特殊格式的文件，记得选择对应的打开方式
  - 如`.sh`，选择`终端`即可点击就立即执行脚本
  - 另外在脚本的最后可以添加`exit 0`命令以结束进程
  - 还可以设置`当shell退出时`关闭窗口
  - ![终端设置.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_文件添加到Docker并自定义图标/终端设置.png)
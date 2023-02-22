---
title: Mac_ll命令
toc: false
date: 2023-02-22 11:50:50
tags:
category: MacOS
---
MacOS默认是不支持ll命令的，为此我们需要做一些配置。

- 首先在`~/.base_profile`文件中加入如下命令：
`alias ll='ls -alF'`

- 执行`source ~/.base_profile`命令，使修改生效。

这样就可以使用ll命令了，但每次新打开的终端，ll命令都会失效，还需做如下配置：

- 在`~/.zshrc`文件中加入如下命令：
`source ~/.base_profile`

- 执行`source ~/.zshrc`命令，使修改生效。

若没有 .base_profile 文件或 .zshrc 文件，`touch .base_profile`新建即可。
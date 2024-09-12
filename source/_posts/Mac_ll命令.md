---
title: Mac_ll命令
toc: false
date: 2023-02-22 11:50:50
category: Mac
---
Mac默认是不支持ll命令的，为此我们需要做一些配置。

- 在`~/.zshrc`文件中加入如下命令：
`alias ll='ls -alF'`

- 执行`source ~/.zshrc`命令，使修改生效。

若没有 .zshrc 文件，`touch .zshrc`新建即可。
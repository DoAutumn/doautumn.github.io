---
title: Mac_电源控制
toc: false
date: 2023-09-14 14:04:08
category: Mac
---
Mac电脑默认提供了`优化电池充电`功能，但没用明白，新电脑拿到手之后，不知道什么样的充电频次才能让它暂缓充电至80%。

因此需要借助三方App来实现对电池充电的控制，网上提到较多的是 AlDente 这款软件，但它是收费的。

这里推荐一个[开源软件](https://github.com/actuallymentor/battery#-command-line-version)（不适用Inter芯片的Mac），可以选择安装带界面的版本或终端版本。
我本人用的是终端版本，带界面的版本会在菜单栏另外显示一个电池图标，我不需要。

终端版本的安装命令如下：
```
curl -s https://raw.githubusercontent.com/actuallymentor/battery/main/setup.sh | bash
```

一般来讲是安装不成功的，那么可以直接下载源码，在源码目录路径下执行`./setup.sh`。

安装完之后通过在终端中运行下面的命令来开启限制充电，当电池电量达到80%时就停止充电。
更多相关的命令使用 --help 查看。

```
battery maintain 80
```
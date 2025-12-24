---
title: Mac_全局代理
toc: false
date: 2025-08-19 10:36:39
tags:
category: Mac
---
目前使用 [V2rayU](https://rinki.ink/) 作为自己的FQiang工具，开启之后，浏览器是能够访问 Google 了，但终端还是不能访问，需要在终端中配置代理。

直接配置全局代理
```bash
export all_proxy=http://127.0.0.1:1087  // 这里的IP、Port来自 V2rayU 配置
```
<img width="500" alt="截屏2025-08-19 11.37.58.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_全局代理/截屏2025-08-19 11.37.58.png">

设置完之后，可通过如下命令查看是否生效
```bash
curl https://google.com
```

删除代理
```bash
unset all_proxy
```
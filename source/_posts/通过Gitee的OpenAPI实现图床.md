---
title: 通过Gitee的OpenAPI实现图床
toc: false
date: 2024-09-27 16:20:59
tags: 图床
category: 工具
---

写博客、记笔记时，总会遇到图片上传的问题，如果使用本地图片，那么图片的存储和管理就会变得非常麻烦，所以需要一个图床来存储图片，方便管理和使用。

自己使用过两款图床 App，这里先说下使用感受。

### 1. uPic

uPic 是一款非常优秀的图床 App，支持多种图床，包括七牛云、阿里云、腾讯云等，同时也支持自定义图床。uPic 的界面简洁，操作方便，上传速度也很快。但是，在我的`macOS Big Sur@11.7.10`上配置了 Gitee 图床后，上传图片没反应。我确认配置没有问题，因为同样的配置在 PicGo 上是可以正常上传的。
<img width="250" alt="uPic.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/通过Gitee的OpenAPI实现图床/uPic.png">

### 2. PicGo

PicGo 同样也是一款优秀的开源图床工具，支持多种图床，包括七牛云、阿里云、腾讯云等，同时也支持自定义图床。但是为什么也不使用它呢？因为它的操作比较麻烦，每次上传图片都得打开主窗口，不能在菜单栏直接上传。虽然将图片拖拽到菜单栏上提示可以上传，但松开鼠标没有任何反应。
<img width="250" alt="PicGo.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/通过Gitee的OpenAPI实现图床/PicGo.png">

![PicGo提示可上传.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/通过Gitee的OpenAPI实现图床/PicGo提示可上传.png)

而且上述两款 App 都不支持对图片进行分类。而使用 Gitee 的 OpenAPI 实现图床，就可以通过目录对图片进行分类，方便管理和使用。

### 3. 通过 Gitee 的 OpenAPI 实现图床

Gitee 提供了 OpenAPI，可以用来实现图床功能。下面是使用 Gitee OpenAPI 实现图床的步骤：

1. 在 Gitee 上创建一个公开的仓库，用于存储图片。
2. 获取 Gitee 的 Access Token，用于身份验证。
<img width="600" alt="私人令牌.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/通过Gitee的OpenAPI实现图床/私人令牌.png">
3. 使用 Gitee OpenAPI 上传图片到仓库中。
通过`新建文件` `https://gitee.com/api/v5/repos/{owner}/{repo}/contents/{path}` API，实现图片上传。
4. 使用 Gitee OpenAPI 获取图片的 URL，用于在博客或笔记中使用。
通过`获取仓库具体路径下的内容` `https://gitee.com/api/v5/repos/{owner}/{repo}/contents(/{path})` API 递归读取仓库目录，过滤出图片，并展示到界面。

- 支持直接点击名称复制 Markdown 格式的图片链接 `![图片名称](图片链接)`，也可以按住 Shift 键点击名称复制 img 标签格式的图片链接 `<img width="500" alt="图片名称" src="图片链接">`，也可以按住 Alt 键点击名称只复制图片链接。
- 支持剪贴板上传，将图片复制到剪贴板，直接 `ctrl + v` 即可将图片上传到 Gitee 仓库中。

<img width="600" alt="DoAutumn图床.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/通过Gitee的OpenAPI实现图床/DoAutumn图床.png">
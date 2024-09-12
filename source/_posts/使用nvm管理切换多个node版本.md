---
title: 使用nvm管理切换多个node版本
toc: true
date: 2023-03-10 11:15:43
tags: [nvm,Node版本管理]
category: 工具
---
## 1、Node版本管理工具
node版本管理工具其实有很多，常见的的有nvm、n、fnm。之前一直使用n来管理node版本的，但是忽然有一天发现，安装n之前是需要先安装node的，而先安装的这一版本的node，不在n的管理范畴中，基于这两点原因，放弃了n的使用，转向了nvm。
本文主要记录下nvm的安装步骤和常用命令。
## 2、nvm的安装
网上关于nvm安装的文章也挺多的，大多都是让你执行
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
包括[Github](https://github.com/nvm-sh/nvm)上也是这么写的，但一般由于网络原因，都是不能成功的，即便我开了科学上网，也没能成功。
**所以建议：**
直接从上述Github仓的[Tags](https://github.com/nvm-sh/nvm/tags)里，下载最新版本的zip包，解压之后，运行包里的`install.sh`即可。
然后将如下代码粘贴到你的`～/.base_profile`文件中，保证nvm命令能够正常使用。

```shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

## 3、nvm常用命令

```shell
nvm ls                #列出已安装的node版本
nvm ls-remote         #列出所有可用的node版本
nvm use <version>     #使用指定版本的node
nvm install <version> #安装指定版本的node
nvm current           #显示当前正在使用的node版本
nvm cache clear       #清空nvm缓存
```


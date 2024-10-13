---
title: CentOS安装NodeJS详细教程
toc: true
date: 2024-10-13 21:38:07
tags:
category: Linux
---
### 1. 下载
- 官网下载链接：http://nodejs.cn/download/
- 用wget命令下载
```shell
wget https://nodejs.org/dist/v16.13.0/node-v16.13.0-linux-x64.tar.xz
```

### 2. 解压缩
```shell
tar -xvf node-v16.13.0-linux-x64.tar.xz
mv node-v16.13.0-linux-x64 nodejs
```

### 3. 创建软链接
```shell
ln -s /opt/nodejs/bin/npm /usr/local/bin/
ln -s /opt/nodejs/bin/node /usr/local/bin/
```

### 4. 验证
```shell
node -v
npm -v
```

### 5. 更换npm源
```shell
npm config set registry https://registry.npm.taobao.org
```
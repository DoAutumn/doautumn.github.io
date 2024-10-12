---
title: http-server开启https服务
toc: false
date: 2022-08-17 18:13:39
category: 工具
---
### 问题
直接使用 http-server 命令开启的是 http 服务，在 npmjs 的官网地址中只是看到了 http-server -S 是开启 https 服务的方法，但是我这边直接使用该命令会报如下所示的错误，具体原因是没有证书密钥对文件。
![无证书文件错误.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/http-server开启https服务/无证书文件错误.png)
### 解决方法
- 1、下载安装openssl
- 2、使用以下命令生成一个证书密钥对 key.pem 和 cert.pem，设置有效期约10年（准确地说是3650天）
`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`
- 3、然后就可以起服务了
`http-server -S`

---
下面这个记不清是在什么场景下使用的了
在html的头部加入meta使得所有的资源请求由http请求转成https请求
`<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`
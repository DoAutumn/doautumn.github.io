---
title: Gzip压缩
toc: false
date: 2022-08-10 18:09:24
tags: [Gzip,性能优化]
category: 技术分享
---
开启Gzip压缩功能后，服务对资源进行Gzip压缩后返回，缩小传输文件大小，提升文件传输效率，减少带宽消耗。
#### Spring Boot配置方法
```
#是否开启压缩，默认为false
server.compression.enabled=true
#指定要压缩的MIME type
server.compression.mime-types=text/*,image/*,application/javascript,application/xml,application/x-font-ttf,application/font-woff
```
#### Tomcat配置方法
```
server.xml
<Connector port="8080"
  protocol="HTTP/1.1"
  connectionTimeout="20000"
  redirectPort="8443"
  compression="on"
  compressionMinSize="2048"
  noCompressionUserAgents="gozilla, traviata"
  compressableMimeType="text/*,image/*,application/javascript,application/xml,application/x-font-ttf,application/font-woff"
/>
```
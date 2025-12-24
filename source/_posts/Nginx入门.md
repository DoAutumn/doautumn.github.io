---
title: Nginx入门
toc: true
date: 2025-04-13 22:02:39
tags: [Nginx]
category: 工具
---
Nginx作为一个高性能的HTTP和反向代理服务器，在Web服务器领域有着广泛的应用。本文将介绍Nginx的基本概念、安装、配置和使用。

## 一、Nginx的反向代理
首先，看一张关于正向代理和反向代理的图片

<img width="500" alt="正向代理和反向代理.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Nginx入门/正向代理和反向代理.png"><br>

Nginx 的反向代理是一种常见的网络架构模式，它允许 Nginx 作为中间层，将客户端的请求转发到后端服务器，并将后端服务器的响应返回给客户端。这种模式可以带来许多好处，比如负载均衡、隐藏后端服务器的真实地址、提高性能以及增强安全性。

### 1.1 反向代理的基本原理

在反向代理模式下，Nginx 充当一个“中介”，客户端并不直接与后端服务器通信，而是通过 Nginx 进行间接访问。具体流程如下：
- **客户端发送请求**：客户端（如浏览器）向 Nginx 发起 HTTP 请求。
- **Nginx 接收请求**：Nginx 收到客户端的请求后，根据配置规则决定如何处理该请求。
- **请求转发到后端服务器**：Nginx 将请求转发给后端服务器（例如应用服务器、API 服务等）。
- **后端服务器处理请求**：后端服务器接收到请求后进行处理，并将响应结果返回给 Nginx。
- **Nginx 返回响应**：Nginx 接收到后端服务器的响应后，将其返回给客户端。

在整个过程中，客户端只知道 Nginx 的存在，而不知道后端服务器的具体信息。

### 1.2 反向代理的作用

**1. 负载均衡**
- 当有多个后端服务器时，Nginx 可以将请求分发到不同的服务器上，从而实现负载均衡。这有助于提高系统的可用性和扩展性。
- 示例：
```nginx
upstream backend {
    server server1.example.com;
    server server2.example.com;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

**2. 隐藏后端服务器**
- 客户端无法直接访问后端服务器，只能通过 Nginx 访问。这种方式可以保护后端服务器免受直接攻击。
- 示例：后端服务器的 IP 地址和端口对客户端完全透明。

**3. 缓存**
- Nginx 可以缓存后端服务器的响应内容，减少后端服务器的负载并提高响应速度。
- 示例：
```nginx
proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    location / {
        proxy_cache my_cache;
        proxy_pass http://backend;
    }
}
```

**4. SSL终止**
- Nginx 可以处理 HTTPS 请求，解密后再以 HTTP 协议转发给后端服务器。这样可以减轻后端服务器的加密解密负担。
- 示例：
```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://backend;
    }
}
```

**5. 统一入口**
- 多个后端服务可以通过一个 Nginx 实例对外提供服务。这样可以简化客户端的访问逻辑。
- 示例：
```nginx
server {
    location /api/ {
        proxy_pass http://api_backend;
    }

    location /static/ {
        proxy_pass http://static_backend;
    }
}
```

**6. 安全性和访问控制**
- Nginx 可以对请求进行过滤和限制，例如设置速率限制、IP 黑名单等，从而保护后端服务器。
- 示例：
```nginx
server {
    location / {
        limit_req zone=one burst=5;
        proxy_pass http://backend;
    }
}
```

### 1.3 配置反向代理的关键指令
以下是一些常用的 Nginx 配置指令，用于实现反向代理功能：

- `proxy_pass`
  - 指定请求转发的目标地址。
  - 示例：
  ```nginx
  location / {
      proxy_pass http://backend_server;
  }
  ```
- `proxy_set_header`
  - 设置转发请求时附加的 HTTP 头部信息，通常用于传递客户端的真实 IP 地址等信息。
  - 示例：
  ```nginx
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  ```
- `upstream`
  - 定义一组后端服务器，支持负载均衡。
  - 示例：
  ```nginx
  upstream backend {
      server 192.168.1.101;
      server 192.168.1.102;
  }
  ```
- `proxy_cache`
  - 启用缓存功能，提升性能。
  - 示例：
  ```nginx
  proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m;
  proxy_cache my_cache;
  ```
- `proxy_read_timeout` 和 `proxy_connect_timeout`
  - 设置超时时间，避免长时间等待。
  - 示例：
  ```nginx
  proxy_read_timeout 60s;
  proxy_connect_timeout 10s;
  ```

### 1.4 root 和 alias 区别
`root` 和 `alias` 指令都用于指定服务器静态资源文件的路径，例如 HTML 文件、视频、图片文件等。虽然它们的使用方法比较相似，但有一些关键区别，容易导致混淆。
- root
`root` 指令用于设置请求的根目录。它通常定义在 `server` 或 `location` 块中。`root` 指令会将请求的 URI 附加到指定的根目录路径后面。例如：
```nginx
location /images/ {
   root /var/www;
}
```
在这个例子中，请求 `/images/example.jpg` 将会映射到文件路径 `/var/www/images/example.jpg`(实际路径是 `root值` + `location值`)。
- alias
`alias` 指令用于将请求的 URI 映射到指定的目录。与 `root` 不同，`alias` 指令会将请求的 URI 替换为指定的目录路径。例如：
```nginx
location /images/ {
   alias /var/www/images/;
}
```
在这个例子中，请求 `/images/example.jpg` 同样将会映射到文件路径 `/var/www/images/example.jpg`(实际路径就是 `alias值`)。

## 二、Nginx的安装
### 2.1 [官网下载](https://nginx.org/en/download.html)

### 2.2 安装
由于我是在极空间的 Docker 中安装的，遇到的最大问题就是缺各种依赖，总结下来需要安装的依赖包括：
```bash
yum -y install gcc gcc-c++ automake autoconf libtool make
yum -y install zlib zlib-devel openssl openssl-devel pcre pcre-devel
```

- 检测编译环境并配置安装规则

```bash
// 解压文件
tar -zxvf nginx-1.26.3.tar.gz

// 进入目录
cd nginx-1.26.3

// 检测编译环境并配置安装规则（默认路径一般不去修改）
./configure
```

过程如下：
<img width="500" alt="过程如下.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Nginx入门/过程如下.png">

出现如下信息表示成功：
<img width="500" alt="成功.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Nginx入门/成功.png">

- 编译安装

```bash
make && make install
```

### 2.3 Mac下通过 brew 安装
<img width="500" alt="Mac_Nginx.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Nginx入门/Mac_Nginx.png">

## 三、Nginx常用命令
```base
cd /usr/local/nginx/sbin/
./nginx  启动
./nginx -s stop  停止
./nginx -s quit  安全退出
./nginx -s reload  重新加载配置文件  如果我们修改了配置文件，就需要重新加载。
ps aux|grep nginx  查看nginx进程
```

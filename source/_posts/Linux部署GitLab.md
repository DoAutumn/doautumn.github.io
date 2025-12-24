---
title: Linux部署GitLab
toc: true
date: 2025-12-18 10:42:05
tags: [GitLab]
category: Git
---
## 一、前置条件
在安装之前，有两个依赖需要检查下`openssh-server`和`policycoreutils-python`

检查命令如下：
```bash
rpm -qa | grep -i openssh-server
rpm -qa | grep -i policycoreutils-python
```
如果输入命令回车后，没有输出任何内容，则需要先安装一下。

## 二、下载GitLab
下载地址：[https://packages.gitlab.com/gitlab/gitlab-ce](https://packages.gitlab.com/gitlab/gitlab-ce)，注意操作系统和架构。

## 三、安装GitLab
执行安装命令：
```bash
rpm -ivh gitlab-ce-18.4.6-ce.0.el8.x86_64.rpm
```
如果出现如下图所示，说明 GitLab 已经安装成功。
<img width="500" alt="安装成功.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Linux部署GitLab/安装成功.png">

## 四、配置https
如果不需要`https`访问，本步骤可跳过。

```bash
sudo mkdir -p /etc/gitlab/ssl
sudo chmod 755 /etc/gitlab/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/gitlab/ssl/my-host.internal.key -out /etc/gitlab/ssl/my-host.internal.crt
```
命令可直接复制执行。[官网地址](https://docs.gitlab.com/topics/offline/quick_start_guide/#enabling-ssl)

## 五、配置GitLab
```bash
vi /etc/gitlab/gitlab.rb
```
需要修改的配置有：
```bash
# Update external_url from "http" to "https"
external_url "https://ip"

# Set Let's Encrypt to false
letsencrypt['enable'] = false
```
修改完成之后重载配置文件：
```bash
gitlab-ctl reconfigure
```
此过程较长，耐心等待，中途不要操作。

如果出现如下图所示，说明操作成功。
<img width="500" alt="配置完成.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Linux部署GitLab/配置完成.png">

## 六、查看管理员密码
```bash
cat /etc/gitlab/initial_root_password
```
`/etc/gitlab/initial_root_password`是初始化密码的临时存放地，并且在第一次重新加载配置 24 小时后会被清理。

这个密码要保存好，是 root 用户名的密码，root 用户是最高权限用户。

## 七、访问GitLab
### 7.1 可能出现的问题一
如果无法访问此网站，首先检查防火墙是否开启，如果开启了，要么关闭防火墙，要么开放 GitLab 端口。

开放端口：
```bash
sudo firewall-cmd --permanent --add-port=xxxx/tcp
```
记得重载防火墙：
```bash
sudo firewall-cmd --reload
```

### 7.2 可能出现的问题二
如果界面显示 HTTP 502: Waiting for GitLab to boot，（该界面会每 5s 刷新一次），如果一直显示该状态，则需要检查端口是否被占用。
<img width="500" alt="HTTP 502.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Linux部署GitLab/HTTP 502.png">
```bash
sudo lsof -i:xxxx

# 示例
[root@localhost data]# sudo lsof -i :8080
COMMAND     PID              USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
java      42625              root   27u  IPv6 761981      0t0  TCP localhost:http-alt->localhost:34276 (ESTABLISHED)
java      42625              root   48u  IPv6 635861      0t0  TCP *:http-alt (LISTEN)
prometheu 61064 gitlab-prometheus   14u  IPv4 762993      0t0  TCP localhost:34276->localhost:http-alt (ESTABLISHED)
```
如果端口被占用，要么关闭进程，要么修改上面`/etc/gitlab/gitlab.rb`中配置的端口。

修改端口之后，重新加载 GitLab 配置文件：
```bash
sudo gitlab-ctl reconfigure
```
重启 GitLab：
```bash
sudo gitlab-ctl restart
```
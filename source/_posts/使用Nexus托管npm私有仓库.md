---
title: 使用Nexus托管npm私有仓库
toc: true
date: 2022-09-11 13:51:57
tags: [Nexus,npm私服]
category: 工具
---
## 1.安装Nexus
### 1.1.前置条件
nexus需要运行在jdk1.8及以上环境
### 1.2.下载
链接：[https://pan.baidu.com/s/1r5x6flbkiTgI0MiJVrvq4Q](https://pan.baidu.com/s/1r5x6flbkiTgI0MiJVrvq4Q)，提取码：hsnr
### 1.3.安装
直接解压即可，解压后会有两个目录：
- nexus-3.18.1-01：nexus私服管理界面的容器，内部集成了jetty
- sonatype-work：私服的默认仓库，用于存储索引和组件资源
### 1.4.启动
进入nexus-3.18.1-01/bin/目录，`./nexus run`
### 1.5.访问
浏览器输入http://ip:8081
### 1.6.登录
默认用户名admin，会提示默认密码在安装包的什么位置
*windows虚拟机上的密码改为了Talent123*
### 1.7.Create repository
![创建仓.jpg](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/使用Nexus托管npm私有仓库/创建仓.jpg)
其中，npm（hosted）可设置包的发布策略，是否允许重新发布，如果不允许重新发布，则每次发布包，均需升级版本号
![是否允许重新发布.jpg](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/使用Nexus托管npm私有仓库/是否允许重新发布.jpg)
## 2.CentOS7下将Nexus设置为系统服务
### 2.1.修改nexus启动脚本
修改脚本第14行：`INSTALL4J_JAVA_HOME_OVERRIDE=/root/jdk_1.8.0_231  // jdk安装路径`
否则，可能会出现以下错误：
<img width="460" alt="可能出现的错误.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/使用Nexus托管npm私有仓库/可能出现的错误.png">
### 2.2.配置系统服务
设置软连接：
`sudo ln -s /opt/nexus-3.18.1-01/bin/nexus /etc/init.d/nexus`

采用systemd的方式配置服务
```
cd /etc/systemd/system
vi nexus.service

在nexus.service文件中添加以下内容：
[Unit]
Description=nexus service
After=network.target

[Service]
Type=forking
ExecStart=/opt/nexus-3.18.1-01/bin/nexus start  #nexus的安装目录
ExecStop=/opt/nexus-3.18.1-01/bin/nexus stop
User=root  #系统用户名
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

分别执行以下命令：
```
sudo systemctl daemon-reload #重新加载服务
sudo systemctl enable nexus.service #开启开机自启动服务
sudo systemctl start nexus.service #启动服务
```

---
由于自己是在虚拟机上安装的，本机访问没有问题，但其他主机访问不到服务，故还需做如下配置：
[如何让局域网中的其他主机访问虚拟机](https://www.cnblogs.com/mkl34367803/p/10095055.html)
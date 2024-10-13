---
title: 极空间Docker安装CentOS并开启SSH
toc: true
date: 2024-10-12 22:46:23
tags:
category: 极空间
---
## 前言
购买极空间的目的，一方面是为了方便存储、共享照片、视频、音乐，尤其是宝宝照片，换下来的旧手机、iPad，照片都没有统一的存储位置。iCloud？空间不够。百度网盘？空间方面，应该是之前参加活动，达到了1T，还可以，但下载速度实在是太恶心。而且毕竟是托管到了第三方平台，虽然百度是一家大型互联网公司，但以后谁说得准呢，想当年诺基亚也是响当当的手机厂商，不一样折戟沉沙。

另一方面，利用极空间的Docker可以搭建一台专属服务器，平时搞个测试、部署个Web服务，实在是太方便了。之前尝试过在家里弄了台主机作为服务器，也购买过阿里云的服务器，但一方面不支持移动端、不方便共享，满足不了上面共享照片的需求，另一方面云服务器费用太高，最终都放弃了。

虽然极空间依赖他的App，但内容是存储到自己硬盘里的，即便将来他也成为了诺基亚，理论上只要已安装的App还在，就能使用。再退一步，还可以将硬盘取出来直连接到电脑获取内容。

## 1. 安装CentOS
### 1.1 下载镜像
直接在常用镜像里搜索CentOS下载即可。
<img width="600" alt="下载镜像.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/下载镜像.png">

### 1.2 安装镜像
双击下载好的镜像，开始配置。
极空间的参数设置窗口分8个Tab。我们这里主要设置“基本设置”、“文件夹路径”、“端口”这三个Tab，其余页面保持默认就可以了。

**基本设置**
由于我的极空间是8核16G的，所以这里我就不启用性能限制了。
<img width="600" alt="基本设置.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/基本设置.png">

**文件夹路径**
这里可以这么理解：将CentOS的`/data`目录映射到极空间的`/SATA0/centos`目录，这样在CentOS里就可以通过`/data`目录访问到极空间`/SATA0/centos`目录下的内容。
<img width="600" alt="文件夹路径.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/文件夹路径.png">

**端口**
其实就是做一个端口映射，将极空间的某个端口映射到CentOS的某个端口。这里需要一次性尽量设置多一些，因为后面再编辑的话，它会初始化CentOS，导致之前安装的软件都丢失，不过放到`/data`(映射到极空间目录)的内容不会丢失。
<img width="600" alt="端口.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/端口.png">

## 2. 安装Linux常备组件
首先从极空间Docker官方SSH进入系统，进行设置。进入之后是默认root账户。
<img width="500" alt="SSH登录.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/SSH登录.png">

**安装镜像源和系统下载工具**
```shell
sed -i -e "s|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g" /etc/yum.repos.d/CentOS-* 

yum install -y wget
```

**安装网络工具**
```shell
yum install -y openssh*

yum install -y net-tools
```

**安装密码工具**
```shell
yum install -y passwd
```

**修改密码**
```shell
passwd root
```

## 3. 开启SSH
**修改ssh设置**
首先对系统的ssh设置进行修改（ssh工具就是上文中安装的openssh）。
```shell
vi /etc/ssh/sshd_config
```
<img width="400" alt="打开端口22的监听.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/极空间Docker安装CentOS并开启SSH/打开端口22的监听.png">

**使能ssh**
在正常的使能方法里，直接使用Linux的systemctl工具就可以使能。但是，该工具是需要docker系统的privilege权限的，而且需要在开启docker的时候就赋予权限。而极空间既没有开放命令行操作，也没有开放privilege权限，所以我们也就无法使用命令行在docker开启的时候赋予privilege权限了。因此，我们必须使用其他的方法进行使能。
请按照下面方法进行配置：
```shell
mkdir -p /var/run/sshd

ssh-keygen -q -t rsa -b 2048 -f /etc/ssh/ssh_host_rsa_key -N '' 

ssh-keygen -q -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key -N ''

ssh-keygen -t dsa -f /etc/ssh/ssh_host_ed25519_key -N ''

/usr/sbin/sshd -D & 
```
然后就可以开启ssh工具了。
如果需要确认是否已经开启，可以输入下述指令：
```shell
netstat -antup | grep sshd
```
应该会有以下输出
```shell
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      256/sshd
tcp6       0      0 :::22                   :::*                    LISTEN      256/sshd
```

## 4. 使用SSH工具连接
现在就可以使用比如`Termius`等ssh工具进行连接了。

## 5. 配置`ll`命令
在CentOS中，`ll`命令是`ls -l`的别名，但是默认情况下，CentOS并没有配置`ll`命令。因此，我们需要手动配置一下。
```shell
vi ~/.bashrc
```
在文件末尾添加以下内容：
```shell
alias ll='ls -alF'
```
然后保存并退出，使用以下命令使配置生效：
```shell
source ~/.bashrc
```
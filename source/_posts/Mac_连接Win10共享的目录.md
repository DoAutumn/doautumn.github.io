---
title: Mac_连接Win10共享的目录
toc: false
date: 2023-06-30 22:26:40
category: Mac
---
### 废话不多说，直接上步骤
1、鼠标右键点击此电脑-管理-本地用户和组-用户
![计算机管理.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_连接Win10共享的目录/计算机管理.png)

2、鼠标右击用户-新用户-新建一个用户`（实例中用户名为：laowang，密码自己设置）`，特别注意：`用户下次登录时须更改密码`前的勾必须去掉
![新建用户.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_连接Win10共享的目录/新建用户.png)

3、找到想要共享的文件夹，右击-属性-在弹出的对话框中选择共享-点击共享-在下拉菜单中找到新建的用户，添加用户后，可以修改读写权限，然后点击下面的共享
![设置共享.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_连接Win10共享的目录/设置共享.png)

4、在Mac电脑中，commond + k`（连接服务器）`，输入`smb://ip/目录名称`即可`（ip为Win10电脑IP）`
![Mac连接.png](https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Mac_连接Win10共享的目录/Mac连接.png)
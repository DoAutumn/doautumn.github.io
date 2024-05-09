---
title: VS Code的一些偏好设置
toc: true
date: 2023-02-22 13:45:14
tags: [vscode]
category: 技术分享
---
[VS Code](https://code.visualstudio.com/)作为前端开发的必备神器，其作用自然不必多说。这里记录下个人的使用习惯，免得以后再查。

### 1.颜色主题
使用这个：Monokai

### 2.通过code命令快速启动
如果想在某目录下直接通过`code ./`命令打开vscode，需做如下配置：

打开vscode，command + shift + p，然后输入shell，选择`Install 'code' command in PATH`

### 3.保存全部文件
默认`command + s`只保存当前文件，如果想保存全部文件，需做如下配置：

Preferences ——> Keyboard Shortcuts ——> 找到 Save All Files，将其命令设置为`command + s`即可

### 4.设置缩进为2个空格
Preferences ——> Settings

——> 找到 Tab Size，将值改为2

——> 找到 Detect Indentation，将前边的复选框的勾选取消（配置全局文件为2个空格，不勾选则以前文件不变）

### 5.关闭顶部固定区域
vscode从某个版本开始，在滚动左侧目录树、编辑区代码时，会在顶部保留层级结构，其实不好用，需要将其关闭

Preferences ——> Settings ——> 搜索`sticky` ——> 将其所有复选框均取消即可

---
title: Puppeteer学习与使用
toc: true
date: 2023-09-08 16:46:40
tags: [Puppeteer,无头浏览器]
category: 技术分享
---

> 对Puppeteer的学习并没有深入，只是项目中用到了，这里记录下使用过程中的几个问题

## 一、背景

项目需求还是和富文本编辑器、报告有关，具体流程可描述为：在界面通过富文本编辑器编辑了一篇周报，周报中包含一些配置了如何获取数据的统计数值占位符、图表，将这样一串富文本提交给服务端并设置好定时任务，服务端周期性的获取最新数据替换占位符，填充到图表并渲染截图，最后生成PDF格式的报告。

对于服务端如何渲染图表并截图，记录下实现方案。

## 二、技术方案与选型

如果图表使用ECharts的话，它本身就是支持[服务端渲染](https://echarts.apache.org/handbook/zh/how-to/cross-platform/server)的，但很可惜，我们有些图表是自己开发的，使用Dom实现的，比如下面这样一个图表，用数据驱动*ngFor反而更简单，当然问题就是不能适配服务端渲染。
![条形排行](https://foruda.gitee.com/images/1694167312302368634/7d94bd40_358662.png "WX20230908-180028@2x.png")

好在无头浏览器的实践方案能够解决这个问题。

由于另一个团队有过相关经验，他们使用的是[PhantomJS](https://phantomjs.org/)，所以一开始也是奔着这个去调研的。后来才发现，它已经停更了，所以果断放弃，转向了[Puppeteer](https://puppeteer.bootcss.com/)。

## 三、问题记录

### 1、跳过下载浏览器

有两种方式：

```
npm i puppeteer-core
或
npm i puppeteer --PUPPETEER_SKIP_DOWNLOAD  // 这种方式是文档中没提到的
```

### 2、指定浏览器

跳过下载浏览器之后，如何指定已经安装的浏览器呢？通过`chrome://version`可查询Chrome的可执行文件路径
![可执行文件路径](https://foruda.gitee.com/images/1694167348279353215/0569c455_358662.png "WX20230908-175258@2x.png")

```
const browser = await puppeteer.launch({executablePath: '上图中的可执行文件路径'});
```

### 3、打开本地HTML文件

```
await page.goto('file:///Users/xxxx/Desktop/puppeteer/index.html');
```

### 4、访问window

```
// 在puppeteer中也是可以直接访问window对象的，比如在index.html中给window设置了变量或方法，在puppeteer中是可以直接调用的
await page.evaluate(() => {
  console.log(window.testFun());
});
```

### 5、window监听事件

```
// 如果想使用window监听打开的页面中派发的事件，则应该这样
await page.evaluateOnNewDocument(() => {
  window.addEventListener('eventName', () => {
    // your code
  });
});
```
---
title: 第一个基于Electron的小工具Stock
toc: true
date: 2024-12-27 10:26:31
tags: [Electron, node-canvas]
category: Electron
---
## 起因
对于上班族来说，怎么能够更隐蔽的盯盘而不被领导发现呢？那自然是所占屏幕的空间越小越好了。像我这种门外汉，其实不需要太多的功能，只需要能够实时查看股票的最新价格、涨跌情况即可，最好是能够随时一眼就能看到的。

## 其它工具
- Mac自带的[股市]，可以添加到通知栏，但缺点也很明显，每次查看都需要点开通知栏，而且刷新频率太低，不满足实时监控的需求。
- [股票菜单栏](https://apps.apple.com/cn/app/%E8%82%A1%E7%A5%A8%E8%8F%9C%E5%8D%95%E6%A0%8F/id1557874999?mt=12)，这个工具可在系统菜单栏实时显示股票行情信息，是个很不错的选择，但需要付费，好在不贵，¥38。
- [StockBar](https://apps.apple.com/cn/app/stockbar/id1507725651?mt=12)，相比上一个工具，这个工具只是在菜单栏显示了个图标，还得点击才能查看，有点麻烦，而且也要付费，¥28。
- [VS Code 插件 Stock Bar](https://github.com/Chef5/stock-bar.git)，这个工具其实很不错，可以在 VS Code 的状态栏实时显示股票行情信息，但正如其名，必须打开 VS Code 才能使用。
<img width="400" alt="股票菜单栏.webp" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Electron/股票菜单栏.webp">
<img width="400" alt="StockBar.webp" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Electron/StockBar.webp">
<img width="400" alt="VS Code 插件.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Electron/stock-bar-plugin.png">

## 程序员的自我修养
没一个满意的，作为一名程序员，这怎么能忍？于是乎，我决定自己动手，写个和 股票菜单栏 功能类似的工具。

不过我并没有接触过 Swift 和 Objective-C，只是之前听说过使用 Electron 可以开发跨平台桌面应用，所以那就研究一下 Electron 吧。

## Electron
- [中文网站](https://electron.nodejs.cn/)
- [Electron + Vue3 开发跨平台桌面应用【从项目搭建到打包完整过程】](https://juejin.cn/post/6983843979133468708)

如果出现安装 Electron 失败的情况，可以尝试使用下面的镜像：
```bash
# 1、打开npm的配置文件
npm config edit

# 2、在打开的配置文件空白处将下面几个配置添加上去，注意如果有原有的这几项配置，就修改
registry=https://registry.npmmirror.com
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

而想要将内容显示在菜单栏，则需要用到 [Electron Tray](https://electron.nodejs.cn/docs/latest/tutorial/tray)。Tray 可以在菜单栏显示一个图标，也可以显示文字，就像这样：
```javascript
let tray

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath('path/to/asset.png')
  tray = new Tray(icon)
  tray.setTitle('Hello World')
})
```

通过上面这种方式显示到菜单栏的文字，是白色的，不能自定义颜色，这当然不符合我们的需求，股票的涨跌肯定是要用不同颜色表示的嘛。

既然 Tray 是将一个 png 图标显示到菜单栏的，那我们能否通过 Canvas 生成一个 png 然后显示到菜单栏呢？如果可以的话，那就可以使用 Canvas 绘制任意的文字了。

通过 Electron 执行 javascript 创建 Tray 并显示到菜单栏，这个过程其实是没有浏览器环境的，window 和 document 对象都是不存在的，所以不能直接使用 Canvas，需要使用 node-canvas。

## node-canvas
[node-canvas](https://github.com/Automattic/node-canvas) 是在 Node.js 上的一套 Canvas 实现，它提供了跟浏览器中 Canvas 几乎一致的接口。

如果安装 canvas 报错，可以参考这里：[详细记录一次npm i canvas报错的解决过程](https://juejin.cn/post/6844903774603968525)，我只遇到了 `pkg-config: command not found` 这一个错误，还比较幸运。

接下来就是绘制内容的代码了：
```javascript
function createImage(text, color) {
  text = text || ''
  color = color || '#fff'

  if (!cvs) {
    cvs = createCanvas(144, 48)
    ctx = cvs.getContext('2d')
    ctx.font = '15px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  }
  ctx.clearRect(0, 0, cvs.width, cvs.height)
  ctx.fillStyle = color
  ctx.fillText(text, cvs.width / 2, cvs.height / 2 + 1)
  return nativeImage.createFromDataURL(cvs.toDataURL('image/png', 1.0))
}

let tray

app.whenReady().then(() => {
  tray = new Tray(createImage('Hello World', '#fff'))
})
```

## 获取股票数据
进行到这里，还有一个关键问题，就是从哪能获取到股票数据呢？我选择了 [新浪股票](https://finance.sina.com.cn/stock/)。

[如何获取新浪财经的股票实时数据](https://www.cnblogs.com/zeroes/p/sina_stock_api.html)

## 遗留问题
- 使用 Canvas 绘制的图片显示到菜单栏之后，文字比较模糊，和将其作为纹理显示到 Threejs 中是一样的，但是因为没有浏览器环境，所以常规的抗锯齿、通过 style 放大尺寸等方法都不好使，不知道有没有什么好的解决方案。
- 使用 Electron 构建之后的程序包也太大了点，就这么一个小工具，不使用 node-canvas 的情况下，有 180 多 MB，使用 node-canvas 之后，有 200 多 MB，这着实有点过分了。
---
title: 仿MacOS的后台管理系统
toc: true
date: 2023-01-13 14:09:06
tags: [WebOS,MacOS,后台管理系统]
category: 技术分享
---
## 前言
目前比较流行的开源后台管理系统[NG-ALAIN](https://ng-alain.com/en)、[Ant Design Pro](https://pro.ant.design/)、[Vue-Element-Admin](https://panjiachen.github.io/vue-element-admin-site/zh/)、[Jeecg Boot](http://boot.jeecg.com/)等，其页面布局基本都是如下形式：
<img width="500" alt="图1 常见布局" src="https://foruda.gitee.com/images/1675924467881077922/4994c85f_358662.png">
诚然，这种形式并非不好，但看的多了，难免视觉疲劳。

其实导航、菜单、Tab的设计，无非是为了用户能够更快捷的进入某个特性模块，而特性模块大多是相对独立的，如用户管理、资产管理、系统设置，可以近似看作是一个个独立的App。如果按照这个角度继续思考，那我们为什么不能参考操作系统的布局、交互，设计我们的系统、页面呢？而提到操作系统，MacOS无疑是翘楚之作，于是一款仿MacOS的后台管理系统的前端解决方案便应运而生了，暂且给它起个WebOS的名字吧。

体验地址：[https://doautumn.github.io/web-os](https://doautumn.github.io/web-os)
> 该解决方案并未投入实战，只是用作学习与交流，欢迎感兴趣的小伙伴留言支持。
## 技术实现
技术栈：Angular13 + NG-ZORRO13
### 1.基本布局
基本布局部分比较简单，顶部MenuBar、中间Content、底部Dock。
<img width="500" alt="图2 MacOS布局" src="https://foruda.gitee.com/images/1675924583486574320/d4685efd_358662.png">
### 2.Window
不管是MacOS还是Windows，都是以窗口来呈现应用程序内容的，用户也都习以为常。那如果在Web端也采用这种形式，效果将会如何呢？目前我也没有答案。不过我是持乐观态度的，而且我还为WebOS设计了一种`键盘独占`的交互模式（这将在下文讲到），我相信在这种模式的加持下，用户的满意度应该是比较高的。

下面来聊一聊Window的具体实现方案。
#### 2.1 公开的属性、事件
在做这种开发套件时，我一般首先考虑的是开发人员该如何使用我们提供的基础组件、服务。对于一个窗口而言，首先想到的需要开发人员干预的只有两项内容：`title和content`。进一步思考，当窗口处于非活动或最小化状态时，我们希望开发人员能够关注下性能，毕竟如果窗口打开过多，如何保证页面不卡顿将会是一件非常有必要的事情。为此我们需要提供两个状态切换事件：`active和inactive`，当窗口处于上述某种状态时，可以考虑暂停定时器、暂停持续的渲染动画等非必要的性能开销。对开发人员公开的内容除上述4项之外，还会有一些其他细节项，如`minimizable（是否能够最小化）、maximizable（是否能够最大化）、style（默认位置尺寸）`等。

使用Window的伪代码：
```
<mz-window mzTitle="这是一个标题" (active)="handleActive()" (inactive)="handleInactive()">
  your code
  ...
</mz-window>
```
内部实现的伪代码：
```
// window.component.ts

@Component({
  selector: 'mz-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.less']
})
export class WindowComponent implements OnInit, OnDestroy {

  @Input() mzTitle: string;
  @Input() minimizable: boolean = true;
  @Input() maximizable: boolean = true;
  @Input() style: any;

  @Output() active = new EventEmitter();
  @Output() inactive = new EventEmitter();

}

// window.component.html

<div class="window">
  <div class="title">
    <span>{{ mzTitle }}</span>
  </div>
  <div class="content">
    <ng-content></ng-content>
  </div>
</div>
```
#### 2.2 窗口的通用逻辑
对于窗口的打开、关闭、最大化、最小化、拖拽、窗口切换等通用逻辑，都由框架统一实现即可。

**窗口与路由的关系**

而在实现上述功能之前，有一个关键问题需要解决。我们都知道，在基于Angular、Vue、React框架的前端工程中，开发一个中大型的后台管理系统，路由是不可或缺的基础功能。但正如前言中提到的，常见的开源后台管理系统，其主视区只显示当前路由对应的内容，如果我们在主视区想要显示多个窗口，是否意味着将不能再使用路由来组织我们的窗口？好在基于以往的开发经验，答案是否定的。在Angular、Vue中分别有对应的[路由复用策略](https://angular.cn/api/router/RouteReuseStrategy)与[keep-alive](https://cn.vuejs.org/guide/built-ins/keep-alive.html#keepalive)可以实现页面缓存（React貌似没有，好多年没用过了），我们可以借助此技术实现多个窗口的同时呈现。

具体来讲，我们需要将路由和Window进行关联，也即一个Window对应一个路由（Window在初始化之后会暂存其对应的路由URL），同时开启路由复用，当切换路由时，将缓存的路由快照对应的视图层插入到主视区即可。
<img width="800" alt="图3 路由复用与多窗口" src="https://foruda.gitee.com/images/1675924756031355629/ad3c0063_358662.jpeg">

**非活动状态窗口的激活**

我们知道，在操作系统中点击非活动状态窗口的任意位置，都能使其处于活动状态，且不触发其内部逻辑，如下所示，点击`Wiki`并不会直接进入Wiki页面，而只是将浏览器前置使其处于活动状态。
<img width="650" alt="图4 窗口激活" src="https://foruda.gitee.com/images/1675925306171089912/bab3c306_358662.gif">
为了实现该效果，当窗口处于非活动状态时，给其设置一个透明遮罩层，点击窗口其实是点击的是遮罩层，触发的动作也仅仅只是路由的跳转，这也算是一个取巧的方案吧。

**窗口的最小化**

目前我们还没有实现MacOS最小化窗口的神奇动画效果的技术方案，暂且实现了缩放的动画效果，和MacOS类似，窗口缩放之后会以缩略图的形式暂存到Dock中。那如何生成窗口的缩略图呢？或者是否可以将窗口直接缩放至Dock中？经过综合考虑，我们希望窗口和Dock尽量是解耦的，所以还是采用了生成缩略图的方案，因为Dock本身也是支持设置图标的，这样只需创建一个Dock对象并将缩略图、窗口标题带上即可。
`new DockItem().init({ name: title, iconPath: image, path: routePath })`

至于缩略图的生成，则是使用了`html2canvas`。
<img width="650" alt="图5 窗口最小化" src="https://foruda.gitee.com/images/1675930518987025990/7f962a02_358662.gif">

### 3.Dock
Dock的实现，有两个问题需要解决，一是单个应用程序图标（这里我们称之为DockItem吧）和Window的关联，二是丝滑的动画效果。

关于DockItem和Window的关联，其实比较简单，上文已提到，Window和路由是一一对应的，那只需将DockItem和路由也做关联即可。只不过DockItem和路由并非一一对应，而是一个DockItem对应一个一级路由，包含若干个子路由。
```
// 定义DockItem
{
  "apps": [
    {
      "name": "VSCode",
      "iconPath": "./assets/app-icons/vscode.svg",
      "path": "demo1"
    },
    {
      "name": "Webstorm",
      "iconPath": "./assets/app-icons/webstorm.svg",
      "path": "demo2"
    },
    {
      "name": "Chrome",
      "iconPath": "./assets/app-icons/chrome.svg",
      "path": "demo3"
    }
  ]
}

// 一级路由
const routes: Routes = [
  {
    path: '',
    component: WebOSLayoutComponent,
    children: [
      {
        path: 'demo1',
        loadChildren: () => import('./views/demo1/demo1.module').then(m => m.Demo1Module)
      },
      {
        path: 'demo2',
        loadChildren: () => import('./views/demo2/demo2.module').then(m => m.Demo2Module)
      },
      {
        path: 'demo3',
        loadChildren: () => import('./views/demo3/demo3.module').then(m => m.Demo3Module)
      }
    ]
  }
];
```

对于Dock丝滑的放大效果，这里实现的并不足够细致，就不详细阐述了，无非是动画处理scale、margin等样式，感兴趣的可以查看源码。
<img width="650" alt="图6 Dock" src="https://foruda.gitee.com/images/1675930533918274855/55c98167_358662.gif">
另外，推荐下[Steven](https://juejin.cn/post/6942325271349592100)实现的效果，很丝滑。

## 如何使用
计划将其作为基础开发包发布到npm，但由于还有一些功能暂未完成，如`键盘独占`、`国际化`等，故还需等待时日。
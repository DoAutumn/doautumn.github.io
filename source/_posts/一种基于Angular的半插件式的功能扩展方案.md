---
title: 一种基于Angular的半插件式的功能扩展方案
toc: true
date: 2023-03-03 14:39:50
tags: [Angular,插件,License]
category: 技术分享
sticky: 7
---
## 前言
为什么说是半插件式的呢？因为它并不像`比如Chrome浏览器安装扩展程序`那样，可以在线安装。但是它又基本上能够达到插件的效果，也即如果附带了某个功能模块，则该功能可以正常使用，如果不带对整个产品也没有任何影响，所以就叫它半插件式吧。

## 背景
我们产线在产品化的过程中，对前端基础框架提出了这样一个要求，需要提供一个基础版本、一个扩展版本，扩展版本包含一些额外的功能，比如不想开放给其他产线的高级功能。其实像这种功能模块的授权控制，一般都会采用License（[软件离线许可License实现原理](https://juejin.cn/post/7140328102709690398)、[软件License设计思路与实现方案](https://blog.csdn.net/chengpei147/article/details/116259117)）的设计方案，比如CleanMyMac，免费版只能使用有限的功能，购买之后才能解锁全部功能。

但是我们想要实现的目标和License授权控制还是有些差别的，具体表现为：
- 我们的高级功能始终不会对外提供，也就意味着我们不想在打包之后的代码里能够看到关于高级功能的任何代码
- 我们需要提供两个开发包，一个对内，一个对外，不能让其他产线知道我们有内部开发包

## 方案预选
按照以往偷懒式的开发习惯，一般会有两种解决方案：

方案一：通过配置属性控制
缺点：
- 需要人为干预，每次发版都需要人为的修改属性值，基础版改为这个值，扩展版改为那个值。。。
- 功能的隐蔽性不够好，一旦别人知道了这个配置属性，意味着对应的功能直接就暴露出去了，而且高级功能的代码肯定也都打进包里了
- 代码的可维护性不够好，引入的控制变量可能会越来越多，有控制这个功能的，有控制那个功能的。。。
- 不具备可扩展性，如果想再增加一个功能，只能修改现有代码

方案二：开启两个代码分支
缺点：
- 通用功能的代码同步将会比较麻烦

显然这两种方案都不能够令人满意，好在前期有微前端开发经验的积累，很快想到了第三种方案：
`在启动AppModule时将所需功能模块注入到应用程序中，动态设置路由、创建组件`

## 实现思路
关于Angular的依赖注入，可以参考这里：[Angular依赖注入介绍](https://www.jianshu.com/p/4b10948d456c)、[Angular依赖注入教程](https://www.jianshu.com/p/49bbd4a0c16b)
### 1.不同的模块，如何保证能够统一的解析加载运行？
为了保证应用程序在动态加载扩展功能模块时能够有统一的处理逻辑，抽象出一个扩展类`Advanced`，包含该模块的路由路径path、模块名称label、默认显示到界面的组件component、其他信息，所有模块都继承`Advanced`
```
export abstract class Advanced {
  static component: any;
  static path: string;
  static label: string;
}
```
```
@NgModule({
  declarations: [
    Demo3Component,
    IconComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: Demo3Component }])
  ]
})
export class Demo3Module extends Advanced { }

Demo3Module.component = IconComponent;
Demo3Module.path = 'demo3';
Demo3Module.label = '消息中心';
```

### 2.有了Module，如何注入给应用程序？注入之后通过什么获取到注入的Module？
自定义一个依赖注入令牌`AdvancedToken`，用于注入、获取Module
```
export const AdvancedToken: InjectionToken<Advanced> = new InjectionToken('AdvancedToken');
```

### 3.代码如何实现？
注入代码：
```
const list = [
  { provide: AdvancedToken, useValue: Demo3Module }  // 当然这里可以注入多个
];
if (environment.version === 'basic') list.length = 0;

platformBrowserDynamic(list)
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```
获取代码：
```
// 在基础版里，如果获取不到注入的module，则直接return，也就意味着基础版里没有扩展的功能模块
try { module = this.injector.get(AdvancedToken) } catch (error) { };  // 如果上面注入的是多个，则这里获取到的是一个集合
if (!module) return;
```

### 4.代码如何抽离？
通过上述3步，其实Demo3Module的代码还是被打进了基础版的最终代码里，也就是说，虽然`if (environment.version === 'basic') list.length = 0;`这行代码把集合置空了，但那是执行态的事，打包时并没有识别，因此Demo3Module也就被包含进去了。

既然这样，那我们可以参考`environment.ts`的形式新增一个`main.basic.ts`，在打包时动态替换掉`main.ts`即可，具体步骤包括：
1、新增main.basic.ts
```
platformBrowserDynamic().bootstrapModule(AppModule)  // 不包含任何注入的Module
  .catch(err => console.error(err));
```

2、tsconfig.app.json中添加main.basic.ts
```
{
  ...
  "files": [
    "src/main.ts",
    "src/main.basic.ts",
    "src/polyfills.ts"
  ],
  ...
}
```

3、angular.json中配置basic打包参数
```
"basic": {
  ...
  "fileReplacements": [
    {
      "replace": "src/main.ts",
      "with": "src/main.basic.ts"
    }
  ]
  ...
}
```

4、package.json中配置basic打包命令
```
"scripts": {
  "build": "ng build",
  "build:basic": "ng build --configuration=basic"
}
```

## 最终代码
[https://github.com/DoAutumn/like-plugin](https://github.com/DoAutumn/like-plugin)
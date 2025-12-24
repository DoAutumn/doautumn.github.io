---
title: 微前端之 @worktile/planet 实现方案
toc: true
date: 2024-11-08 19:10:17
tags: [worktile/planet]
category: 微前端
---
## 什么是微前端
> Techniques, strategies and recipes for building a **modern web app** with **multiple teams** that can **ship features independently**. -- [Micro Frontends](https://micro-frontends.org/)
> 微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：
- 技术栈无关
  主框架不限制接入应用的技术栈，微应用具备完全自主权
- 独立开发、独立部署
  微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
- 增量升级
  在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
- 独立运行时
  每个微应用之间状态隔离，运行时状态不共享

微前端架构旨在解决单体应用在一个相对长的时间跨度下，由于参与的人员、团队的增多、变迁，从一个普通应用演变成一个巨石应用([Frontend Monolith](https://www.youtube.com/watch?v=pU1gXA0rfwc))后，随之而来的应用不可维护的问题。这类问题在企业级 Web 应用中尤其常见。

更多关于微前端的相关介绍，推荐大家可以去看这几篇文章：
- [Micro Frontends](https://micro-frontends.org/)
- [Micro Frontends from martinfowler.com](https://martinfowler.com/articles/micro-frontends.html)
- [可能是你见过最完善的微前端解决方案](https://zhuanlan.zhihu.com/p/78362028)
- [微前端的核心价值](https://zhuanlan.zhihu.com/p/95085796)

---
举一个具体的例子，假如一个 Web 应用有 N 多个功能模块，比如有数据管理、大屏配置、流程编辑、安全报告，每个模块自身其实已经很复杂了，如果放到一个工程里，并且是由一个团队负责，那倒也问题不大，顶多就是打包慢一点。但如果是由不同的团队负责，并且每个模块又需要独立发布，独立部署，那么这种情况下，微前端架构就显得尤为重要了。

在了解到微前端架构之前，我们甚至尝试过将各个功能模块构建为依赖包，然后由一个独立的、类似 Portal 的工程安装这些依赖包，通过路由来加载这些模块。这种方案虽然能够在开发态将各个模块独立开来，但在生产环境其实还是将所有模块打包到一起了，倘若一个模块出现问题，还是需要将所有模块一并打包更新，独立发布、部署的核心问题还是没有解决。

## [qiankun](https://qiankun.umijs.org/zh)
> 可能是你见过最完善的微前端解决方案🧐

关于 qiankun 的使用，详见 [微前端之 qiankun 实现方案](/2025/12/23/微前端之qiankun实现方案/#四、启动测试)。

## [Planet](http://planet.ngnice.com/)
> Angular 框架下无懈可击的微前端框架和一体化解决方案

由于公司的技术栈是 Angular，所以选择了它。对于较早版本(如@worktile/planet@12、@worktile/planet@13)，他们团队并没有提供链接中如此详细的帮助网站，只能依赖 README 和源码摸索使用，中间踩了不少坑，所以记录下早期版本的使用步骤。

这里以 Angular@13 为例，使用 Angular CLI 初始化工程。

### 一、初始化工程并安装相关依赖
```shell
ng new portal --routing -S -g --style=less
ng g app1 --routing -S --style=less  // Angular 本身支持在一个工程中创建多个应用，这里的 app1 app2 为子应用名称，后面会用到
ng g app2 --routing -S --style=less

npm i @worktile/planet@13 --save
npm i @angular-builders/custom-webpack@13 webpack-assets-manifest@5 --save-dev
```

### 二、主应用配置
#### 1. 标记是否为集成环境
我们期望子应用在开发时，能够独立运行，能够显示各自子模块对应的导航菜单，比如数据管理子应用，还包含数据库管理、文件系统管理等，在本地开发时，如果只能通过地址栏输入 URL 切换页面，那就太麻烦了。

而当子应用被 Portal 集成时，子应用的导航菜单将不再显示，而是由 Portal 统一提供。所以我们需要一种方式，让子应用知道当前是否被集成到 Portal 中，从而决定是否显示导航菜单。

为此，我们在 Portal 中创建一个全局变量 `window.__POWERED_BY_PLANET__`，值为 true，表示当前是集成环境。当子应用开始运行时，通过该变量判断当前环境，从而决定是否显示导航菜单（子应用单独启动时是获取不到该变量的，因为它是在 Portal 中定义的）。
```ts
// src/main.ts
...

(window as any).__POWERED_BY_PLANET__ = true;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```
#### 2. 配置路由
`@worktile/planet` 采用主应用和子应用互相同步路由的方式实现页面切换，当进入子应用路由时，主应用其实是没有对应的路由信息的，所以需要导航到空白页面，然后由子应用接管路由显示对应的页面。
```ts
// src/app/app.module.ts
...

const routes: Routes = [
  {
    path: '**',  // 重点是这里
    component: EmptyComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxPlanetModule,  // 同时这里引入了 NgxPlanetModule
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
#### 3. 注册子应用
```ts
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Planet, SwitchModes } from '@worktile/planet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  get loadingDone() {
    return this.planet.loadingDone;
  }

  constructor(
    private planet: Planet
  ) { }

  ngOnInit() {
    this.planet.setOptions({
      switchMode: SwitchModes.coexist,
      errorHandler: error => {
        console.error(`Failed to load resource, error:`, error);
      }
    });

    this.planet.registerApps([
      {
        name: 'app1',
        hostParent: '#app-host-container',
        routerPathPrefix: '/app1/',
        resourcePathPrefix: '/app1/',
        preload: true,
        scripts: [
          'main.js',
          'polyfills.js'
        ],
        styles: [
          'styles.css'
        ],
        manifest: '/app1/assets-manifest.json'
      },
      {
        name: 'app2',
        hostParent: '#app-host-container',
        hostClass: 'thy-layout',
        routerPathPrefix: '/app2/',
        resourcePathPrefix: '/app2/',
        preload: true,
        scripts: [
          'main.js',
          'polyfills.js'
        ],
        styles: [
          'styles.css'
        ],
        manifest: '/app2/assets-manifest.json'
      }
    ]);

    // start monitor route changes
    // get apps to active by current path
    // load static resources which contains javascript and css
    // bootstrap angular sub app module and show it
    this.planet.start();
  }
}
```
#### 4. 配置子应用菜单、容器
```html
<!-- src/app/app.component.html -->
<nav>
  <a [routerLink]="['/app1/test']" routerLinkActive="active">应用1</a>
  <a [routerLink]="['/app2/test']" routerLinkActive="active">应用2</a>
</nav>
<router-outlet></router-outlet>
<div id="app-host-container"></div>
<div *ngIf="!loadingDone">加载中...</div>
```
#### 5. 配置代理，方便开发
```js
// 根目录下新增文件 proxy.conf.js，内容如下：
const PROXY_CONFIG = {
  "/app1": {
    "target": 'http://localhost:3000',
    "secure": false
  },
  "/app2": {
    "target": 'http://localhost:3100',
    "secure": false
  }
}

module.exports = PROXY_CONFIG
```

### 三、子应用配置
#### 1. 修改程序入口
前面提到我们期望子应用在开发时，能够独立运行，所以不能直接使用 `@worktile/planet` 提供的如下方法：
```ts
defineApplication('app1', (portalApp: PlanetPortalApplication) => {
  return platformBrowserDynamic([
    {
      provide: PlanetPortalApplication,
      useValue: portalApp
    }
  ])
    .bootstrapModule(AppModule)
    .then(appModule => {
      return appModule;
    })
    .catch(error => {
      console.error(error);
      return null;
    });
});
```
而是重新提供一个 `dyBootstrap` 方法，在内部通过 `window.__POWERED_BY_PLANET__` 判断是否为集成环境。为了方便各子应用使用，将其封装到 `projects/frame/public-api` 中，具体代码如下：
```ts
import { Type, CompilerOptions, NgModuleRef } from "@angular/core"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { PlanetPortalApplication, defineApplication } from "@worktile/planet"
import { BootstrapOptions } from "@worktile/planet/application/planet-application-ref"

/**
 * 应用启动函数，根据是否为集成环境，决定如何启动应用
 * @param appName 应用名称
 * @returns 
 */
export const dyBootstrap = (appName: string) => {
  return {
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: (CompilerOptions & BootstrapOptions) | Array<CompilerOptions & BootstrapOptions>): Promise<NgModuleRef<M>> {
      return new Promise((resolve, reject) => {

        if ((window as any).__POWERED_BY_PLANET__) {
          return defineApplication(appName, {
            template: `<app-${appName}></app-${appName}>`,
            bootstrap: (portalApp: PlanetPortalApplication) => {
              return platformBrowserDynamic([
                {
                  provide: PlanetPortalApplication,
                  useValue: portalApp
                }
              ]).bootstrapModule(moduleType, compilerOptions)
            }
          })
        }
        else {
          return platformBrowserDynamic().bootstrapModule(moduleType, compilerOptions)
        }

      })
    }
  }
}
```
那么子应用的启动函数就变成了：
```ts
// projects/app1/src/main.ts
import { dyBootstrap } from 'projects/frame/public-api';
// 将
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
// 改为
dyBootstrap('app1').bootstrapModule(AppModule)
  .catch(err => console.error(err));
```
#### 2. 修改打包配置
**添加自定义 webpack 文件**
```js
// 根目录下新增文件 extr-webpack.config.js，内容如下：
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = {
    optimization: {
        runtimeChunk: false
    },
    plugins: [new WebpackAssetsManifest()]
};
```
**修改 angular.json**
```json
// angular.json
"build": {
  "builder": "@angular-builders/custom-webpack:browser",
  "options": {
    "customWebpackConfig": {
      "path": "./extra-webpack.config.js",
      "mergeStrategies": {
        "externals": "replace",
        "module.rules": "append"
      }
    },
    "baseHref": "/app1/",
    "deployUrl": "/app1/",
    ...
  },
  "configurations": {
    ...
    "development": {
      ...
      "vendorChunk": false,
      ...
    }
  }
},
"serve": {
  "builder": "@angular-builders/custom-webpack:dev-server",
  ...
}
```
#### 3. 修改一级模块
```js
// projects/app1/src/index.html
// 将
<app-root></app-root>
// 改为
<app-app1></app-app1>


// projects/app1/src/app/app.component.ts
// 将
selector: 'app-root',
// 改为
selector: 'app-app1',


// projects/app1/src/app/app.component.html
// 只保留
<router-outlet></router-outlet>
// 即可
```
#### 4. 添加一级路由
```ts
// projects/app1/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from '@angular/router';
import { EmptyComponent } from '@worktile/planet';
import { NzMessageModule } from 'ng-zorro-antd/message';

import { BasicComponent, BasicModule } from 'projects/frame/public-api';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'app1',
    pathMatch: 'full'
  },
  {
    path: 'app1',
    component: BasicComponent,  // BasicComponent 是一个基础组件，包含导航栏和侧边栏，和 dyBootstrap 一样，为了方便各子应用使用，将其封装到 `projects/frame/public-api` 中
                                // 内部实现了 根据 window.__POWERED_BY_PLANET__ 判断是否是集成环境，如果是，则不显示导航菜单
    children: [
      {
        path: 'test',
        loadChildren: () => import('./test/test.module').then(m => m.TestModule),
        data: { firstMenu: true, alias: '测试' }  // 为了方便子应用开发，这里将路由对应的菜单信息直接写在路由配置中，由 `projects/frame/public-api` 提供方法解析路由配置，生成菜单
      }
    ]
  },
  {
    path: '**',
    component: EmptyComponent
  },
]

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BasicModule,
    NzMessageModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
```js
// basic.component.ts
import { Component, OnInit } from '@angular/core';

/**
 * 单应用开发时的基础布局。菜单从Routes中解析而来
 */
@Component({
  selector: 'dy-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.less']
})
export class BasicComponent {
  multiApp = (window as any).__POWERED_BY_PLANET__;
}


// basic.component.html
<router-outlet *ngIf="multiApp; else devTemp"></router-outlet>

<ng-template #devTemp>
  <div class="layout pr">

    <div class="header">这里是导航栏</div>
    
    <div class="layout fdr container pr">
      <div class="menu">这里是侧边栏</div>
      <div class="layout">
        <router-outlet></router-outlet>
      </div>
    </div>
    
  </div>
</ng-template>
```

### 四、修改启动脚本
```json
// package.json
"scripts": {
  "ng": "ng",
  "start": "ng serve --proxy-config proxy.config.js",
  "start1": "ng serve app1 --port 3000",
  "start2": "ng serve app2 --port 3100"
},
```
之后就可以通过 `npm run start` 启动主应用，`npm run start1` 启动子应用1，`npm run start2` 启动子应用2 进行测试了。
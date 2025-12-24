---
title: 微前端之 qiankun 实现方案
toc: true
date: 2025-12-23 14:47:00
tags: [qiankun]
category: 微前端
---
距离上一篇 [微前端之 @worktile/planet 实现方案](/2024/11/08/微前端之worktile_planet实现方案/) 已经过去一年了，正好产品要做技术升级，所以记录下 [qiankun](https://qiankun.umijs.org/zh) 的实现方案。

<span style="font-style: italic;">不过话说 qiankun 已经2年多没有更新了，这个时候升级 qiankun，是否必要呢？</span>

**说明：本文中的主应用、微应用都是 Angular@19 版本，都是使用 history 的路由模式。**

开始之前，由于 qiankun 官网介绍的部署的目录结构和我期望的不一致，所以我们重新定义部署的目录结构和 Nginx 转发配置。
另外 qiankun 要求：`activeRule` 不能和**微应用的真实访问路径一样**，否则在主应用页面刷新会直接变成微应用页面。
基于此，我们规定 `activeRule` 为 `/应用名称`，微应用的真实访问路径为 `/app_应用名称/`。

我期望的目录结构如下：
```bash
// Nginx 静态资源目录
.
├── 50x.html
├── index.html
└── ui
    ├── app1
    ├── app2
    └── portal
```
这样看起来比较清楚，更新也比较方便。

对应的 Nginx 的配置如下：
```bash
# 公共路径变量，按照实际路径进行替换
set $web_root /opt/homebrew/var/www;

location / {
  root   $web_root/ui/portal;
  index  index.html index.htm;
  try_files $uri $uri/ /index.html;
}

# 这里配置微应用的真实访问路径
location /app_app1 {
  alias  $web_root/ui/app1;
  index  index.html index.htm;
  try_files $uri $uri/ /app_app1/index.html;
}

location /app_app2 {
  alias  $web_root/ui/app2;
  index  index.html index.htm;
  try_files $uri $uri/ /app_app2/index.html;
}
```

## 一、初始化工程并安装相关依赖
```bash
ng new portal --routing -S -g --style=less
ng g app1 --routing -S --style=less
ng g app2 --routing -S --style=less

npm i qiankun --save
npm i @angular-builders/custom-webpack@19 --save-dev
```

## 二、主应用配置
1. 注册微应用并启动：
```ts
// src/app/app.component.ts
export class AppComponent implements OnInit {

  ngZone = inject(NgZone);

  ngOnInit() {
    // 将 ngZone 实例挂载到 window 上共享给微应用
    (window as any).ngZone = this.ngZone;

    registerMicroApps([
      {
        name: 'app1',
        entry: isDevMode() ? '//localhost:3000/app_app1/' : '/app_app1/',  // 配置微应用的真实访问路径
        container: '#app-host-container',
        activeRule: '/app1',
      },
      {
        name: 'app2',
        entry: isDevMode() ? '//localhost:3100/app_app2/' : '/app_app2/',
        container: '#app-host-container',
        activeRule: '/app2',
      },
    ]);
    // 启动 qiankun
    start();
  }
}
```

2. 配置路由：
```ts
// src/app/app.routes.ts
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'app1',               // 由于我们规定了 activeRule 为 '/应用名称'，所以微应用的路由也应该是 '应用名称'
    component: EmptyComponent,  // 和 @worktile/planet 一样，当进入微应用路由时，主应用其实是没有对应的路由信息的，所以需要导航到空白页面，然后由微应用接管路由显示对应的页面。
    children: [
      {
        path: '**',
        component: EmptyComponent
      }
    ]
  },
  {
    path: 'app2',
    component: EmptyComponent,
    children: [
      {
        path: '**',
        component: EmptyComponent
      }
    ]
  },
];
```

3. 配置微应用菜单、微应用容器、router-outlet
```html
// src/app/app.component.html
<nav>
  <a [routerLink]="['/app1']" routerLinkActive="active">应用1</a>
  <a [routerLink]="['/app2']" routerLinkActive="active">应用2</a>
</nav>
<router-outlet />
<div id="app-host-container"></div>
```

## 三、微应用配置

1. 我们对于 `publicPath` 没有特殊要求，所以跳过官网的第一步。
2. 设置 `history` 模式路径的 `base`，`projects/app1/src/app/app.config.ts`文件：
```ts
import { APP_BASE_HREF } from '@angular/common';
import { ApplicationConfig, NgZone, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

const providers = [];
// 集成环境时，使用主应用共享的 ngZone 实例
if ((window as any).__POWERED_BY_QIANKUN__) {
  providers.push(
    {
      provide: NgZone,
      useValue: (window as any).ngZone
    }
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_BASE_HREF,
      // 由于我们规定了 activeRule 为 '/应用名称'，所以在集成环境下，微应用的 baseHref 配置应该为 '/应用名称/'
      // 这样微应用中类似 '/user' 这样的路由才会被解析为 '/app1/user'

      // 微应用单独访问时，配置微应用的真实访问路径
      useValue: (window as any).__POWERED_BY_QIANKUN__ ? '/app1/' : '/app_app1/'
    },
    ...providers,
  ]
};
```
3. 修改入口文件，`projects/app1/src/main.ts`文件：
```ts
import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

let app: void | ApplicationRef;
async function render() {
  app = await bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
}

// 如果不允许单独访问微应用，将这里注释即可
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap(props: Object) {
}

export async function mount(props: Object) {
  render();
}

export async function unmount(props: Object) {
  // @ts-ignore
  app.destroy();
}
```
4. 修改 `webpack` 打包配置
在微应用根目录增加 `custom-webpack.config.js`，内容为：
```ts
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    library: 'app1-[name]',
    libraryTarget: 'umd',
    jsonpFunction: 'webpackJsonp_app1',  // webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
  },
};
```
修改 `angular.json`：
```ts
- "builder": "@angular-devkit/build-angular:application",
+ "builder": "@angular-builders/custom-webpack:browser",
  "options": {
+    "customWebpackConfig": {
+      "path": "projects/app1/custom-webpack.config.js"
+    },
+    "deployUrl": "/app_app1/",  // 配置微应用的真实访问路径，这将告诉 Angular 在生成 HTML 时将静态资源引用为 /app_app1/

-    "browser": "projects/app1/src/main.ts",
+    "main": "projects/app1/src/main.ts",
  }
```
```ts
  "serve": {
-    "builder": "@angular-devkit/build-angular:dev-server",
+    "builder": "@angular-builders/custom-webpack:dev-server",
```
5. 修改根 `selector`：
```html
<!-- projects/app1/src/index.html -->
- <app-root></app-root>
+ <app-app1></app-app1>
```
```ts
// projects/app1/src/app/app.component.ts
- selector: 'app-root',
+ selector: 'app-app1',
```

至此，主应用、微应用所有配置已完成。

## 四、启动测试
分别启动主应用、微应用，测试在主应用下加载微应用、单独访问微应用是否正常。
```bash
npm start
ng serve app1 --port 3000
ng serve app2 --port 3100
```

## 五、关于 `zone.js` 的解释
虽然 Angular 18 正式支持 `Zone-less（无Zone）模式`，详见[provideExperimentalZonelessChangeDetection](https://v18.angular.cn/api/core/provideExperimentalZonelessChangeDetection)，但 Angular 19 仍默认依赖 `zone.js` 触发变更检测。在此传统模式下，Angular 依赖 Zone 拦截所有异步操作（setTimeout/Promise/事件等），异步完成时触发 `onMicrotaskEmpty` 钩子，进而执行变更检测，保证视图与数据同步。

> 以下内容来自豆包：
> - 而 qiankun 沙箱（快照 / 代理沙箱）会重写全局异步 API（setTimeout/fetch/addEventListener 等）。
> - Angular 部分内部 API（如 `HttpClient` 底层、`Animation` 动画）会主动调用 `runOutsideAngular` 优化性能。
> - 但 qiankun 沙箱拦截异步 API 后，即使调用 `runOutsideAngular` 执行异步操作，qiankun 重写后的 API 会将回调重新包装到 Angular Zone 中，导致操作仍处于 Angular Zone 的上下文内，会抛出错误：
> `ERROR RuntimeError: NG0909: Expected to not be in Angular Zone, but it is!`。
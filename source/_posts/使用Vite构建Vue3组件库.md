---
title: 使用Vite构建Vue3组件库
toc: true
date: 2023-01-11 17:48:42
tags: [vite,vue,vue3,组件库]
category: 技术分享
---
### 前言

当我们使用Angular开发库项目时，直接通过`ng g lib [name]`在当前工作空间中创建一个新的通用库项目即可，Angular会帮我们把依赖、配置甚至打包命令都设置好，还是相当方便的。

但当我们使用Vite + Vue3开发库项目时，该如何做呢？通过查Vite官方文档[库模式](https://cn.vitejs.dev/guide/build.html#library-mode)发现，其介绍过于简单，因此这里做一个整理分享。

### 开始

#### 一、初始化工程

```
npm init vite@latest test1 --template vue-ts
npm i --save-dev path  // 后面vite.config.ts中会用到
```

#### 二、开发组件

首先添加`packages\Button\src\MzButton.vue`文件用于编写组件，内容如下：

```
<script setup lang="ts">

defineProps<{ msg: string }>()

</script>

<template>
  <div class="mz-button">这是一个按钮：{{ msg }}</div>
</template>

<style scoped>
.mz-button {
  padding: 10px;
  border: solid 1px #5d5d5d;
  border-radius: 3px;
}
</style>
```

再添加`packages\Button\index.js`文件用于导出该组件，内容如下：

```
import MzButton from './src/MzButton.vue';

MzButton.install = (App) => {
  App.component(MzButton.__name, MzButton);
};

export default MzButton;
```

再添加`packages\index.js`文件，用于导出所有的组件（这里其实只有一个组件，多组件只要在此基础上扩展即可），内容如下：

```
import MzButton from './Button';

// 按需导入
export { MzButton };

const components = [MzButton];

const install = (App) => {
  components.forEach(item => {
    App.component(item.__name, item);
  });
};

export default {
  install
};
```

#### 三、配置vite.config.ts文件

修改`vite.config.js`文件，对其进行配置修改成库打包的模式，这里输出内容到`lib`文件夹中，打包入口文件设置为`./packages/index.js`文件，最终配置如下所示：

```
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'packages/index.js'),
      name: 'MzTest',
      // the proper extensions will be added
      fileName: 'mz-test'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

#### 四、打包输出lib库

执行`npm run build`，根据上面的配置文件会在根目录生成一个lib文件夹，里面包含了UMD、ESM规范打包的几个js库文件，还有css样式文件，整个组件库文件最终都会输出在lib文件夹下。

#### 五、准备package.json

配置package.json，内容如下（需要删除注释）：

```
{
  "name": "mz-test",
  "private": false,  // 公开可下载
  "version": "0.0.1",
  "keywords": [],  // 在npm上可被搜索的关键字
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "files": ["lib"],
  "main": "lib/mz-test.umd.js",  // 包函数入口文件
  "module": "lib/mz-test.js",    // ESM标准入口
  "exports": {
    "./lib/style.css": "./lib/style.css",
    ".": {
      "import": "./lib/mz-test.js",
      "require": "./lib/mz-test.umd.js"
    }
  },  // 向外暴露的文件 node规范
  "dependencies": {
    "vue": "^3.2.37"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^3.1.0",
    "vite": "^3.1.0"
  }
}
```

在根目录添加一个`.npmignore`文件，其作用是忽略不需要上传的文件内容，内容如下：

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

packages/
public/
src/
.gitignore
.npmignore
*.html
package-lock.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

至此就可以将lib库上传至npm了。

如果想要本地打包，则直接`npm pack`即可，这样就会在根目录下生成一个`mz-test-0.0.1.tgz`。

### 使用组件

#### 一、安装组件

```
npm i mz-test 或 npm i file:mz-test-0.0.1.tgz
```

#### 二、全局使用方法

```
// main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import MzTest from 'mz-test';  // 在ts文件中会报错，在vite-env.d.ts中添加declare module 'mz-test'即可
import 'mz-test/lib/style.css';

createApp(App).use(MzTest).mount('#app')

// 组件中
<mz-button></mz-button> 或 <MzButton></MzButton>
```

#### 三、局部使用方法

```
// main.ts
import 'mz-test/lib/style.css';

// 组件中
import { MzButton } from 'mz-test'

<mz-button></mz-button> 或 <MzButton></MzButton>
```
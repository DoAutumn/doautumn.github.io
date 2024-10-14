---
title: Vue3入门
toc: true
date: 2023-04-23 17:48:42
tags:
category: Vue
---
虽然之前整理过[使用 Vite 构建 Vue3 组件库](/2023/01/11/%E4%BD%BF%E7%94%A8Vite%E6%9E%84%E5%BB%BAVue3%E7%BB%84%E4%BB%B6%E5%BA%93/)、[Lerna 学习与使用](/2023/09/05/Lerna%E5%AD%A6%E4%B9%A0%E4%B8%8E%E4%BD%BF%E7%94%A8/)，但都过于简单，对于 Vue 的基本概念、语法等知之甚少，也基本没用过 Vite，诸如以下问题均不甚了解：
- SFC 是什么？
- Hooks 又是什么？
- 如何理解 Composition API？
- 如何实现组件继承？
- 如何自定义指令？
- 如何自定义结构型指令？
- 自定义的指令、组件，是如何实现完整引入和手动导入两种方式的？
- Vue3 中的依赖注入和 Angular 中的有什么区别？
- 使用 Vite + Vue3 + TypeScript，如何在一个工程中同时构建多个依赖包？如何组织目录更合理？
- 依赖包如何自动生成 .d.ts 声明文件？
- 如何实现国际化？
- 如何动态创建组件？
- 在开发依赖包的过程中，如何更优雅的编写帮助文档？

## 一、[SFC](https://cn.vuejs.org/api/sfc-spec.html)
一个 Vue 单文件组件 (SFC)，通常使用 `*.vue` 作为文件扩展名，它是一种使用了类似 HTML 语法的自定义文件格式，用于定义 Vue 组件。一个 Vue 单文件组件在语法上是兼容 HTML 的。

每一个 `*.vue` 文件都由三种顶层语言块构成：`<template>`、`<script>` 和 `<style>`，以及一些其他的自定义块：
```html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  This could be e.g. documentation for the component.
</custom1>
```

## 二、Hooks
Vue3 官方文档并没有对 Hooks 做明确定义，却无处不在在使用这个技巧，很多开源项目也在用这个技巧，这里有一些大佬的分享：
- [Vue3中的Hooks详解](https://segmentfault.com/a/1190000044673851)
- [理解Vue3中的hooks](https://juejin.cn/post/7208111879150993464)
- [Vue3必学技巧-自定义Hooks-让写Vue3更畅快](https://juejin.cn/post/7083401842733875208)

其中，我觉得这个解释是最清晰易懂的：
- 一般来说，我们开发中会自动抽象出逻辑函数放在utils中，utils中放的纯逻辑，不存在属于组件的东西，例如methods中定义的纯函数等。而hooks就是在utils的基础上再包一层组件级别的东西(钩子函数等)
- hooks和utils的区别： hooks中如果涉及到ref,reactive,computed这些api的数据，那这些数据是具有响应式的，而utils只是单纯提取公共方法就不具备响应式，因此可以把hook理解为加入vue3 api的共通方法

## 三、Composition API
组合式 API (Composition API) 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式书写 Vue 组件。它是一个概括性的术语，涵盖了以下方面的 API：
- [响应式 API](https://cn.vuejs.org/api/reactivity-core.html)：例如 `ref()` 和 `reactive()`，使我们可以直接创建响应式状态、计算属性和侦听器。
- [生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)：例如 `onMounted()` 和 `onUnmounted()`，使我们可以在组件各个生命周期阶段添加逻辑。
- [依赖注入](https://cn.vuejs.org/api/composition-api-dependency-injection.html)：例如 `provide()` 和 `inject()`，使我们可以在使用响应式 API 时，利用 Vue 的依赖注入系统。
- [组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)
- [组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html#%E7%8B%AC%E7%AB%8B%E7%9A%84-computed-%E5%B1%9E%E6%80%A7)

## 四、如何实现组件继承？
对于一位习惯使用面向对象编程语言的开发者而言，继承被视为一种自然而然的设计模式，Angular 对这一模式的支持更是加深了这种印象，使我一度认为继承是一种理所当然的选择。然而，Vue 并不特别推崇这种方案。在 Vue3 中，它更倾向于推荐使用 Composition API 和可复用的逻辑来实现组件间的复用，这导致我在开发过程中经历了一定程度的适应期。
### 1、Composition API 的优势
- 更好的可测试性：Composition API 的逻辑更容易被拆分成独立的单元进行测试。
- 更清晰的代码结构：每个组合函数负责一部分特定的逻辑，使代码更易于理解和维护。
- 更好的可复用性：逻辑可以通过组合函数在多个组件之间共享。
### 2、面向对象继承与 Composition API 的对比
在面向对象继承中，可以直接重写方法，这通常意味着：
- 简洁性：可以直接覆盖方法实现。
- 继承性：子类可以继承父类的所有属性和方法。
- 多态性：可以利用多态性来实现不同的行为。

然而，面向对象继承也有一些缺点：
- 紧耦合：类之间的关系紧密，修改一个类可能会影响到其他依赖它的类。
- 难以复用：类的逻辑通常与类本身绑定，不易于在不同场景下复用。
- 难以调试和测试：较大的类可能会包含许多逻辑，使得调试和测试变得复杂。

## 五、[如何自定义指令？](https://cn.vuejs.org/guide/reusability/custom-directives.html)
在 `<script setup>` 中，任何以 `v` 开头的驼峰式命名的变量都可以被用作一个自定义指令。比如下面的例子，`vFocus` 即可以在模板中以 `v-focus` 的形式使用。
```html
<script setup>
  const vFocus = {
    mounted: (el) => el.focus()
  }
</script>
<template>
  <input v-focus />
</template>
```
一般来讲，我们通常会单独封装一些通用指令，而很少会在单个 Vue 组件中自定义指令，比如我们可以这样做：
```ts
export const vFocus = {
  mounted: (el) => el.focus()
}
```
使用该指令时，我们可以手动导入使用它：
```ts
import { vFocus } from 'xxx'
```
也可以将其全局注册到应用层级：
```ts
const app = createApp({})

// 使 v-focus 在所有组件中都可用
app.directive('focus', vFocus)
```
而当我们在依赖包中自定义了 N 多个指令时，我们一般会采用插件的方式为每一个指令提供一个 `install` 方法，然后全局安装插件：
1. 首先定义一个为指令挂载 `install` 的通用方法：
```ts
export const withInstallDirective = <T extends Directive>(
  directive: T,
  name: string
) => {
  ;(directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive)
  }
  return directive as SFCWithInstall<T>
}
```
2. 然后每一个指令使用该方法挂载 `install`：
```ts
export const ElFocus = withInstallDirective(vFocus, 'focus')
export default ElFocus
```
3. 最后在依赖包的 `index.ts` 中安装插件，同时将依赖包本身也作为插件挂载上 `install`：
```ts
import { ElFocus } from 'xxx'

const plugins: Plugin[] = [
  ElFocus,
  ...
]

export default {
  install(app: App) {
    plugins.forEach(c => app.use(c)) // app.use() 方法会自动调用插件的 install() 方法
  }
}
```

上面借助[插件](https://cn.vuejs.org/guide/reusability/plugins.html)的设计思路同时介绍了自定义的指令、组件如何实现完整引入和手动导入两种方式。
在 Angular 中，没有完整引入的概念，因此这里的`插件`、`install`、`use`需要稍微理解一下。

## 六、如何自定义结构型指令？
在 Vue 中自定义结构型指令比在 Angular 中要简单的多，直接通过 `parentNode.appendChild()`、`parentNode.removeChild()` 实现即可。
```ts
// 假设这里有一个权限检查函数
function checkAuth(value) {
  // 实现权限检查逻辑
  return true; // 返回布尔值表示用户是否有权限
}

// 定义自定义指令
export const vAuth = {
  mounted(el, binding) {
    if (!checkAuth(binding.value)) {
      el.parentNode.removeChild(el); // 移除 DOM 节点
    }
  },
  beforeUpdate(el, binding) {
    if (!checkAuth(binding.value)) {
      el.parentNode.removeChild(el); // 移除 DOM 节点
    } else if (!el.parentNode) {
      el.parentNode.appendChild(el); // 如果已经被移除，则重新添加
    }
  },
  updated(el, binding) {
    if (checkAuth(binding.value) && !el.parentNode) {
      el.parentNode.appendChild(el); // 如果已经被移除，则重新添加
    }
  }
}
```

## 七、Vue3 中的依赖注入和 Angular 中的有什么区别？
链接：[https://cn.vuejs.org/guide/components/provide-inject.html](https://cn.vuejs.org/guide/components/provide-inject.html)
在我看来，其实没什么区别，只是写法的区别。
在 Angular 中，先是在类的元数据中标记这是可被注入的，然后在 Module 的元数据的 `providers` 中提供，最后直接在其它类的构造函数中注入即可：
```ts
// 标记是可被注入的
@Injectable()
export class TestService {}

// Provide 提供
@NgModule({
  ...,
  providers: [TestService]
})

// 直接注入使用
export class OtherClass {
  constructor(private ser: TestService) {}
}
```
而在 Vue 中，没有元数据的概念，没有可被注入的概念，直接提供、直接注入：
```html
<script setup>
import { provide } from 'vue'

provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
</script>
```
```html
<script setup>
import { inject } from 'vue'

const message = inject('message')
</script>
```
当然也是可以全局注入的，具体参考上面链接中的官方文档。

## 八、使用 Vite + Vue3 + TypeScript，如何在一个工程中同时构建多个依赖包？如何组织目录更合理？
如果只是开发一个组件库，那么完全可以参考 [Element Plus](https://element-plus.org/zh-CN/) 的目录结构和打包方式，或者也可以参考[手把手带你手搓组件库](https://space.bilibili.com/69097065/channel/collectiondetail?sid=2881868)这样的视频教程，他其实也是参考了 Element Plus，只是不需要自己翻 Element Plus 的源码了。

虽然 Element Plus 是一个单一的组件库，但其内部仍然是拆分了多个子包，通过 [pnpm](https://www.pnpm.cn/) 管理多个子包。pnpm 内置了对单一存储库（也称为多包存储库、多项目存储库或单体存储库）的支持， 你可以创建一个 workspace 以将多个项目合并到一个仓库中。但我不喜欢用 pnpm，我的 Angular 工程，使用 npm 下载依赖包运行程序没问题，使用 pnpm 下载运行就报错，当然是相同版本的 node 和相同的 package.json，我也懒得去研究了，还是继续使用 [Lerna](https://lerna.js.org) 来实现多包管理。

需求层面，我并不只是要实现单一的组件库，而是要包含 [Lerna学习与使用](/2023/09/05/Lerna%E5%AD%A6%E4%B9%A0%E4%B8%8E%E4%BD%BF%E7%94%A8/)中已经提到过的 `frame`、`components`、`charts`、`compoxes`、`utils` 等。废话不多说，直接开始吧。
### 1、初始化 Vue 工程
我还是习惯 Angular 的设计方案，它是区分应用程序 (application) 和库 (lib) 的，*当然 Vue 也是区分的，只是在打包的时候使用不同的 Vite 配置*。在 Angular 中一般都是先创建一个应用程序，再通过 `ng g lib library[name] [options]` 命令创建一个库项目。Vue 没有这样的命令，只能手动创建。
通过 `npm create vite@latest my-vue-app -- --template vue-ts` 初始化一个工程之后，手动创建 `packages/frame`、`packages/components`、`packages/charts`、`packages/compoxes`、`packages/utils` 目录，并在各自目录下创建一个 `src` 目录和 `index.ts`、`package.json`、`vite.config.ts` 3个文件，此时整个工程目录是这样：
<img width="150" alt="工程目录.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Vue3入门/工程目录.png">

每一个子包都需要单独打包，所以每一个目录下都有一个 `vite.config.ts` 文件。
### 2、初始化 Lerna
在 `my-vue-app` 目录下直接执行 `npx lerna init --packages="packages/*"` 即可，它会创建一个 `lerna.json` 文件，并安装 `lerna` 依赖。
**注意：** 上面这个命令并不会在 `package.json` 中插入 `workspaces` 属性，需要我们手动添加：
```js
{
  ...
  "workspaces": [
    "packages/*"
  ]
}
```
接下来就可以直接无视 Lerna 了，我们还是正常使用 `npm install\uninstall`，当安装的是自己的子包时，也无需添加任何额外的参数，Lerna 会自动帮我们处理，并且在 `node_modules` 目录下，子包的目录会通过软链接的形式指向实际的代码目录，就像这样：
<img width="300" alt="软链接.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Vue3入门/软链接.png">

### 3、配置 vite.config.ts
可以像官方文档推荐的[库模式](https://vitejs.cn/vite3-cn/guide/build.html#multi-page-app)那样只配置一个 `vite.config.ts` 文件，也可以像教程[项目打包](https://www.bilibili.com/video/BV1ji421X7GZ/?spm_id_from=333.788&vd_source=726ad3db70255a5ef4d7373d91735d76)一样配置两个文件 `vite.es.config.ts` 和 `vite.umd.config.ts`。
### 4、配置 package.json
除了官方文档推荐的内容之外
```js
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```
还有必要加入其它信息：`version`、`description`、`publishConfig` 等
```js
{
  "name": "my-lib",
  "version": "1.0.0",
  "description": "my lib",
  "type": "module",
  "publishConfig": {  // 如果有必要的话
    "access": "publish",
    "registry": ""
  },
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```
### 5、打包
我们可以切换到各自目录下执行 `vite build` 目录，因为当以命令行方式运行 `vite` 时，Vite 会自动解析当前目录下名为 `vite.config.ts` 的文件，也可以显式地通过 `--config` 命令行选项指定一个配置文件（相对于 `cwd` 路径进行解析），比如这样，直接在根目录的 `package.json` 中配置打包脚本，并指定 `vite.config.ts`：
```js
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:lib": "npm run build:utils && npm run build:components && npm run build:compoxes && npm run build:charts && npm run build:frame",
    "build:charts": "vite build --config packages/charts/vite.config.ts",
    "build:components": "vite build --config packages/components/vite.config.ts",
    "build:compoxes": "vite build --config packages/compoxes/vite.config.ts",
    "build:frame": "vite build --config packages/frame/vite.config.ts",
    "build:utils": "vite build --config packages/utils/vite.config.ts"
  }
}
```

## 九、依赖包如何自动生成 `.d.ts` 声明文件？
上面经过一些列的配置，已经能够正常打包了，但还不能自动生成 `.d.ts` 声明文件，这在使用依赖包时并不友好。我们可以直接通过 `vite-plugin-dts` 插件自动生成声明文件，但过程中也遇到了一些问题，需要记录下。
### 1、安装并配置 vite-plugin-dts 插件
```shell
npm i vite-plugin-dts -D
```
```ts
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // the proper extensions will be added
      fileName: 'my-lib'
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
### 2、打包
此时直接打包，如果使用的是 `"vite-plugin-dts": "^4.0.2"` 版本，并没有自动生成声明文件；如果使用的是 `"vite-plugin-dts": "^3.9.1"` 版本，还会报错
```ts
index.ts:1:15 - error TS2792: Cannot find module './src/vue'. Did you mean to set the 'moduleResolution' option to 'nodenext', or to add aliases to the 'paths' option?
```
经过[前端 Vite 项目使用 vite-plugin-dts 打包输出.d.ts文件，分析处理踩坑](https://blog.csdn.net/weixin_57818879/article/details/140072524)的解释，应该就是 `tsconfig.json` 的原因。
<img width="700" alt="报错环境.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Vue3入门/报错环境.png">
<img width="700" alt="分析和解决.png" src="https://gitee.com/doautumn/doautumn.gitee.io/raw/master/Vue3入门/分析和解决.png">

所以我们可以在各子包目录下新建一个 `tsconfig.build.json` 文件，内容直接复制 `tsconfig.app.json`，然后再改下 `include` 路径即可。
```js
{
  ...
  "include": [
    "./index.ts",
    "./src/**/*.ts",
    "./src/**/*.vue"
  ]
}
```
然后再将 `tsconfig.build.json` 配置到 `vite-plugin-dts` 插件中就能够自动生成声明文件了。
```ts
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts({ tsconfigPath: './tsconfig.build.json', outDir: './dist/types' })],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // the proper extensions will be added
      fileName: 'my-lib'
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
最后不要忘了在 `package.json` 中添加类型声明文件路径。
```js
{
  "name": "my-lib",
  "version": "1.0.0",
  "description": "my lib",
  "type": "module",
  "publishConfig": {  // 如果有必要的话
    "access": "publish",
    "registry": ""
  },
  "files": ["dist"],
  "types": "./dist/types/index.d.ts",
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

## 十、如何实现国际化？
Vue 应用程序本身实现国际化比较简单，使用 [vue-i18n](https://vue-i18n.intlify.dev/) 很容易达到目的。首先是创建并安装 `i18n` 实例：
```ts
const i18n = createI18n({
  locale: 'ja',
  fallbackLocale: 'en',
  messages: {
    en: {
      message: {
        hello: 'hello world'
      }
    },
    ja: {
      message: {
        hello: 'こんにちは、世界'
      }
    }
  }
})

const app = createApp(Vue)
app.use(i18n)
app.mount('#app')
```
然后在模板中直接使用即可：
```html
<template>
  <h1>{{ $t('message.hello') }}</h1>
</template>
```
那在依赖包中如何实现国际化呢？首先想到的是采用 Element Plus 的方案，完全自己实现，但既然我们的主体应用程序（就是使用了上述几个子包的主程序，也就是某个产品或项目的具体应用程序）不可避免的需要使用 `vue-i18n`，那能否借助它来实现子包的国际化呢？答案是肯定的。
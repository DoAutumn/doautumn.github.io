---
title: 一文彻底看懂 package.json 中的各种 dependencies
toc: false
date: 2022-08-31 14:41:58
category: 技术分享
---
关于package.json中的各种dependencies的详细解释，可以直接参考[这篇文章](https://developer.aliyun.com/article/1051418)。

这里只做一个最终结论的摘录。

| 依赖类型 | 定义在项目中 | 定义在依赖中 | 一句话总结 | 举例 |
|---|---|---|---|---|
| dependencies | 会被安装 | 会被安装 | 定义包运行所需要的依赖包 | 某前端项目使用 react 进行开发，需要将 react 添加到 dependencies 中 |
| devDependencies | 会被安装 | 不会被安装 | 定义包在开发时所需要的依赖包 | antd 使用了 @testing-library/react 进行测试，需要将 @testing-library/react 添加到 devDependencies 中 |
| peerDependencies | 不会被安装 | 不会被安装，但是如果指向的依赖没有被安装或不符合时会有警告（peerDependenciesMeta 会影响该行为） | 定义该包运行所需要的依赖环境，一般和 devDependencies 一起使用 | antd 是一个 react 组件库，为了不和使用它的项目中的 react 版本定义造成冲突，需要将支持的 react 版本添加到 peerDependencies 中 |
| optionalDependencies | 会被安装，但是安装报错不会影响 | 会被安装，但是安装报错不会影响 | optionalDependencies 用于定义对包运行不会造成影响的依赖包 | 一个包在使用 A 包进行了某些操作，但是如果 A 包不在的话，可以使用别的 API 达到同样的效果，可以将 A 包添加到 optionalDependencies 中 |

---
另外记录下版本号的格式规定：
`固定版本`：如4.0.3
`～`：如～4.0.3，表示安装 4.0.x 的最新版本，也就是说安装时不会改变主版本号和次版本号
`^`：如^17.0.2，表示安装 17.x.x 的最新版本，也就是说安装时不会改变主版本号
`latest`：安装最新版本
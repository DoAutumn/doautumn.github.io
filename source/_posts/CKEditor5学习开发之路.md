---
title: CKEditor5学习开发之路
toc: true
date: 2023-01-11 16:22:26
tags: [CKEditor5,富文本编辑器]
category: 技术分享
sticky: 8
---
> 在开发富文本编辑器的过程中，遇到了很多问题，这里做下记录与分享。

> 说明：本文中涉及的代码较少，也并非单纯的开发步骤，而是整理的一些思路和问题，如果你是想一步一参考的开发一个Demo，本文并不适合你。
## 一、背景
公司的一款产品中要加入报告功能，简单来讲，就是通过Web浏览器定义word模板、定时任务，服务端根据模板、任务定时生成周报、月报的功能。对于服务端的定时任务、生成周报月报的功能实现，本文不做阐述。本文只介绍Web端的word模板定义的实现思路及遇到的一些问题，对于该功能，除了富文本编辑器基本功能之外，还需支持插入占位符（用于服务端生成word时替换为实际内容）、图表。
## 二、技术选型
接到需求之后，首先想到的一些成熟的产品，像[有道云笔记](https://note.youdao.com/)、[腾讯文档](https://docs.qq.com/)、[石墨文档](https://shimo.im/)、[语雀](https://www.yuque.com/)、[我来](https://www.wolai.com/)（没使用过，形式好像不太一样）等都有类似功能，但具体是如何实现的呢，不得而知。由于本人之前使用过有道云，所以就想查查有没有相关文章、代码可以参考，没想到还真有。

- [有道云笔记新版编辑器架构设计（上）](https://segmentfault.com/a/1190000039046174?utm_source=sf-similar-article)
- [有道云笔记新版编辑器架构设计（下）](https://segmentfault.com/a/1190000039104198?utm_source=sf-similar-article)

这是有道技术团队分享的架构设计，具有极高的参考价值。看完这两篇文章，本人甚至都有自己开发实现一把的冲动了。奈何考虑到只有我一个人在做这个事情，而且文章虽好，但没有技术细节，实现难度较大，最终只能作罢，只好沿着富文本编辑器的思路继续调研。

网上关于富文本编辑器的推荐着实不少，[推荐几款好用的富文本编辑器](https://blog.csdn.net/growb/article/details/124446195)、[推荐10款常用的富文本编辑器](https://jishuin.proginn.com/p/763bfbd75b52)，经过综合对比，最终选定了[CKEditor](https://ckeditor.com/)。之所以选CKEditor，一是因为它可以使用与Angular（公司前端技术栈）的原生集成，二是支持从 Word、Excel 和 Google Docs 粘贴。
## 三、CKEditor的使用与踩坑
对于CKEditor的介绍，这里就不再赘述了，官方文档介绍的更为详细，但目前还没找到中文文档。

> 不过需要说明的是，能够提前阅读到上述有道技术团队分享的架构设计，也算是比较幸运的，这对于理解CKEditor的架构设计及后面的插件开发，是相当有帮助的。个人猜测，仅仅是个人猜测，有道技术团队的架构设计，应该是参考的CKEditor吧。

### 1、Document Editor
CKEditor支持在5种模式下使用：Classic、Balloon、Balloon Block、Inline、Document，而Document恰恰是我们需要的。按照其[文档](https://ckeditor.com/docs/ckeditor5/latest/installation/frameworks/angular.html#using-the-document-editor-build)介绍，很容易就能构建出一个Demo。
### 2、添加[Page break](https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html)插件
由于Document模式默认是不带分页功能的，而[Pagination](https://ckeditor.com/docs/ckeditor5/latest/features/pagination/pagination.html)又是收费插件，我们只能退而求其次使用Page break。而当我们按照文档尝试安装并引入该插件时，程序报错了。

`core.js:7744 ERROR Error: Uncaught (in promise): CKEditorError: ckeditor-duplicated-modules`

对于这个错误，官网也有详细[说明](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-ckeditor-duplicated-modules)，大概意思就是不能在已经构建的包`@ckeditor/ckeditor5-build-decoupled-document`中再导入新的插件。

如果只是计划添加CKEditor提供的现有插件，则可以使用[Online Builder](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start-other.html#creating-custom-builds-with-online-builder)来解决上述问题。但正如前文提到的，我们的需求还包括支持插入占位符、图表，因此我们还需继续研究CKEditor如何扩展一个新的插件。
### 3、[从源代码构建编辑器](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start-other.html#building-the-editor-from-source)
正如上文提到，当我们想要扩展一个新插件时，就不能使用CKEditor提供的已经构建好的包了`[CKEditor提供了5种已构建好的包，对应上述提到的5种使用模式]`，而是需要基于源码进行开发构建。可以按照其[文档](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start-other.html#building-the-editor-from-source)一步步搭建开发环境、开发、构建，而另一种相对比较简单的方式则是直接下载[源码](https://github.com/ckeditor/ckeditor5)，进入packages/ckeditor5-build-decoupled-document目录，直接安装依赖、开发、构建，这就意味着我们开发并构建了一个属于自己的包`@ckedtior/ckeditor5-build-decoupled-document1`。

上述这两种方式，和我们最初的设想还有些偏差。我们希望将富文本编辑器开发成一个公共组件供产线各个产品使用，设想的使用方式也尽量简单，只需安装我们提供的富文本编辑器组件包`teditor`和我们依赖的开源包`@ckeditor/*`即可。

而一旦我们开发并构建了属于自己的`@ckedtior/ckeditor5-build-decoupled-document1`，则意味着我们又得多维护一个包，这是我们不想要的，但目前没有解决办法。当然我们也尝试过将CKEditor源码和Angular工程进行整合以期能够构建成一个包，但没有成功，我记得遇到的问题是，CKEditor源码中虽然是.css文件，但某些.css中却是less的语法，导致编译不成功。

不过最终，为了开发方便，我们还是决定在安装了构建包的Angular工程中开发插件，只不过相关依赖不是在Angular工程中引入，而是在源码中将其挂载到export的对象上，部分代码如下：
```
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';

export default class DecoupledEditor extends DecoupledEditorBase { }

DecoupledEditor.Plugin = Plugin;
DecoupledEditor.Command = Command;

// 其中 DecoupledEditor 是源码 ckeditor5-build-decoupled-document 中已有的对象
// 将源码构建之后替换掉Angular工程node_modules中对应的包即可
```
## 四、插件开发
好了，准备工作已完成，下面可以进入代码开发阶段了。关于插件开发的入门，可参考[这里](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/plugins/creating-simple-plugin-timestamp.html)。
### 1、图片上传
我们要开发的第一个插件是图片上传插件，确切的说是扩展一个自定义的图片上传适配器。CKEditor默认提供了图片插入功能，但图片并没有提交至服务端，这部分逻辑需要自行实现，按照[文档](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/upload-adapter.html)一步步开发即可，没有什么需要特别注意的。
### 2、占位符
占位符插件也比较简单，直接基于文档中的一个[实例](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/plugins/simple-plugin/abbreviation-plugin-level-1.html)改造即可。
### 3、插入图表
前两个插件的开发，基本上只要是理解了CKEditor的架构设计，并且按照文档的步骤，一般是不会有太多问题的。但是对于插入图表的功能，完全找不到参考，无奈，只能一边梳理思路一边研究官方文档了。

- 思考一
对于图表，我们测试使用的是ECharts。我们知道如果想要实例化一个图表，也即调用`echarts.init(dom?: HTMLDivElement|HTMLCanvasElement)`，需要一个Dom元素作为参数，那么我们需要研究的就是在插件中如何能够获取到新创建的Dom了。
通过文档中的 [Using a React component in a block widget](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/tutorials/using-react-in-a-widget.html) 这个教程，我们发现其在渲染 React component 时，就是获取到插件中新创建的Dom进而渲染组件的。
那么这个问题便迎刃而解了，个人觉得最难的也就是这点了，主要是如何能够想到这一点并找到合适的解决方法。
> 通过这个问题，需要再次告诫自己，对于这种比较成熟的产品、开发套件、开源库等，一手文档一定是其官方文档，哪怕是英文的，也要仔细研读，不要图省事去网上搜罗别人的博客、技术分享。

- 思考二
图表插入之后，如何确定当前选中的是图表元素，进而进行后续的业务操作？
相关 API 主要涉及 setCustomProperty、getCustomProperty、getSelectedElement、isWidget，具体含义及用法还是查阅[官方文档](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)吧。

- 思考三
图表插入之后，如何调整图表尺寸？
开始以为这个问题应该很好解决，因为图片在插入之后，是能够直接拖拽调整大小的，我们只需参考图片插件扩展一个图表 resize 插件即可。但当我们查看图片插件源码时，发现代码量较大，没学习到的 API 也较多，遂暂时放弃了拖拽调整图表大小的想法。
那能否通过设定固定尺寸调整图表大小呢？答案是肯定的。这里主要是参考了 [@emagtechlabs/ckeditor5-classic-image-resize](https://github.com/eMAGTechLabs/ckeditor5-classic-image-resize) 的代码实现。

- 思考四
实例化多个图表之后，如何区分？
这里主要是在定义图表插件的 schema 时带入一个 Id 即可，将来不论是图表的数据填充还是保存模板到服务端，都将通过 Id 来标识唯一的图表实例。
## 五、源码及Demo
[https://github.com/DoAutumn/CKEditor5](https://github.com/DoAutumn/CKEditor5)
[https://doautumn.github.io/CKEditor5/](https://doautumn.github.io/CKEditor5/)
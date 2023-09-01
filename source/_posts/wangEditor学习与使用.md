---
title: wangEditor学习与使用
toc: true
date: 2023-09-01 11:10:31
tags: [wangEditor,TinyMCE,富文本编辑器]
category: 技术分享
---
## 一、背景
继之前的[CKEditor5学习开发之路](https://doautumn.github.io/2023/01/11/CKEditor5%E5%AD%A6%E4%B9%A0%E5%BC%80%E5%8F%91%E4%B9%8B%E8%B7%AF/)之后，这又是一篇对富文本编辑器的学习与使用的整理回顾笔记。之所以会再一次研究富文本编辑器，并且目标对象变了，主要是因为CKEditor5的License为[GNU General Public License](https://github.com/ckeditor/ckeditor5/blob/master/LICENSE.md)，不允许闭源商用，因此只能重新调研，具体调研结果可查看[富文本编辑器调研](https://doautumn.github.io/2023/09/01/%E5%AF%8C%E6%96%87%E6%9C%AC%E7%BC%96%E8%BE%91%E5%99%A8%E8%B0%83%E7%A0%94/)。
## 二、技术选型
从调研结果来看，除掉CKEditor5，还剩下TinyMCE、wangEditor、Froala Editor是可选的。

- TinyMCE
  1. 先来说TinyMCE，它的内容区是嵌套了一个iframe，扩展插件的话是新建html、js，在这独立的html、js中写插件的逻辑，而这插件被集成到编辑器并使用的时候，又嵌套了一层iframe。如果要实现插入图表的功能，图表的插入使用肯定不止一个，这种方案似乎不太合适。
  2. 另外它的引用方式也挺奇怪的，默认地，代码会去他们的服务器请求tinymce.min.js，如果是内网环境，则需要单独配置，具体参考[这里](https://www.tiny.cloud/docs/tinymce/6/angular-pm/)的步骤8。
  3. 基于这两点原因，最终放弃了它。这里是测试[代码](https://github.com/DoAutumn/TinyMCE-test)。

- Froala Editor看起来是个不错的选择，但查看[代码](https://github.com/froala/angular-froala-wysiwyg/blob/master/package.json)时，发现前端工程依赖的`"froala-editor": "^4.1.1"`并没有公开代码仓，公开出来的是[V3版本](https://github.com/froala/wysiwyg-editor-release)，其他的公开仓都是适配各种框架的，这。。。开源了个啥

- wangEditor很明显也不是理想选择，正如调研结果中提到的，bug较多，但没办法，暂时没找到其他开源免费可商用的富文本编辑器。
## 三、wangEditor的使用与扩展
不过wangEditor的优势也是比较明显的，帮助文档很详细，示例较多，源码结构也很清晰，弄清楚了它的代码逻辑，修复遇到的bug还是比较简单的。
<img width="800" alt="图1 架构图" src="https://foruda.gitee.com/images/1693552568613627760/195da767_358662.png">
这里就不再重复罗列自定义扩展新功能的步骤了，按照其[官网](https://www.wangeditor.com/v5/development.html)教程一步步来即可。附上包含插入图表、占位符的示例[代码](https://github.com/DoAutumn/wangEditor-test)。
只记录下对其bug修复、功能调整的技术细节。
### 1、修复在Angular工程中编译报错的bug
```typescript
// packages/core/src/editor/interface.ts
// import ee from 'event-emitter'
import * as ee from 'event-emitter'  // @types/event-emitter中是这么写的：export = ee; 所以需要import * as ee from 'event-emitter'
```
### 2、修复不设置编辑器高度时，控制台有警告提示、hoverbar、modal位置不对的bug
扩展IEditorConfig，使之支持设置minHeight，然后在创建根节点时，设置最小高度
```typescript
// packages/core/src/config/interface.ts
/**
 * editor config
 */
export interface IEditorConfig {
  ...
  minHeight?: string
}

// packages/core/src/text-area/update-view.ts
/**
 * 生成编辑区域的 elem
 * @param elemId elemId
 * @param readOnly readOnly
 */
function genRootElem(elemId: string, readOnly = false, minHeight = ''): Dom7Array {
  const style = minHeight ? `style="min-height: ${minHeight};"` : ''
  const $elem = $(`<div
        id="${elemId}"
        data-slate-editor
        data-slate-node="value"
        suppressContentEditableWarning
        role="textarea"
        spellCheck="true"
        autoCorrect="true"
        autoCapitalize="true"
        ${style}
    ></div>`)

  // role="textarea" - 增强语义，div 语义太弱

  return $elem
}
```
### 3、修复插入分隔线或自定义元素时，总是会在前面空出一行的bug
参考插入表格的代码，如果当前是空 p ，则删除该 p
```typescript
// packages/table-module/src/module/menu/InsertTable.ts
// 如果当前是空 p ，则删除该 p
if (DomEditor.isSelectedEmptyParagraph(editor)) {
  Transforms.removeNodes(editor, { mode: 'highest' })
}
```
### 4、修复给到编辑器的html中出现了字号列表中没有的字号时，字号不生效的bug
移除在字号列表中查找当前字号的逻辑（字体也是一样的逻辑）
```typescript
// packages/basic-modules/src/modules/font-size-family/parse-style-html.ts
// const includesSize =
//   fontSizeList.find(item => item.value && item.value === fontSize) ||
//   fontSizeList.includes(fontSize)
// 在 fontSizeList 中找不到，也能够设置 fontSize
const includesSize = true

if (fontSize && includesSize) {
  textNode.fontSize = fontSize
}
```
### 5、调整表格创建成功之后宽度默认100%
获取表格节点时，将`width: 'auto'`改为`width: '100%'`即可
```typescript
// packages/table-module/src/module/menu/InsertTable.ts
function genTableNode(rowNum: number, colNum: number): TableElement {
  ...
  return {
    type: 'table',
    width: '100%',
    children: rows,
  }
}
```
### 6、扩展工具栏按钮BaseButton，使之支持调用menu的onButtonClick方法
有时候我们需要在点击工具栏按钮的时候，获取按钮的位置，以便靠近该按钮显示一个自定义浮窗，此时我们需要知道按钮相对编辑器的位置，以确定浮窗的位置。为此，我们扩展BaseButton，使之支持调用menu的onButtonClick方法（当然，前提是menu实现了onButtonClick方法），然后将event传递出来。
```typescript
// BaseButton本身已经有onButtonClick方法了，只是menu没有，所以对menu的接口IBaseMenu进行扩展
// packages/core/src/menus/interface.ts
interface IBaseMenu {
  ...
  onButtonClick?: (editor: IDomEditor, e: Event) => void // 和 exec 类似，但主要是为了得到原始 event
}

// packages/core/src/menus/bar-item/BaseButton.ts
// // 交给子类去扩展
// abstract onButtonClick(): void
/**
 * 执行 menu.onButtonClick
 */
protected onButtonClick(e: Event) {
  const editor = getEditorInstance(this)
  const menu = this.menu
  menu.onButtonClick && menu.onButtonClick(editor, e)
}

// 注意：BaseButton的所有子类，均需在onButtonClick中调用父类的该方法
onButtonClick(e: Event) {
  super.onButtonClick(e)
  ...
}
```
### 7、扩展工具栏下拉选择Select，使之支持始终显示图标，而不是显示选中的文字
比如行高，有些富文本编辑器始终显示图标（当然也不能说这样是最好，只是扩展以支持该功能）
```typescript
// packages/core/src/menus/interface.ts
export interface ISelectMenu extends IBaseMenu {
  readonly alwaysShowIcon?: boolean // 永远显示图标
  ...
}

// packages/core/src/menus/bar-item/Select.ts
private setSelectedValue() {
  const editor = getEditorInstance(this)
  const menu = this.menu
  const { alwaysShowIcon, iconSvg } = menu
  const value = menu.getValue(editor)

  const options = menu.getOptions(editor)
  const optText = getOptionText(options, value.toString())

  const $button = this.$button
  const $downArrow = gen$downArrow() // 向下的箭头图标
  $button.empty()
  // 主要是这里的代码
  if (alwaysShowIcon && iconSvg) {
    const $svg = $(iconSvg)
    clearSvgStyle($svg)
    $button.append($svg)
  } else {
    $button.text(optText)
  }
  $button.append($downArrow)
}

```
## 四、wangEditor私有化
上面我们对其源码修改了这么多，最好是贡献给wangEditor，但或许存在两点问题：
- 我们的修改不一定能够被他们接受（或许有些问题他们不认为是bug，或许有些扩展他们认为不通用）
- 加入其团队略微麻烦，具体要求在[这里](https://github.com/wangeditor-team/wangEditor/blob/master/docs/join.md)

所以我们需要重新定义包名、指定代码仓、指定npm私服。
源码中是使用[`lerna`](https://www.lernajs.cn/)管理多个包的，因此`packages`目录下的每个包都需要改，主要修改`package.json`中的如下属性值：
```json
{
  "name": "xxx",
  "publishConfig": {
    "registry": "xxx"
  },
  "repository": {
    "url": "xxx"
  }
}
```
需要注意一点，如果我们新的代码仓不是在GitHub上，那么在lerna将`git tag` `push`到远程时，就不会触发原有的配置`git action`，此时需要我们手动发包。
所以，调整之后的完整的开发、发包流程如下：
```
- 下载代码到本地，进入 `wangEditor` 目录
- 安装所有依赖 `yarn bootstrap`
- 开发功能，完成之后将代码合并到 `master` 分支
- 打包所有模块 `yarn dev` 或者 `yarn build`
- 生成版本并利用 lerna 自动 push `yarn release:version`
- 手动发包 `yarn release:publish`
```
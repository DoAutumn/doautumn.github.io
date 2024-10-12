---
title: Obsidian插件开发
toc: true
date: 2024-10-10 15:59:48
tags: Obsidian
category: 工具
---

## 背景
之所以要开发 Obsidian 插件，是因为之前整理了[通过Gitee的OpenAPI实现图床](/2024/09/27/通过Gitee的OpenAPI实现图床/)，想着将 Obsidian 的图片也上传到图床，然后生成链接，这样就可以在 Obsidian 中直接使用图片链接了。

但是后来想到，Obsidian 还是可以插入文件的，如果将文件也上传到图床固然可行，但是文件的预览就不太方便了。因为 Obsidian 中仅是插入了文件链接，点击之后实际是通过浏览器打开的，像 .docx 等文件浏览器是不支持预览的，所以就直接下载下来了，这种体验并不友好。

最终想了想，Obsidian 的笔记其实还是同步到 iCloud 中的，所以图片、文件也都保持这种方式吧。

但是插件已经开发出来了，这里就记录一下开发过程。

## 开发文档
开发文档可以参考[Obsidian 插件开发文档](https://luhaifeng666.github.io/obsidian-plugin-docs-zh/zh2.0/getting-started/create-your-first-plugin.html)，步骤还是很详细的，示例工程都有了。

## 上传文件到 Gitee
我的这个插件想要实现的功能是，将粘贴或拖拽到 Obsidian 中的图片、文件自动上传到 Gitee，并生成链接，然后直接插入到笔记中。

### 插件配置
首先，需要配置 Gitee 的相关信息，包括用户名、仓库地址、分支名、token 等。

```javascript
const DEFAULT_SETTINGS: MyPluginSettings = {
  repo: '',
  branch: 'master',
  path: '/',
  token: '',
};
```

### 事件监听
然后，需要监听 Obsidian 中的粘贴和拖拽事件，当有图片或文件被粘贴或拖拽到 Obsidian 中时，触发上传操作。

```javascript
async onload() {
  await this.loadSettings();

  this.registerEvent(
    this.app.workspace.on('editor-paste', (event, editor, content) => {
      this.uploadFiles(event.clipboardData?.files, event, editor);
    })
  );
  this.registerEvent(
    this.app.workspace.on('editor-drop', (event, editor, content) => {
      this.uploadFiles(event.dataTransfer?.files, event, editor);
    })
  );
}

uploadFiles(files: FileList | undefined, event: ClipboardEvent | DragEvent, editor: Editor) {
  if (!files?.length) return;

  event.preventDefault();
  event.stopPropagation();

  if (this.settings.subPathable) {
    new SampleModal(this.app, files, editor, this.settings).open();
  }
  else {
    uploadToGitee(files, this.settings).then((res) => {
      editor.replaceSelection(res.filter(x => x).join('\n'));
    })
  }
}
```

### 上传图片
上传图片的功能比较简单，直接使用 Gitee 提供的 API 即可。

```javascript
function uploadToGitee(fileList: FileList, settings: MyPluginSettings, filePath: string = '') {
  const tooLargeFiles = Array.from(fileList).filter(file => file.size > 1024 * 1024 * 10);
  if (tooLargeFiles.length) {
    new Notice(`文件大小不能超过10MB，${tooLargeFiles.map(file => file.name).join('、')}将会被丢弃`, 5000);
  }
  return Promise.all(Array.from(fileList).filter(file => file.size <= 1024 * 1024 * 10).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        axios.post(`https://gitee.com/api/v5/repos/${settings.repo}/contents/${settings.path}/${filePath}/${file.name}`, {
          access_token: settings.token,
          content: (reader.result as string).replace(`data:${file.type};base64,`, ''),
          message: 'upload image'
        })
          .then(res => {
            resolve(file.type.includes('image') ? `![${file.name}](${res.data.content.download_url})` : res.data.content.download_url)
          })
          .catch(err => {
            new Notice(`上传文件${file.name}失败，失败原因：${err.response.data.message}`, 5000);
            resolve('')
          })
      };
      reader.onerror = err => {
        new Notice(`文件读取${file.name}失败`, 5000);
        resolve('')
      };
      reader.readAsDataURL(file);
    })
  }))
}
```

### 代码地址
[https://github.com/DoAutumn/img-plugin-obsidian](https://github.com/DoAutumn/img-plugin-obsidian)
---
title: Angular依赖包，图片找不到的原因分析及解决方案
toc: true
date: 2023-07-12 16:31:43
category: Angular
---
### 1、问题描述
在Angular开发的依赖包中，若某个组件使用了图片，当集成该依赖包并使用该组件时，会出现图片丢失的问题。

### 2、问题原因
图片以相对路径形式写到了样式文件中，如`background: url("../../../assets/dobogo/localCpts/name-value/1.png") center center no-repeat;`，打依赖包并集成之后，该组件所处路径已发生变化，意味着该样式所处路径也已经发生变化，此时再以相对路径查找，则直接404

### 3、解决方案
#### 3.1、方案一
- 思路：以行内样式写到html中或js中；
- 问题：编码不规范；
#### 3.2、方案二
- 思路：采用和Tui框架处理图片相同的方案，即将图片以base64形式打包到代码中；
- 问题：使用的图片较少可以，如果较多，则不太合适，图片转base64之后字符太长；
#### 3.3、方案三
- 思路：less变量定义相对路径，打依赖包之前替换变量值为./（直接从当前服务路径下查找assets目录），打依赖包之后还原变量值（尽量减少手动维护成本）；
- 具体方案：
1. 新建变量存储文件variable.less；
2. 定义变量，如
``` css
@firstPath: '../';
@secondPath: '../../';
@thirdPath: '../../../';
```
3. 引用变量，如
```css
background: url("@{thirdPath}assets/dobogo/localCpts/name-value/1.png") center center no-repeat;
```
4. 配置打包文件，放到项目根目录即可；
5. 修改打包命令为：
`"packagr": "node variable.imgpath.js step1 && ng-packagr -p ng-package.json && node variable.imgpath.js step3"`
6. 打包文件variable.imgpath.js如下：
``` javascript
var fs = require('fs');
var args = process.argv.splice(2);

var vPath = './src/style/variable.less'; // 根据实际情况调整 
var bakPath = './src/style/variable.bak.less'; // 根据实际情况调整 

if (args == 'step1') {
  fs.readFile(vPath, 'utf8', function (err, files) {
    if (err) { console.log(err); return false; }
    fs.writeFile(bakPath, files, 'utf8', function (err) {
      if (err) { console.log(err); return false; }
      console.log('less中的图片路径变量备份成功');

      var result = files.replace(/(..\/)+/g, './');
      fs.writeFile(vPath, result, 'utf8', function (err) {
        if (err) { console.log(err); return false; }
        console.log('less中的图片路径变量替换成功');
      });
    });
  });
} else if (args == 'step3') {
  fs.readFile(bakPath, 'utf8', function (err, files) {
    if (err) { console.log(err); return false; }
    fs.writeFile(vPath, files, 'utf8', function (err) {
      if (err) { console.log(err); return false; }
      console.log('less中的图片路径变量还原成功');

      fs.unlink(bakPath, function (err) {
        if (err) { console.log(err); return false; }
        console.log('备份文件删除成功');
      });
    });
  });
}
```
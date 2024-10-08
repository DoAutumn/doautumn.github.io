---
title: markdown文件转word文件
toc: false
date: 2023-01-11 17:45:14
category: 其他
---
### 步骤
- 1、安装nodejs
- 2、安装marked，`npm i marked`
- 3、转换成doc格式前，需要把md文件转换为html标签格式，才能保留doc文件中的样式，新建立`head.html`模板文件，内容如下：
```html
<html>
  <head>
  <meta charset="utf-8">
  <title>Markdoc Preview</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">html {font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }body {margin: 0;}article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary {display: block;}audio,canvas,progress,video {display: inline-block; vertical-align: baseline; }audio:not([controls]) {display: none;height: 0;}[hidden],template {display: none;}a {background: transparent;}a:active,a:hover {outline: 0;}abbr[title] {border-bottom: 1px dotted;}b,strong {font-weight: bold;}dfn {font-style: italic;}h1 {font-size: 2em;margin: 0.67em 0;}mark {background: #ff0;color: #000;}small {font-size: 80%;}sub,sup {font-size: 75%;line-height: 0;position: relative;vertical-align: baseline;}sup {top: -0.5em;}sub {bottom: -0.25em;}img {border: 0;}svg:not(:root) {overflow: hidden;}figure {margin: 1em 40px;}hr {-moz-box-sizing: content-box;box-sizing: content-box;height: 0;}pre {overflow: auto;}code,kbd,pre,samp {font-family: monospace, monospace;font-size: 1em;}button,input,optgroup,select,textarea {color: inherit; font: inherit; margin: 0; }button {overflow: visible;}button,select {text-transform: none;}button,html input[type="button"], input[type="reset"],input[type="submit"] {-webkit-appearance: button; cursor: pointer; }button[disabled],html input[disabled] {cursor: default;}button::-moz-focus-inner,input::-moz-focus-inner {border: 0;padding: 0;}input {line-height: normal;}input[type="checkbox"],input[type="radio"] {box-sizing: border-box; padding: 0; }input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button {height: auto;}input[type="search"] {-webkit-appearance: textfield; -moz-box-sizing: content-box;-webkit-box-sizing: content-box; box-sizing: content-box;}input[type="search"]::-webkit-search-cancel-button,input[type="search"]::-webkit-search-decoration {-webkit-appearance: none;}fieldset {border: 1px solid #c0c0c0;margin: 0 2px;padding: 0.35em 0.625em 0.75em;}legend {border: 0; padding: 0; }textarea {overflow: auto;}optgroup {font-weight: bold;}table {border-collapse: collapse;border-spacing: 0;}td,th {padding: 0;}* {-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;}*:before,*:after {-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;}html {font-size: 62.5%;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}body {font-family: 'Helvetica Neue', Helvetica, Arial, 'Microsoft Yahei', sans-serif;font-size: 14px;line-height: 1.42857143;color: #333333;background-color: #ffffff;}input,button,select,textarea {font-family: inherit;font-size: inherit;line-height: inherit;}a {color: #428bca;text-decoration: none;}a:hover,a:focus {color: #2a6496;text-decoration: underline;}a:focus {outline: thin dotted;outline: 5px auto -webkit-focus-ring-color;outline-offset: -2px;}figure {margin: 0;}img {vertical-align: middle;}.hljs {display: block;overflow-x: auto;padding: 0.5em;background: #f0f0f0;-webkit-text-size-adjust: none;}.hljs,.hljs-subst,.hljs-tag .hljs-title,.nginx .hljs-title {color: black;}.hljs-string,.hljs-title,.hljs-constant,.hljs-parent,.hljs-tag .hljs-value,.hljs-rules .hljs-value,.hljs-preprocessor,.hljs-pragma,.haml .hljs-symbol,.ruby .hljs-symbol,.ruby .hljs-symbol .hljs-string,.hljs-template_tag,.django .hljs-variable,.smalltalk .hljs-class,.hljs-addition,.hljs-flow,.hljs-stream,.bash .hljs-variable,.apache .hljs-tag,.apache .hljs-cbracket,.tex .hljs-command,.tex .hljs-special,.erlang_repl .hljs-function_or_atom,.asciidoc .hljs-header,.markdown .hljs-header,.coffeescript .hljs-attribute {color: #800;}.smartquote,.hljs-comment,.hljs-annotation,.diff .hljs-header,.hljs-chunk,.asciidoc .hljs-blockquote,.markdown .hljs-blockquote {color: #888;}.hljs-number,.hljs-date,.hljs-regexp,.hljs-literal,.hljs-hexcolor,.smalltalk .hljs-symbol,.smalltalk .hljs-char,.go .hljs-constant,.hljs-change,.lasso .hljs-variable,.makefile .hljs-variable,.asciidoc .hljs-bullet,.markdown .hljs-bullet,.asciidoc .hljs-link_url,.markdown .hljs-link_url {color: #080;}.hljs-label,.hljs-javadoc,.ruby .hljs-string,.hljs-decorator,.hljs-filter .hljs-argument,.hljs-localvars,.hljs-array,.hljs-attr_selector,.hljs-important,.hljs-pseudo,.hljs-pi,.haml .hljs-bullet,.hljs-doctype,.hljs-deletion,.hljs-envvar,.hljs-shebang,.apache .hljs-sqbracket,.nginx .hljs-built_in,.tex .hljs-formula,.erlang_repl .hljs-reserved,.hljs-prompt,.asciidoc .hljs-link_label,.markdown .hljs-link_label,.vhdl .hljs-attribute,.clojure .hljs-attribute,.asciidoc .hljs-attribute,.lasso .hljs-attribute,.coffeescript .hljs-property,.hljs-phony {color: #88f;}.hljs-keyword,.hljs-id,.hljs-title,.hljs-built_in,.css .hljs-tag,.hljs-javadoctag,.hljs-phpdoc,.hljs-dartdoc,.hljs-yardoctag,.smalltalk .hljs-class,.hljs-winutils,.bash .hljs-variable,.apache .hljs-tag,.hljs-type,.hljs-typename,.tex .hljs-command,.asciidoc .hljs-strong,.markdown .hljs-strong,.hljs-request,.hljs-status {font-weight: bold;}.asciidoc .hljs-emphasis,.markdown .hljs-emphasis {font-style: italic;}.nginx .hljs-built_in {font-weight: normal;}.coffeescript .javascript,.javascript .xml,.lasso .markup,.tex .hljs-formula,.xml .javascript,.xml .vbscript,.xml .css,.xml .hljs-cdata {opacity: 0.5;}#container {padding: 15px;margin-left:20px;}pre {border: 1px solid #ccc;border-radius: 4px;display: block;}pre code {white-space: pre-wrap;}.hljs,code {font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;}pre{background-color: #dddddd;padding:8px 0px 8px 30px;word-wrap: break-word;}table tbody tr:nth-child(2n) {background: rgba(158,188,226,0.12); }:not(pre) > code {padding: 2px 4px;font-size: 90%;color: #c7254e;background-color: #f9f2f4;white-space: nowrap;border-radius: 4px;}th, td {border: 1px solid #ccc;padding: 6px 12px;}blockquote {border-left-width: 10px;background-color: rgba(102,128,153,0.05);border-top-right-radius: 5px;border-bottom-right-radius: 5px;padding: 1px 20px}blockquote.pull-right small:before,blockquote.pull-right .small:before {content: ''}blockquote.pull-right small:after,blockquote.pull-right .small:after {content: '\00A0 \2014'}blockquote:before,blockquote:after {content: ""}blockquote {margin: 0 0 1.1em}blockquote p {margin-bottom: 1.1em;font-size: 1em;line-height: 1.45}blockquote ul:last-child,blockquote ol:last-child {margin-bottom: 0}blockquote {margin: 0 0 21px;border-left: 10px solid #dddddd;}
  </style>
  </head>
  <body marginwidth="0" marginheight="0">
    <div id="container">
      replace_area
    </div>
  </body>
</html>
```
- 4、新建js脚本文件`convert.js`内容如下：
```javascript
var fs = require('fs');
var { marked } = require('marked');

// 读取第3步创建的模板html文件
var headFile = fs.readFileSync('head.html');
// 读取将要被转换的md文件
var mdFile = fs.readFileSync('mark.md');

// console.log('----正在转换...');

// 调用marked将md文件转换成html
var mdToHtmlStr = marked(mdFile.toString());
// 将md转换成html字符串替换到html模板文件中replace_area的位置
var content = headFile.toString().replace('replace_area', mdToHtmlStr);

// console.log("准备写入文件");

fs.writeFile('output.doc', content, function(err) {
  if (err) {
    return console.error(err);
  }
  console.log("数据写入成功！");
});
// console.log(content);
```
- 5、运行脚本`node convert.js`即可
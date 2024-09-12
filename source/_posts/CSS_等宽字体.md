---
title: CSS 等宽字体
date: 2024-09-12 13:12:19
toc: true
tags:
category: CSS
---
在本文中，我们将介绍CSS中的字体族属性`font-family: monospace`。我们将探讨何时使用等宽字体，以及如何在CSS中实现等宽字体的效果。

## 理解等宽字体
等宽字体是指每个字符宽度相同的字体。在等宽字体中，每个字符占据相同的空间，无论是宽字符（如W）还是窄字符（如I）。这种特性使得等宽字体在某些情况下非常有用。

等宽字体常用于编程环境和文字效果展示中，因为字符对齐非常重要。在编写代码时，等宽字体可以确保代码对齐整齐，提高可读性。此外，在展示年份、页码、数字动画时，等宽字体也可以使数字对齐，提高视觉效果。
<img width="700" alt="图1 年份对齐" src="https://foruda.gitee.com/images/1726119574055319637/1025ef99_358662.png">
<img alt="图2 页码对齐" src="https://foruda.gitee.com/images/1726119588767294440/9aabf391_358662.gif">

## 在CSS中使用等宽字体
要在CSS中使用等宽字体，我们可以使用字体族属性`font-family`。其中，`monospace`是指浏览器中默认的等宽字体。通过设置`font-family: monospace`，我们可以将元素的字体设置为等宽字体。

但是，CSS中的`font-family: monospace`其实是引用了一个字体族，而不是具体指定某种字体。不同浏览器和操作系统都可能有不同的默认等宽字体。因此，在实际开发中，我们需要明确指定等宽字体的具体名称。

## 自定义等宽字体
在CSS中，我们可以使用更具体的等宽字体名称来替代默认的`monospace`字体。以下是一些常见的等宽字体：
- Monaco
- Courier New
- Consolas
- Menlo

```css
.example {
  font-family: Monaco, Courier New, Consolas, Menlo, monospace;
}
```
上面的代码示例中，我们已将等宽字体设定为Monaco。如果Monaco字体不可用，则依次使用Courier New、Consolas和Menlo字体。最后，如果以上字体都不可用，浏览器将使用默认的等宽字体。

## 其他
网上还有说使用`font-feature-settings: "tnum"`[这里](https://yeelz.com/post/554.html) 或 `font-variant-numeric: tabular-nums;`[这里](https://blog.csdn.net/aexwx/article/details/126015451)来设置的，但测试并未生效。
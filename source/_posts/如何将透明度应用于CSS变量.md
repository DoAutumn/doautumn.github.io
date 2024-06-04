---
title: 如何将透明度应用于CSS变量
toc: true
date: 2024-06-04 17:05:49
tags: CSS变量
category: 技术分享
---
当我们使用CSS变量开发页面主题时，难免遇到这样的场景，假设有一个主色`--primary-color: #2a8b92;`，在某些地方想使用透明度为0.5的主色、0.8的主色。。。这个时候该怎么办呢？在这之前，我只能定义多个主色变量：
```css
:root {
  --primary-color: #2a8b92;
  --primary-color-opacity-05: rgba(42, 139, 146, 0.5);
  --primary-color-opacity-08: rgba(42, 139, 146, 0.8);
  --primary-color-opacity-10: rgba(42, 139, 146, 1);
}
```
这样一来，需要维护的变量就太多了，好在CSS变量支持如下写法：
```css
:root {
  --primary-color: 42, 139, 146;
}
```
使用时只需这样即可：
```css
.element {
  background: rgba(var(--primary-color), 0.5);
  border-color: rgba(var(--primary-color), 1);
}
```
但这样每次使用时都需要写rgb或rgba，略微麻烦，所以一般可以这样：
```css
:root {
  --primary-color-rgb: 42, 139, 146;
  --primary-color-hex: #2a8b92;
}
```
这样当需要透明度时使用`--primary-color-rgb`，当不需要透明度时直接使用`--primary-color-hex`
```css
.element {
  background: rgba(var(--primary-color-rgb), 0.5);
  border-color: var(--primary-color-hex);
}
```
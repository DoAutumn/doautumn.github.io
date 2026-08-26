# Blog Repository

个人博客：[https://doautumn.github.io/](https://doautumn.github.io/)

技术栈：Hexo + GitHub Pages。`main` 为源码分支，`blog` 为站点产物分支；推送到 `main` 后由 GitHub Actions 自动构建并部署。

## 发布一篇新博文

文章放在 `source/_posts/`，需带 front-matter，例如：

```markdown
---
title: 我的新文章
toc: true
date: 2026-08-26 10:00:00
tags: [标签]
category: 分类
---

正文……
```

### 方式 A：本机提交

1. 在 `source/_posts/` 新建 `.md` 文件（文件名建议用英文或中文均可，会参与生成路径）
2. 提交并推送到 `main`：

```bash
git add source/_posts/我的新文章.md
git commit -m "发布：我的新文章"
git push origin main
```

3. 打开仓库 **Actions**，等待 `Deploy Hexo` 成功（约 1–3 分钟）
4. 按 permalink 规则访问，例如：`https://doautumn.github.io/2026/08/26/我的新文章/`

### 方式 B：网页操作

1. 打开仓库 → `source/_posts` → **Add file** → Upload files / Create new file
2. 上传或写好 `.md`，Commit 到 `main`
3. 等待 Actions 完成后即可访问

## 修改已发布的博文

可以。编辑同一篇 `source/_posts/xxx.md`，再 commit 并 push 到 `main`，Actions 会重新构建并覆盖站点。

注意：

- 只改正文或 tags 等：链接一般不变，刷新即可看到更新
- 改文件名，或改会影响 permalink 的 `title` / `date`：旧 URL 会失效，变成新地址
- 想保留旧链接：不要改文件名，也不要改会进入 URL 的 `date`（以及 permalink 中的 `title`）

## 本地开发（可选）

日常发文不必本机部署。仅需本地预览时：

```bash
npm i -g hexo-cli   # 首次
npm install
hexo server
```

本机不再需要执行 `hexo clean` / `hexo deploy`；发布由 `.github/workflows/deploy.yml` 自动完成。

## 仓库信息

- 源码分支：`main`
- 部署分支：`blog`（GitHub Pages 从此分支发布）
- 站点配置：`_config.yml`

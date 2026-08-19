---
title: 在极空间 Docker 中用 Compose 部署 GitLab
toc: true
date: 2026-08-19 17:41:55
tags: [极空间,GitLab]
category: 极空间
---

> 适用环境：极空间 NAS（Zspace）自带 Docker / Compose  
> 示例版本：GitLab CE `18.4.6-ce.0`  
> 访问示例：`http://192.168.1.x:8929`

本文记录一次在极空间上用 **Compose 官方镜像** 部署 GitLab 的完整过程，以及几个容易踩坑的地方。若你也曾想过「先开个 CentOS 容器再装 RPM」，建议直接看完第一节。

---

## 一、为什么不要用 CentOS 容器装 GitLab RPM

极空间的 Docker 里新建一个 CentOS 容器，再把 `gitlab-ce-*.el8.x86_64.rpm` 装进去，看起来很直观，但通常会踩坑：

| 检查项 | 常见现状 | 影响 |
| --- | --- | --- |
| 进程模型 | PID 1 是 `bash`，没有 systemd | Omnibus 依赖 `gitlab-runsvdir`，服务起不来或极不稳定 |
| `/dev/shm` | 默认往往只有 64MB | PostgreSQL / GitLab 容易异常 |
| 资源 | CPU / 内存本身可能够用 | **硬件够 ≠ 环境适合装 RPM** |

结论：

- **硬件资源**（例如 8 核、16GB 内存、大容量磁盘）往往足够跑小型 GitLab
- **不适合**在「无 systemd 的业务容器」里装 Omnibus RPM
- **推荐**：用极空间 Compose 直接跑官方镜像 `gitlab/gitlab-ce`

官方镜像和 RPM 本质都是 GitLab CE Omnibus，差别主要在安装与运行方式，不是功能版本线不同。

---

## 二、部署前准备

1. 打开极空间 App
2. 进入 **Docker → Compose**
3. 在存储中准备一个目录，例如共享文件夹下的 `gitlab`（后面作为 Compose「存储位置」）
4. 建议空闲内存 ≥ **8GB**（官方对小团队也更推荐充足内存）
5. 确认端口不被占用，本文示例：
   - Web：`8929`
   - Git SSH：`2222`（避开系统 22）

---

## 三、新建 Compose 项目

1. **Compose → 新增项目**
2. 项目名例如：`gitlab`
3. **先选择存储位置**（指向你建好的 `gitlab` 目录）
4. 将下面内容粘贴到 Compose 配置中：

```yaml
services:
  gitlab:
    image: docker.1ms.run/gitlab/gitlab-ce:18.4.6-ce.0
    container_name: gitlab
    hostname: gitlab
    restart: unless-stopped
    shm_size: "256m"
    ports:
      - "8929:80"
      - "2222:22"
    volumes:
      - ./config:/etc/gitlab
      - ./logs:/var/log/gitlab
      - ./data:/var/opt/gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://192.168.1.8:8929'
        nginx['listen_port'] = 80
        nginx['listen_https'] = false
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
```

把其中的 `192.168.1.8` 换成你自己的极空间 IP。

### 配置说明

| 项 | 作用 |
| --- | --- |
| `8929:80` | 浏览器访问 NAS 的 8929，转发到容器内 Nginx 的 80 |
| `2222:22` | `git clone` 走 SSH 时使用 2222 |
| `shm_size: 256m` | 共享内存，过小容易导致数据库/服务异常 |
| `./config` 等相对路径 | 相对「存储位置」，符合极空间路径校验 |
| `external_url` | 浏览器地址栏应使用的对外 URL（含端口） |
| `nginx['listen_port'] = 80` | **关键**：容器内仍监听 80，才能匹配 `8929:80` |
| `gitlab_shell_ssh_port = 2222` | 让 GitLab 生成的 SSH clone 地址带正确端口 |

保存后部署/启动。首次启动会拉镜像并初始化，通常需要数分钟到十几分钟。

---

## 四、国内拉镜像超时怎么办

若出现类似错误：

```text
Get "https://registry-1.docker.io/v2/": context deadline exceeded
```

说明访问 Docker Hub 超时。可选处理：

### 1）Compose 直接换镜像前缀（最快）

```yaml
image: docker.1ms.run/gitlab/gitlab-ce:18.4.6-ce.0
```

或：

```yaml
image: docker.m.daocloud.io/gitlab/gitlab-ce:18.4.6-ce.0
```

一个源不行就换另一个。

---

## 五、常见报错与处理

### 1. `invalid volume path: /gitlab/config`

极空间不接受随意编写的绝对路径（如 `/gitlab/config`）。

正确做法：

1. 新建项目时选好 **存储位置**
2. volumes 使用相对路径：

```yaml
volumes:
  - ./config:/etc/gitlab
  - ./logs:/var/log/gitlab
  - ./data:/var/opt/gitlab
```

### 2. `network gitlab_default is ambiguous (2 matches found on name)`

说明存在同名残留网络（多次失败部署常见）。

处理：

1. 停止相关 Compose 项目
2. 在 Docker **网络** 页删除多余的 `gitlab` / `gitlab_default`
3. 清理失败残留容器后重新部署

### 3. 容器显示启动成功，但浏览器打不开 `IP:8929`

先区分两类问题：

**A. 宿主机根本没有监听 8929**

在电脑上会表现为 `Connection refused`。检查 Compose 的 `ports` 是否真的包含 `8929:80`，以及容器详情中的端口映射。

**B. GitLab 已起来，但端口映射对不上（非常常见）**

若在容器内：

```bash
gitlab-ctl status   # 基本都是 run
curl -I http://127.0.0.1:8929/   # 通
curl -I http://127.0.0.1/        # 不通
```

说明：只写了

```ruby
external_url 'http://192.168.1.8:8929'
```

时，Omnibus 会让 **容器内 Nginx 也监听 8929**。  
而 Compose 映射的是 `8929:80`，流量打到容器 80，自然访问失败。

处理方式（推荐写进 Compose，一次做对）：

```ruby
external_url 'http://192.168.1.8:8929'
nginx['listen_port'] = 80
nginx['listen_https'] = false
```

若项目已在跑，也可进容器改 `/etc/gitlab/gitlab.rb`，然后：

```bash
gitlab-ctl reconfigure
curl -I http://127.0.0.1/
```

确认 80 通后再用浏览器访问。

> 补充：部分极空间版本的 Compose 项目不支持事后单独改端口映射，因此 **创建时就把 `ports` 和 `GITLAB_OMNIBUS_CONFIG` 写对** 更省事。

### 4. 想干净重来

1. 停止并删除旧 Compose 项目
2. 删除残留容器、同名网络
3. 若配置已被写坏、希望全新初始化：换一个新的存储目录，或清空旧的 `config` / `logs` / `data`
4. 用本文正确配置重新创建项目

---

## 六、首次登录

浏览器打开：

```text
http://你的极空间IP:8929
```

初始 `root` 密码通常在容器内：

```bash
grep 'Password:' /etc/gitlab/initial_root_password
```

该文件一般在约 24 小时后自动删除，尽快登录并修改密码。

Git SSH 克隆示例：

```bash
git clone ssh://git@你的极空间IP:2222/用户名/项目.git
```

---

## 七、推荐的最小检查清单

部署完成后建议依次确认：

1. `gitlab-ctl status` 均为 `run`
2. 容器内 `curl -I http://127.0.0.1/` 返回 HTTP 响应
3. 电脑浏览器可打开 `http://IP:8929`
4. （可选）`2222` 端口可做 Git SSH

---

## 八、完整配置模板（可直接复制）

把 IP 改成你的极空间地址；如需镜像站，只改 `image` 一行。

```yaml
services:
  gitlab:
    image: docker.1ms.run/gitlab/gitlab-ce:18.4.6-ce.0
    container_name: gitlab
    hostname: gitlab
    restart: unless-stopped
    shm_size: "256m"
    ports:
      - "8929:80"
      - "2222:22"
    volumes:
      - ./config:/etc/gitlab
      - ./logs:/var/log/gitlab
      - ./data:/var/opt/gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://192.168.1.8:8929'
        nginx['listen_port'] = 80
        nginx['listen_https'] = false
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
```

---

## 九、小结

在极空间上部署 GitLab，更稳妥的路径是：

1. 用 **Compose + 官方镜像**，不要在临时 CentOS 容器里硬装 RPM  
2. 卷路径用 **存储位置 + 相对路径**  
3. 国内注意 **镜像加速 / 镜像前缀**  
4. `external_url` 带端口时，务必同时设置 **`nginx['listen_port'] = 80`**，与 `主机端口:80` 的映射一致  
5. 创建时把端口和 Omnibus 配置写对，避免后期界面无法改端口

按上述配置，一般可以稳定得到一个可从局域网访问的 GitLab 实例。

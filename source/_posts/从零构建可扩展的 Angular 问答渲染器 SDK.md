---
title: 从零构建可扩展的 Angular 问答渲染器 SDK
toc: true
date: 2025-09-02 10:33:39
tags: [Angular,渲染器,注册中心,Provided by 豆包]
category: Angular
sticky: 10
---
在开发类似豆包、通义千问的问答产品时，前端经常需要处理大模型返回的多样化内容 —— 表格、图表、参考文档、工具调用等，甚至未来可能出现视频、音频等新类型。如果将所有渲染逻辑耦合在一起，不仅代码臃肿难维护，后续扩展新类型更是举步维艰。

本文将带你从零设计并实现一个可扩展的 Angular 问答渲染器 SDK，它默认集成表格和图表渲染能力，开发者无需额外配置即可使用；同时支持自定义渲染器注册，完美适配业务的持续迭代需求。
## 一、需求与设计目标
在动手前，我们先明确 SDK 的核心需求与设计目标，确保架构方向不跑偏：

**核心需求**
1. **默认能力**：SDK 内置 Table 和 Chart 两种渲染器，开发者导入即可用，无需手动配置；
2. **灵活扩展**：支持开发者自定义渲染器（如参考文档、工具调用），通过简单方式注册到 SDK；
3. **易用性**：提供两种导入方式 —— 无自定义渲染器时直接导入模块，有自定义需求时用 forRoot 配置；
4. **组件化**：基于 Angular 组件封装渲染逻辑，而非原生 DOM 操作，符合 Angular 最佳实践。

**设计目标**
- 遵循**开闭原则**：新增渲染类型无需修改 SDK 核心代码，只需扩展新组件；
- 遵循**单一职责**：每种渲染器只负责对应类型的内容渲染，职责清晰；
- 低耦合：渲染逻辑与核心框架解耦，便于独立开发、测试和维护；
- 兼容性：默认渲染器与自定义渲染器无缝协作，支持优先级覆盖（可选）。
## 二、整体架构设计
基于需求，我们采用 **“接口定义 + 默认实现 + 注册中心 + 动态加载”** 的架构模式，整体分为 5 大核心模块：

1. **接口层**：定义统一的渲染器接口，保证所有渲染器实现一致性；
2. **默认渲染器**：SDK 内置 Table 和 Chart 渲染器，基于 Angular 组件实现；
3. **注册中心**：通过服务管理所有渲染器（默认 + 自定义），提供注册、查询能力；
4. **核心渲染容器**：根据内容类型（flag）从注册中心匹配渲染器，动态加载并渲染；
5. **模块封装**：对外提供统一的模块入口，支持基础导入和带配置导入两种方式。
## 三、SDK 核心实现
代码地址：[https://github.com/doautumn/chat-renderer](https://github.com/doautumn/chat-renderer)
```
.
├── lib
│   ├── components
│   │   └── renderer-container        // 核心渲染容器
│   ├── decorators
│   │   └── renderer-decorator.ts     // 装饰器，绑定渲染器与flag
│   ├── interfaces
│   │   └── on-render.ts              // 渲染器组件接口，所有渲染器组件必须实现此接口，确保都接收 data 输入
│   ├── models
│   │   └── renderer-model.ts         // 渲染器模型，通义数据结构为 { "flag": "xxx", "content": [...] }
│   ├── renderer.module.ts
│   ├── renderers                     // 默认渲染器，可覆盖
│   │   ├── chart-renderer
│   │   └── table-renderer
│   ├── services                      // 渲染器注册中心，负责注册、查找渲染器
│   │   └── renderer-registry.service.ts
│   └── tokens
│       └── renderer-config.ts
├── public-api.ts
└── test.ts
```
## 四、使用方式
### 1. 安装依赖
```bash
npm install @tui/chat
```

### 2. 自定义渲染器
```typescript
import { Component, OnInit } from '@angular/core';
import { OnRender, Renderer, RendererModel } from '@tui/chat';

@Renderer(['video', 'audio'])
@Component({
  selector: 'media-renderer',
  template: `
    <div class="media-container">
      <video *ngIf="data.flag === 'video'" [src]="data.content[0].src" controls></video>
      <audio *ngIf="data.flag === 'audio'" [src]="data.content[0].src" controls></audio>
      <p>{{ data.content[0].title }}</p>
    </div>
  `
})
export class MediaRendererComponent implements OnInit, OnRender {
  data: RendererModel;

  ngOnInit(): void {
  }
}
```

### 3. 引入模块并注册自定义渲染器
```typescript
import { RendererModule } from '@tui/chat';

@NgModule({
  // 无自定义渲染器时
  imports: [
    RendererModule
  ],

  // 有自定义渲染器时
  imports: [
    RendererModule.forRoot({
      renderers: [MediaRendererComponent]
    })
  ],
})
export class AppModule {}
```

### 4. 使用组件
```typescript
import { RendererModel } from '@tui/chat';

// 示例内容数据
contents: RendererModel[] = [
  {
    flag: "table",
    content: [
      {
        columns: [
          { key: "time", title: "时间" },
          { key: "name", title: "告警名称", color: "#43bff4" },
          { key: "ip", title: "IP" },
          { key: "severity", title: "严重级别", colorMapping: { "高": "#ff4a4a", "中": "#eab045", "低": "#43bff4" } },
        ],
        data: [
          { time: "2025-09-01 10:00:00", name: "SQL注入", ip: "10.1.10.1", severity: "高" },
          { time: "2025-09-01 10:00:01", name: "SQL注入", ip: "10.1.10.1", severity: "中" }
        ]
      }
    ],
    description: '这是内置的表格渲染器'
  },
  {
    flag: 'chart',
    content: [
      {
        title: '图表标题',
        chartName: 'TrxLineChart',
        dataConfig: {
          x: ['time'],
          y: ['value'],
          data: [
            { time: '2025-09-01', value: 100 },
            { time: '09-02', value: 200 },
            { time: '09-03', value: 150 },
            { time: '09-04', value: 400 },
            { time: '09-05', value: 100 },
            { time: '09-06', value: 250 },
            { time: '09-07', value: 700 },
          ]
        }
      }
    ],
    description: '这是内置的图表渲染器'
  },
  {
    flag: 'video',
    content: [
      {
        src: 'https://www.w3school.com.cn/i/movie.mp4',
        title: '视频标题'
      }
    ],
    description: '这是自定义的视频渲染器'
  }
];
```

```html
<t-renderer 
  *ngFor="let item of contents" 
  [data]="item"
></t-renderer>
```
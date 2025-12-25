# schema-platform

规划中

```
schema-platform/
├── apps/                          # 存放所有应用程序
│   ├── web-germline/              # [前端A] 遗传病医生专用系统 (React/Vue)
│   │   └── 侧重：ACMG打分器、家系图绘制、一代验证
│   │   
│   ├── web-somatic/               # [前端B] 肿瘤科医生专用系统 (React/Vue)
│   │   └── 侧重：药物匹配列表、生存曲线、TMB仪表盘
│   │   
│   └── backend-api/               # [后端] 统一的 API 网关 (Python/Go)
│       └── 功能：统一管理 Auth、数据库、Nextflow 任务调度
│
├── packages/                      # 存放共享代码库 (这是工业化的精髓)
│   ├── ui-kit/                    # [UI组件库] 按钮、Logo、导航栏
│   │   └── 确保两套系统看起来都是“绳墨生物”出品，风格统一
│   │   
│   ├── duckdb-client/             # [分析核心] 封装好的 DuckDB WASM 逻辑
│   │   └── 两套前端都要用它来分析 Parquet，写一份代码，两边复用
│   │   
│   └── types/                     # [类型定义] 
│       └── 前后端共用的 API 接口定义，改一处，全自动更新
│
├── docker-compose.yml             # 一键启动所有服务
└── README.md
```

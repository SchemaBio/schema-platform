# 前端安全性加固与 UUID 规范化 实施计划

> **Goal:** 修复安全审计中发现的所有前端安全问题，统一 UUID 生成方式。

**Architecture:** 纯前端改动，不依赖后端变更。分为三个层次：数据安全层（加密/令牌）、应用安全层（XSS/CSP/UUID）、代码质量层（键名统一）。

**Tech Stack:** TypeScript, Next.js 14, DOMPurify, Web Crypto API

---

## 层级一：数据安全（高优先级）

### Task 1: 密码传输前客户端哈希

**目标**: 登录/注册/改密时，密码在前端 SHA-256 哈希后再传输，防止明文出现在网络日志中。

**涉及文件:**
- `apps/web-germline/src/app/login/page.tsx`
- `apps/web-somatic/src/app/login/page.tsx`
- `apps/web-germline/src/lib/auth.ts`
- `apps/web-somatic/src/lib/auth.ts`
- 新增: `apps/*/src/lib/crypto.ts` (共享哈希工具)

**方案**: 前端对密码做 `SHA-256(password + email)` 后发送。后端需做相同哈希后比对（超出前端范围，但前端改动后哈希值不变，后端可独立升级）。

**风险**: 后端当前期望明文密码，若后端未同步升级则登录失败。改为：仅在 `api.ts` 层面透明哈希，对调用者无感。

---

### Task 2: Token 存储从 localStorage 迁移到 httpOnly Cookie

**目标**: 消除 XSS 窃取 token 风险。

**涉及文件:**
- `apps/web-germline/src/lib/api.ts`
- `apps/web-somatic/src/lib/api.ts`
- `apps/web-germline/src/components/providers/AuthProvider.tsx`
- `apps/web-somatic/src/components/providers/AuthProvider.tsx`

**方案**: 前端不再手动管理 token。依赖后端在 Set-Cookie 返回 httpOnly cookie。前端 `fetch` 自动附带 cookie（`credentials: 'include'`）。移除所有 localStorage token 读写。

**阻塞**: 需要后端配合设置 httpOnly Cookie（`Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax`）。**当前阶段可先做前端侧准备，添加 `credentials: 'include'` 并保留 localStorage 作为降级方案**。

---

### Task 3: AI API Key 加密存储

**目标**: `openaiApiKey` 不再以明文存 localStorage。

**涉及文件:**
- `apps/web-germline/src/components/providers/AIProvider.tsx`
- `apps/web-somatic/src/components/providers/AIProvider.tsx`
- 新增: `apps/*/src/lib/crypto.ts`

**方案**: 使用 Web Crypto API (`SubtleCrypto`) 的 AES-GCM 加密。派生密钥来自用户 session（token hash）。读写时加解密。

---

### Task 4: 自动 Token 刷新拦截器

**目标**: Token 即将过期时自动续期，避免用户操作中断。

**涉及文件:**
- `apps/web-germline/src/lib/api.ts`
- `apps/web-somatic/src/lib/api.ts`

**方案**: 在 `request()` 函数中增加 401 响应拦截。当收到 401 时自动调用 refresh 接口，成功后重试原始请求。使用刷新锁防止并发刷新。

---

## 层级二：应用安全（中优先级）

### Task 5: DOMPurify 消毒 dangerouslySetInnerHTML

**目标**: 防止通过报告预览/HTML 注入造成的 XSS。

**涉及文件:**
- `apps/web-germline/src/app/(main)/tasks/[uuid]/components/ReportTab.tsx`
- `apps/web-somatic/src/app/(main)/analysis/[uuid]/components/ReportTab.tsx`

**方案**: 安装 `dompurify` + `@types/dompurify`，对所有 `dangerouslySetInnerHTML` 内容做消毒处理。

---

### Task 6: 添加 CSP 安全头

**目标**: 防御 XSS、数据注入攻击。

**涉及文件:**
- `apps/web-germline/next.config.js`
- `apps/web-somatic/next.config.js`

**方案**: 在 next.config.js 的 headers() 中添加 Content-Security-Policy、X-Content-Type-Options、X-Frame-Options 等安全头。

---

### Task 7: UUID 迁移到 crypto.randomUUID()

**目标**: 消除不安全的 Math.random() UUID 生成，使用 Web Crypto API。

**涉及文件:**
- `apps/web-germline/src/app/(main)/pipeline/baseline/page.tsx`
- `apps/web-somatic/src/app/(main)/pipeline/baseline/page.tsx`
- `apps/web-germline/src/app/(main)/samples/pedigree/mock-data.ts`
- `apps/web-germline/src/app/(main)/tasks/new/page.tsx`
- `apps/web-somatic/src/app/(main)/analysis/new/page.tsx`
- 新增: `apps/*/src/lib/uuid.ts` (统一工具函数)

**方案**: 创建共享 `generateUUID()` 工具函数（`crypto.randomUUID()`），替换全部 5 处 `Math.random()` 实现。

---

### Task 8: UUID 格式校验

**目标**: 确保从后端接收的 ID 符合 UUID v4 格式，防止数据异常传播。

**涉及文件:**
- 新增: `apps/*/src/lib/uuid.ts`

**方案**: 添加 `isValidUUID(str)` 正则校验函数，用于关键 ID 校验。

---

### Task 9: 移除登录页硬编码 Demo 凭据

**目标**: 不在源码中暴露演示账号。

**涉及文件:**
- `apps/web-germline/src/app/login/page.tsx`
- `apps/web-somatic/src/app/login/page.tsx`

**方案**: 将 demo 凭据移到环境变量 `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD`。

---

## 层级三：代码质量（低优先级）

### Task 10: 统一 localStorage 键名

**目标**: 消除三套并行的 token 存储键名方案。

**涉及文件:**
- `apps/web-germline/src/lib/api.ts`
- `apps/web-somatic/src/lib/api.ts`
- `apps/web-germline/src/components/providers/AuthProvider.tsx`
- `apps/web-somatic/src/components/providers/AuthProvider.tsx`
- `apps/web-germline/src/components/providers/AIProvider.tsx`

**方案**: 所有 localStorage key 统一使用 `schema_` 前缀单一命名空间。`api.ts` 的 `getAuthToken/setAuthTokens/clearAuthTokens` 指向同一套 key。

---

### Task 11: XSS 输入消毒

**目标**: 对用户输入字段做消毒，防止存储型 XSS。

**涉及文件:**
- 搜索所有 `dangerouslySetInnerHTML`
- 搜索所有用户输入直接渲染

**方案**: 对后端返回的 HTML 内容（报告预览等）统一过 DOMPurify。用户输入的搜索/表单字段做 HTML 转义。

---

## 实施顺序

```
Phase 1 (今天): Task 7 → Task 9 → Task 10  (UUID/凭据/键名 — 低风险无依赖)
Phase 2 (今天): Task 5 → Task 6             (XSS/CSP — 防御层)
Phase 3 (今天): Task 4 → Task 1            (Token刷新/密码哈希 — 涉及请求流)
Phase 4 (今天): Task 3 → Task 8             (AI Key加密/UUID校验)
Task 2 和 Task 11 依赖后端配合，作为后续任务。
```

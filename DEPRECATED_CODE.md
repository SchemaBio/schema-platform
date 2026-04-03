# 废弃代码清单

> 本文档整理了 `web-germline` 和 `web-somatic` 两个应用中可能需要删除的废弃代码。
> 请复核后确认删除。

---

## 一、完全未使用的文件（建议删除）

### 1.1 web-germline - 未使用的 API 模块

| 文件路径 | 说明 | 删除影响 |
|---------|------|---------|
| `apps/web-germline/src/lib/geneList.ts` | 基因列表 API 模块，未被任何文件导入 | 无影响 |
| `apps/web-germline/src/lib/pedigree.ts` | 家系 API 模块 (`pedigreeApi`, `pedigreeMemberApi`)，未被任何文件导入 | 无影响 |
| `apps/web-germline/src/lib/user.ts` | 用户 API 模块 (`userApi`)，未被任何文件导入 | 无影响 |

### 1.2 web-germline - 未使用的类型定义文件

| 文件路径 | 说明 | 删除影响 |
|---------|------|---------|
| `apps/web-germline/src/types/geneList.ts` | 基因列表类型定义，仅被 `lib/geneList.ts` 内部使用（该文件也将删除） | 无影响 |
| `apps/web-germline/src/types/pedigree.ts` | 家系类型定义，仅被 `lib/pedigree.ts` 内部使用（该文件也将删除） | 无影响 |
| `apps/web-germline/src/types/common.ts` | 分页类型定义 (`PaginatedResponse`, `QueryParams`)，仅被上述未使用的 API 模块引用 | 无影响 |

---

## 二、导出但未被外部导入的组件（建议删除或清理导出）

### 2.1 两个应用共同 - 未使用的布局组件

| 文件路径 | 组件名 | 说明 |
|---------|--------|------|
| `apps/web-germline/src/components/layout/PageHeader.tsx` | `PageHeader` | 从 index.ts 导出，但未被任何页面导入 |
| `apps/web-germline/src/components/layout/SearchInput.tsx` | `SearchInput` | 从 index.ts 导出，有 TODO 标记，功能未实现 |
| `apps/web-germline/src/components/layout/MainNav.tsx` | `MainNav` | 从 index.ts 导出，未被直接使用（SidebarNav 有自己的实现） |
| `apps/web-somatic/src/components/layout/PageHeader.tsx` | `PageHeader` | 同上 |
| `apps/web-somatic/src/components/layout/SearchInput.tsx` | `SearchInput` | 同上，有 TODO 标记 |
| `apps/web-somatic/src/components/layout/MainNav.tsx` | `MainNav` | 同上 |

**建议**: 删除这 6 个组件文件，并从各自的 `components/layout/index.ts` 中移除导出。

---

## 三、导出但未被使用的 Hooks（建议清理导出）

### 3.1 两个应用共同 - 未使用的响应式 Hooks

| 文件路径 | Hook 名称 | 说明 |
|---------|----------|------|
| `apps/web-germline/src/hooks/useMediaQuery.ts` | `useIsMobile` | 从 index.ts 导出，未被导入 |
| `apps/web-germline/src/hooks/useMediaQuery.ts` | `useIsTablet` | 从 index.ts 导出，未被导入 |
| `apps/web-germline/src/hooks/useMediaQuery.ts` | `useIsDesktop` | 从 index.ts 导出，未被导入 |
| `apps/web-germline/src/hooks/useMediaQuery.ts` | `useResponsiveMode` | 从 index.ts 导出，未被导入 |
| `apps/web-germline/src/hooks/useMediaQuery.ts` | `ResponsiveMode` (type) | 从 index.ts 导出，未被导入 |
| `apps/web-somatic/src/hooks/useMediaQuery.ts` | 同上 5 个 | 同上 |

**注意**: `useMediaQuery` 基础 hook 被 `useSidebarState` 内部使用，不应删除。

**建议**: 保留 `useMediaQuery.ts` 文件和基础 `useMediaQuery` hook，删除便捷 hooks 或从 `hooks/index.ts` 中移除它们的导出。

---

## 四、未使用的类型定义（建议删除）

### 4.1 auth.ts 中的 UserRole 类型

| 文件路径 | 类型名 | 说明 |
|---------|-------|------|
| `apps/web-germline/src/types/auth.ts` (第4行) | `UserRole` | 标记为 "legacy compatibility"，但从未被导入使用 |
| `apps/web-somatic/src/types/auth.ts` (第4行) | `UserRole` | 同上 |

**建议**: 删除这两个类型定义行。

---

## 五、Mock 数据文件（可选删除）

> 这些文件在开发阶段用于模拟数据，如果已连接真实后端 API，可考虑删除。

### 5.1 web-germline Mock 文件

| 文件路径 | 行数 | 说明 |
|---------|------|------|
| `apps/web-germline/src/app/(main)/tasks/[uuid]/mock-data.ts` | ~964 行 | 任务详情 Mock 数据 |
| `apps/web-germline/src/app/(main)/history/mock-data.ts` | ~653 行 | 历史记录 Mock 数据 |
| `apps/web-germline/src/app/(main)/samples/pedigree/mock-data.ts` | ~290 行 | 家系 Mock 数据 |
| `apps/web-germline/src/app/(main)/samples/mock-data.ts` | ~273 行 | 样本 Mock 数据 |

### 5.2 web-somatic Mock 文件

| 文件路径 | 行数 | 说明 |
|---------|------|------|
| `apps/web-somatic/src/app/(main)/analysis/[uuid]/mock-data.ts` | ~1124 行 | 分析详情 Mock 数据 |
| `apps/web-somatic/src/app/(main)/history/mock-data.ts` | ~407 行 | 历史记录 Mock 数据 |
| `apps/web-somatic/src/app/(main)/samples/mock-data.ts` | ~273 行 | 样本 Mock 数据 |

**建议**: 如果项目已准备好连接后端 API，删除这些 Mock 文件。否则保留用于开发测试。

---

## 六、TODO 标记的未完成代码

| 文件路径 | 行号 | 内容 | 建议 |
|---------|------|------|------|
| `apps/web-germline/src/components/layout/SearchInput.tsx` | 15 | `// TODO: Implement search functionality` | 删除整个组件 |
| `apps/web-somatic/src/components/layout/SearchInput.tsx` | 15 | `// TODO: Implement search functionality` | 删除整个组件 |
| `apps/web-germline/src/app/(main)/samples/[uuid]/page.tsx` | 53 | `// TODO: Implement sample redo functionality` | 功能待实现，保留 |
| `apps/web-germline/src/app/(main)/tasks/[uuid]/hooks/useCNVAssessment.ts` | 125 | `// TODO: 这里可以添加API调用来持久化到后端` | 功能待实现，保留 |
| `apps/web-somatic/src/app/(main)/analysis/[uuid]/hooks/useCNVAssessment.ts` | 125 | 同上 | 功能待实现，保留 |

---

## 七、汇总统计

| 类别 | web-germline | web-somatic | 总计 |
|------|-------------|-------------|------|
| 未使用的 API 模块文件 | 3 | 0 | 3 |
| 未使用的类型定义文件 | 3 | 0 | 3 |
| 未使用的布局组件 | 3 | 3 | 6 |
| 未使用的便捷 Hooks 导出 | 5 | 5 | 10 |
| 未使用的 UserRole 类型 | 1 | 1 | 2 |
| Mock 数据文件（可选） | 4 | 3 | 7 |
| TODO 未完成代码 | 3 | 2 | 5 |

---

## 八、删除优先级建议

### 高优先级（安全删除，无影响）

1. **删除 web-germline 未使用的 API 模块**
   - `lib/geneList.ts`
   - `lib/pedigree.ts`
   - `lib/user.ts`

2. **删除 web-germline 未使用的类型文件**
   - `types/geneList.ts`
   - `types/pedigree.ts`
   - `types/common.ts`

3. **删除 UserRole 类型定义**（两个应用）

4. **删除未使用的布局组件**（两个应用的 PageHeader, SearchInput, MainNav）

### 中优先级（清理导出）

5. **清理 hooks/index.ts 导出**（移除未使用的便捷 hooks）

### 低优先级（视情况删除）

6. **Mock 数据文件** - 仅在确认后端 API 已就绪后删除

---

## 九、复核检查清单

删除前请确认：

- [ ] 检查是否有动态导入或条件导入
- [ ] 检查是否有测试文件引用这些代码
- [ ] 检查是否有环境变量控制的导入
- [ ] 确认 Mock 文件是否还被开发环境使用
- [ ] 运行 TypeScript 编译检查 (`tsc --noEmit`)
- [ ] 运行 ESLint 检查
- [ ] 运行测试套件确保无遗漏

---

*文档生成日期: 2026-04-03*
# Schema Platform 发布规范

## 发布格式

只支持以下格式触发镜像构建：

```
backend: v1.0.0
germline: v1.0.0
somatic: v1.0.0
```

其他格式的 commit 不会触发构建。

## 发布命令

### 正式版本（推送到 latest）

```bash
# 发布后端
git commit -m "backend: v1.0.0" --allow-empty && git push

# 发布 Germline
git commit -m "germline: v1.0.0" --allow-empty && git push

# 发布 Somatic
git commit -m "somatic: v1.0.0" --allow-empty && git push
```

### 预发布版本（不推送到 latest）

版本号带后缀（如 beta, alpha, rc）不会推送到 latest：

```bash
git commit -m "backend: v1.0.0beta" --allow-empty && git push
```

## 触发规则

| Commit | 构建镜像 | Tags |
|--------|----------|------|
| `backend: v1.0.0` | schema-backend | `v1.0.0`, `latest` |
| `germline: v1.0.0` | schema-germline | `v1.0.0`, `latest` |
| `somatic: v1.0.0` | schema-somatic | `v1.0.0`, `latest` |
| `backend: v1.0.0beta` | schema-backend | `v1.0.0beta` (无 latest) |
| 其他格式 | 不构建 | - |

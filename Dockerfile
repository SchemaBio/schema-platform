# Schema Platform - Multi-app Docker Build
# 支持独立部署 web-germline 和 web-somatic 应用

# ============ 基础镜像 ============
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============ 依赖安装阶段 ============
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ui-kit/package.json ./packages/ui-kit/
COPY packages/types/package.json ./packages/types/
COPY packages/duckdb-client/package.json ./packages/duckdb-client/
COPY packages/feature-sample/package.json ./packages/feature-sample/
COPY packages/feature-user/package.json ./packages/feature-user/
COPY apps/web-germline/package.json ./apps/web-germline/
COPY apps/web-somatic/package.json ./apps/web-somatic/
RUN pnpm install --frozen-lockfile

# ============ 构建 UI-Kit ============
FROM base AS builder-ui-kit
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/ui-kit/node_modules ./packages/ui-kit/node_modules
COPY packages/ui-kit ./packages/ui-kit
COPY pnpm-workspace.yaml package.json ./
WORKDIR /app/packages/ui-kit
RUN pnpm build

# ============ 构建 web-germline ============
FROM base AS builder-germline
ARG BUILD_GERMLINE=true
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-germline/node_modules ./apps/web-germline/node_modules
COPY --from=builder-ui-kit /app/packages/ui-kit ./packages/ui-kit
COPY apps/web-germline ./apps/web-germline
COPY pnpm-workspace.yaml package.json ./
WORKDIR /app/apps/web-germline
RUN if [ "$BUILD_GERMLINE" = "true" ]; then \
      NEXT_TELEMETRY_DISABLED=1 pnpm build; \
    else \
      mkdir -p .next && echo "skipped" > .next/BUILD_SKIPPED; \
    fi

# ============ 构建 web-somatic ============
FROM base AS builder-somatic
ARG BUILD_SOMATIC=true
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-somatic/node_modules ./apps/web-somatic/node_modules
COPY --from=builder-ui-kit /app/packages/ui-kit ./packages/ui-kit
COPY apps/web-somatic ./apps/web-somatic
COPY pnpm-workspace.yaml package.json ./
WORKDIR /app/apps/web-somatic
RUN if [ "$BUILD_SOMATIC" = "true" ]; then \
      NEXT_TELEMETRY_DISABLED=1 pnpm build; \
    else \
      mkdir -p .next && echo "skipped" > .next/BUILD_SKIPPED; \
    fi

# ============ 运行时镜像 ============
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 部署配置参数
ARG DEPLOY_GERMLINE=true
ARG DEPLOY_SOMATIC=true
ARG GERMLINE_PORT=3001
ARG SOMATIC_PORT=3002

ENV DEPLOY_GERMLINE=$DEPLOY_GERMLINE
ENV DEPLOY_SOMATIC=$DEPLOY_SOMATIC
ENV GERMLINE_PORT=$GERMLINE_PORT
ENV SOMATIC_PORT=$SOMATIC_PORT

# 复制构建产物
COPY --from=builder-germline --chown=nextjs:nodejs /app/apps/web-germline/.next ./apps/web-germline/.next
COPY --from=builder-germline --chown=nextjs:nodejs /app/apps/web-germline/public ./apps/web-germline/public
COPY --from=builder-germline --chown=nextjs:nodejs /app/apps/web-germline/package.json ./apps/web-germline/

COPY --from=builder-somatic --chown=nextjs:nodejs /app/apps/web-somatic/.next ./apps/web-somatic/.next
COPY --from=builder-somatic --chown=nextjs:nodejs /app/apps/web-somatic/public ./apps/web-somatic/public
COPY --from=builder-somatic --chown=nextjs:nodejs /app/apps/web-somatic/package.json ./apps/web-somatic/

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web-germline/node_modules ./apps/web-germline/node_modules
COPY --from=deps /app/apps/web-somatic/node_modules ./apps/web-somatic/node_modules
COPY --from=builder-ui-kit /app/packages/ui-kit ./packages/ui-kit

COPY pnpm-workspace.yaml package.json ./

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

# 暴露端口
EXPOSE 3001 3002

ENTRYPOINT ["/docker-entrypoint.sh"]

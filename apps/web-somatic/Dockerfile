# ============ 构建阶段 ============
FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制 monorepo 配置和依赖锁文件
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 packages（共享依赖）
COPY packages/ ./packages/

# 复制 somatic 应用
COPY apps/web-somatic/ ./apps/web-somatic/

# 只安装 somatic 需要的依赖
WORKDIR /app/apps/web-somatic
RUN pnpm install --frozen-lockfile

# 构建 somatic 应用
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ============ 运行时阶段 ============
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-somatic/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-somatic/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-somatic/package.json ./

# 复制运行时所需的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-somatic/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# 设置后端 API 地址（可通过构建参数覆盖）
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 设置端口
ENV PORT=3000

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]

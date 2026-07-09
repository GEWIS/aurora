# build context: the monorepo root
FROM node:22 AS pruner
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm dlx turbo@2.9.18 prune @gewis/aurora-core --docker

FROM node:22 AS builder
ENV CI=true
WORKDIR /app
RUN corepack enable

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/full/ ./

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-api-client run sync
RUN pnpm --filter @gewis/aurora-api-client run build
RUN pnpm --filter @gewis/aurora-core run build
RUN pnpm --filter @gewis/aurora-core --prod deploy --legacy /prod

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /prod/package.json ./package.json
COPY --from=builder /app/apps/aurora-core/dist ./
COPY --from=builder /app/apps/aurora-core/public ./public
EXPOSE 3000
CMD ["node", "src/index.js"]

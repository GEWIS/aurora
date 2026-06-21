# build context: the output of `pnpm turbo prune @gewis/aurora-core --docker`
FROM node:22 AS builder
ENV CI=true
WORKDIR /app

COPY json/ ./
COPY full/ ./

RUN corepack enable
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-api-client run sync
RUN pnpm --filter @gewis/aurora-api-client run build
RUN pnpm --filter @gewis/aurora-core run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/aurora-core/dist ./apps/aurora-core/dist
COPY --from=builder /app/apps/aurora-core/build ./apps/aurora-core/build
COPY --from=builder /app/apps/aurora-core/public ./apps/aurora-core/public
COPY --from=builder /app/apps/aurora-core/package.json ./apps/aurora-core/package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "apps/aurora-core/dist/src/index.js"]

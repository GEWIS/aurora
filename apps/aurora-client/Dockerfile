# build context: the monorepo root
FROM node:22 AS pruner
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm dlx turbo@2.9.18 prune @gewis/aurora-client --docker

FROM node:22 AS builder
ENV CI=true
WORKDIR /app
RUN corepack enable

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/full/ ./

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-api-client run sync
RUN pnpm --filter @gewis/aurora-api-client run build
RUN pnpm --filter @gewis/aurora-client run build

FROM nginx:alpine
WORKDIR /usr/src/app

COPY apps/aurora-client/docker/nginx.conf /etc/nginx/nginx.conf
COPY apps/aurora-client/public /usr/src/app/public
COPY --from=builder /app/apps/aurora-client/dist /usr/src/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

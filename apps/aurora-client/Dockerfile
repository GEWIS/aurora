# build context: the output of `pnpm turbo prune @gewis/aurora-client --docker`
FROM node:22 AS builder
ENV CI=true
WORKDIR /app

COPY json/ ./
COPY full/ ./

RUN corepack enable
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-api-client run sync
RUN pnpm --filter @gewis/aurora-api-client run build
RUN pnpm --filter @gewis/aurora-client run build

FROM nginx:alpine
WORKDIR /usr/src/app

COPY full/apps/aurora-client/docker/nginx.conf /etc/nginx/nginx.conf
COPY full/apps/aurora-client/public /usr/src/app/public
COPY --from=builder /app/apps/aurora-client/dist /usr/src/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

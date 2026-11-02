# build context: the monorepo root

# NetBird CLI for the NetBird peers widget. Keep it on the same version as the
# NetBird daemon on the host, whose socket the CLI talks to.
ARG NETBIRD_VERSION=0.82.0
FROM netbirdio/netbird:${NETBIRD_VERSION} AS netbird

FROM node:22.23.4 AS pruner
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm dlx turbo@2.9.18 prune @gewis/aurora-core --docker

FROM node:22.23.4 AS builder
ENV CI=true
WORKDIR /app
RUN corepack enable

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/full/ ./

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-api-client run sync
RUN pnpm --filter @gewis/aurora-api-client run build
RUN pnpm --filter @gewis/aurora-core run build
# Install the musl variants of native packages (such as sharp), as the final image is Alpine
RUN pnpm --filter @gewis/aurora-core --prod deploy --legacy --libc musl /prod

FROM node:22.23.4-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /prod/package.json ./package.json
COPY --from=builder /app/apps/aurora-core/dist ./
COPY --from=builder /app/apps/aurora-core/public ./public
COPY --from=netbird /usr/local/bin/netbird /usr/local/bin/netbird
EXPOSE 3000
CMD ["node", "src/index.js"]

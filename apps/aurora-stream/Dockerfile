# ---- binaries: ffmpeg + yt-dlp + mediamtx, shared by dev target and prod build ----
FROM node:22-alpine AS binaries
ARG MEDIAMTX_VERSION=1.19.2
RUN apk add --no-cache ffmpeg python3 py3-pip curl \
  && pip install --break-system-packages --no-cache-dir yt-dlp \
  && curl -L "https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_linux_amd64.tar.gz" \
     | tar -xz -C /usr/local/bin mediamtx

# build context: the monorepo root
FROM node:22 AS pruner
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm dlx turbo@2.9.18 prune @gewis/aurora-stream --docker

FROM node:22 AS builder
ENV CI=true
WORKDIR /app
RUN corepack enable

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/full/ ./

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-stream run build
RUN pnpm --filter @gewis/aurora-stream --prod deploy --legacy /prod

# ---- runtime: prod final image ----
FROM binaries AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /prod/package.json ./package.json
COPY --from=builder /app/apps/aurora-stream/dist ./
COPY apps/aurora-stream/mediamtx.yml ./mediamtx.yml

EXPOSE 8889 8554 8189/udp 9000
CMD ["node", "src/index.js"]

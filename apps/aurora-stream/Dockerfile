# ---- binaries: ffmpeg + yt-dlp + mediamtx, shared by dev target and prod build ----
FROM node:22-alpine AS binaries
ARG MEDIAMTX_VERSION=1.19.2
RUN apk add --no-cache ffmpeg python3 py3-pip curl \
  && pip install --break-system-packages --no-cache-dir yt-dlp \
  && curl -L "https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_linux_amd64.tar.gz" \
     | tar -xz -C /usr/local/bin mediamtx \


# build context: the output of `pnpm turbo prune @gewis/aurora-stream --docker`
FROM node:22 AS builder
ENV CI=true
WORKDIR /app

COPY json/ ./
COPY full/ ./

RUN corepack enable
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @gewis/aurora-stream run build

# ---- runtime: prod final image ----
FROM binaries AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/aurora-stream/dist ./apps/aurora-stream/dist
COPY --from=builder /app/apps/aurora-stream/package.json ./apps/aurora-stream/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY full/apps/aurora-stream/mediamtx.yml ./apps/aurora-stream/mediamtx.yml

EXPOSE 8889 8554 8189/udp 9000
CMD ["node", "apps/aurora-stream/dist/src/index.js"]

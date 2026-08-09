# ---- binaries: ffmpeg + yt-dlp + mediamtx, shared by dev target and prod build ----
# Debian, not alpine: dev containers share one pnpm install over the bind-mounted repo,
# and pnpm resolves platform-gated optional deps (rollup, swc) per libc, so a musl
# container installs variants the other services and the host cannot load. Keeping prod
# on the same base also means ffmpeg runs against the libc it is tested with.
# trixie, not bookworm: bookworm ships ffmpeg 5.1, which predates -readrate_initial_burst.
FROM node:22-trixie-slim AS binaries
ARG MEDIAMTX_VERSION=1.19.2
ARG YTDLP_VERSION=
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && pip install --break-system-packages --no-cache-dir "yt-dlp${YTDLP_VERSION:+==$YTDLP_VERSION}" \
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

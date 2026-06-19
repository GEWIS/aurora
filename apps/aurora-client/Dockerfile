# Build in a different image to keep the target image clean
FROM node:22 AS build
WORKDIR /usr/src/app

# Copy client files
COPY ./ ./aurora-client

# Fetch files from Aurora Core
RUN git clone https://github.com/GEWIS/aurora-core.git
WORKDIR /usr/src/app/aurora-core
RUN corepack enable
RUN yarn
RUN yarn tsoa

WORKDIR /usr/src/app/aurora-client
RUN yarn
RUN yarn gen-client
RUN yarn build

# The target image that will be run
FROM nginx:alpine AS target
WORKDIR /usr/src/app
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./public /usr/src/app/public
COPY --from=build --chown=nginx /usr/src/app/aurora-client/dist/ /usr/src/app

# Aurora Client

This is the **narrowcasting client** of the Aurora suite — the subscriber used by _Screen_ entities.
After authenticating over HTTP, the client connects to the core using SocketIO to
listen for incoming commands and render posters, stage effects, and other content.
See the root [README](../README.md) for the full architecture overview and list of all Aurora repositories.

## Prerequisites

- NodeJS 22.

## Development setup

1. Copy `.env.example` to `.env` and fill in the environment variables.
1. Run `pnpm install` from the monorepo root.
1. Run `pnpm dev`.
1. The application is now running at http://localhost:8081.
   You can authenticate by visiting `http://localhost:8081/?key=KEY_HERE`.

The API client is automatically generated during `pnpm install` or `pnpm dev` (turbo runs the `sync` task).

## Deployment

Deployment is handled by Docker Compose from the monorepo root alongside Aurora Core.
The client can be built standalone with `pnpm docker-build` from this directory.

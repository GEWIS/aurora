<p align="center">
  <img src="https://raw.githubusercontent.com/GEWIS/aurora-backoffice/develop/public/layout/images/helmet-black.svg" alt="Aurora" width="120"/>
</p>

<h1 align="center">Aurora</h1>

<p align="center">
  <b>Software suite for DMX lighting, narrowcasting, and music integration</b>
</p>

<p align="center">
  <a href="https://github.com/GEWIS/aurora-core/blob/master/LICENSE"><img src="https://img.shields.io/github/license/GEWIS/aurora-core.svg" alt="License"></a>
  <a href="https://github.com/GEWIS/aurora-core/issues"><img src="https://img.shields.io/github/issues/GEWIS/aurora-core" alt="Issues"></a>
  <a href="https://github.com/GEWIS/aurora-core/commits/develop"><img src="https://img.shields.io/github/commit-activity/m/GEWIS/aurora-core" alt="Commit Activity"></a>
  <a href="https://github.com/GEWIS/aurora-core"><img src="https://img.shields.io/github/languages/code-size/GEWIS/aurora-core" alt="Code Size"></a>
</p>

---

## Overview

Aurora is the software suite that integrates and synchronizes DMX lighting, narrowcasting screens, and currently playing music — developed by and for [Study Association GEWIS](https://gewis.nl).

The system is built around a **publish-subscribe architecture**. The **core** serves as the central hub: it receives commands and state changes, and pushes them in real time to all connected subscribers over SocketIO WebSockets. End users control Aurora through the **backoffice** web interface, which communicates with the core over HTTP.

## Architecture

```
┌─────────────┐  HTTP   ┌──────────────┐  SocketIO    ┌─────────────────────┐
│  Backoffice │ ──────▶ │              │ ──────────▶  │ Narrowcasting Screen│
│  (web UI)   │         │  Aurora Core │              └─────────────────────┘
└─────────────┘         │              │  SocketIO    ┌─────────────────────┐
                        │  (publisher) │ ──────────▶  │  Audio Player       │
┌─────────────┐  HTTP   │              │              └─────────────────────┘
│ Beat        │ ──────▶ │              │  SocketIO    ┌─────────────────────┐
│ Detector    │         │              │ ──────────▶  │  DMX Lights Proxy   │
└─────────────┘         └──────────────┘              └─────────────────────┘
                                │
                             SocketIO
                                │
                        ┌───────▼────────┐
                        │ Lights         │
                        │ Simulator      │
                        └────────────────┘
```

All subscribers authenticate with an API key, then maintain a persistent SocketIO connection to receive real-time commands. Subscribers may additionally fetch data from the core over HTTP as needed.

## Repositories

| Repository                                                                  | Role                                                                                       | Tech                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------- |
| [aurora-core](https://github.com/GEWIS/aurora-core)                         | Central publisher — receives commands and pushes state to all subscribers                  | TypeScript, NodeJS, SocketIO |
| [aurora-backoffice](https://github.com/GEWIS/aurora-backoffice)             | Web management UI for humans to control Aurora                                             | TypeScript, React, SocketIO  |
| [aurora-client](https://github.com/GEWIS/aurora-client)                     | Narrowcasting screen client — displays posters and information on screens                  | TypeScript, NodeJS, SocketIO |
| [aurora-audio-player](https://github.com/GEWIS/aurora-audio-player)         | Audio subscriber — plays music as commanded by the core                                    | TypeScript, NodeJS           |
| [aurora-lights-proxy](https://github.com/GEWIS/aurora-lights-proxy)         | DMX controller bridge — forwards DMX packets from core to ArtNet hardware                  | Python, Art-Net              |
| [aurora-lights-simulator](https://github.com/GEWIS/aurora-lights-simulator) | Lights effect development tool — simulate DMX output without physical hardware             | TypeScript, NodeJS           |
| [aurora-beat-detector](https://github.com/GEWIS/aurora-beat-detector)       | Real-time beat detection — sends beat events to core so lights sync to music automatically | TypeScript, NodeJS           |

## Prerequisites

- **Node.js 22+** — [Download](https://nodejs.org/)
- **pnpm** — [Install](https://pnpm.io/installation) (enabled via `corepack enable` on Node.js 16.13+)
- **Git** — [Download](https://git-scm.com/)

## Quick Start

This repository contains the Aurora Core. For development setup of the core itself, see [apps/aurora-core/README.md](apps/aurora-core/README.md).

```bash
# Clone the repository
git clone https://github.com/GEWIS/aurora-core.git
cd aurora-core

# Install all dependencies (monorepo)
pnpm install

# Set up environment
cp apps/aurora-core/.env.example apps/aurora-core/.env

# Start developing
cd apps/aurora-core && pnpm dev
```

## Development with Docker Compose

The monorepo includes a one-command Docker Compose setup that runs the core, client (narrowcasting), and their dependencies together.

### Prerequisites

- **Docker** with Compose V2 (included in Docker Desktop / Docker Engine 25+)
- **Node.js 22+** with **pnpm** (for the dev scripts only)

### Quick start

```bash
# Start everything
pnpm dev-up
```

This will:

1. Start the **core** (`http://localhost:3000`) with a pre-seeded SQLite database (GEWIS data set)
2. Start the **client** (`http://localhost:8081`) with Vite dev server proxying API calls to the core
3. Wait for the core to be ready and the database seeded
4. Extract the first screen's API key from the database
5. Open `http://localhost:8081?key=<screen-key>` in your browser — you are authenticated as that screen

### Teardown

```bash
pnpm dev-down
```

Containers are removed but the `node_modules` volume is kept for fast restarts. To fully reset:

```bash
pnpm dev-down -v    # also removes cached node_modules
```

## External Integrations

Aurora Core integrates with several external services for extended functionality:

| Service                                                | Purpose                                              | Required Env      |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------- |
| [Spotify](https://developer.spotify.com/dashboard)     | Currently playing track display                      | `SPOTIFY_*`       |
| [Trello](https://developer.atlassian.com/cloud/trello) | Poster content management for narrowcasting          | `TRELLO_*`        |
| [NS](https://ns.nl)                                    | Train departure information on narrowcasting posters | `NS_API_KEY`      |
| [SudoSOS](https://github.com/GEWIS/sudosos-backend)    | Borrel (event) poster generation                     | `SUDOSOS_API_URL` |

## Integration API

If you want to integrate your own service with Aurora — to fetch data, send commands, or build a custom subscriber — see the [Integrations README](apps/aurora-core/src/modules/auth/integration/README.md) in the core for detailed documentation on authentication and the available endpoints.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`.
3. Make your changes.
4. Run tests: `pnpm --filter aurora-core test`.
5. Run linting: `pnpm --filter aurora-core lint-fix`.
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add your feature"`.
7. Push: `git push origin feat/your-feature-name`.
8. Open a Pull Request.

## License

Copyright © 2023-2025 Study Association GEWIS — Some rights reserved.

Aurora is licensed under the **GNU Affero General Public License v3.0 or later**. See the [LICENSE](LICENSE) file for details.

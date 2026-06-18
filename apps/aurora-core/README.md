# Aurora Core

This is the **core** of the Aurora suite — the central publisher that receives commands and pushes state to all subscribers in real time over SocketIO.
See the root [README](../README.md) for the full architecture overview and list of all Aurora repositories.

## Prerequisites

- NodeJS 22.

## Development setup

1. Copy `.env.example` to `.env` and fill in the environment variables.
1. Run `pnpm install`.
1. Run `pnpm dev`.
1. The application is now running at http://localhost:3000. The API documentation can be found at http://localhost:3000/api-docs.

To get started more easily, you can seed the database using `pnpm seed:gewis` or `pnpm seed:hubble`.
You can then find the API keys for all the subscribers in the `api_key` SQL table.

When running `pnpm dev`, authentication is handled automatically by using mock endpoints. It is not needed to set up anything for this.

### External integrations

Environment variables for Spotify, Trello, NS, GEWIS photos, and SudoSOS are documented in the root [README](../README.md).

### External services integrating with Aurora

To read more about how you can integrate your own services with Aurora (to fetch data or send commands),
visit the [README about Integrations](src/modules/auth/integration/README.md).

## Deployment

Aurora Core can be deployed by using Docker Compose. Note that this only includes the core, backoffice and narrowcasting client.
The audio player and DMX lights proxy need to be installed manually onto their destined systems, as those applications require an audio output and connected ARTnet controller respectively.

# Aurora Core

Aurora is the software suite that integrates and synchronizes DMX lighting, narrowcasting screens and currently playing music.
The system is designed around a publish-subscribe architecture, where executing clients connect to the core using SocketIO Websockets.
End users can send commands to Aurora by using HTTP (in the backoffice).

This repository is the publisher or "core" of the system. All other applications connect to this central hub.
The other repositories can be found here:

- [Aurora Backoffice](https://github.com/gewis/aurora-backoffice), used by humans to control the behaviour of Aurora.
- [Aurora Narrowcasting Client](https://github.com/gewis/aurora-client), the subscriber for screens.
- [Aurora Audio Player](https://github.com/gewis/aurora-lights-proxy), the subscriber for audio players.
- [Aurora DMX Lights Proxy](https://github.com/gewis/aurora-audio-player), the subscriber for DMX controllers.
- [Aurora Lights Simulator](https://github.com/GEWIS/aurora-lights-simulator), to develop lights effects without
  having access to physical hardware.
- [Aurora Real Time Beat Detector](https://github.com/GEWIS/aurora-beat-detector), if you want lights effects
  to play on the beat of the music without having to set the tempo yourself (manually).

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

### Integration with external services

To fully utilize all functionality of Aurora, some extra environment variables are required:

- To use Spotify integration, create an app in the [Spotify Developer dashboard](https://developer.spotify.com/dashboard).
- To use the narrowcasting poster screen, create a Trello board and have a [Trello API Key and Token](https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#passing-token-and-key-in-api-requests).
- To use the "train departures" poster on the narrowcasting poster screen, you need an [NS](https://ns.nl) key.
- To use GEWIS photos on the narrowcasting poster screen, you need an internal GEWIS website token.
- To use SudoSOS borrel posters, you need at least a [SudoSOS API key](https://github.com/GEWIS/sudosos-backend).

### External services integrating with Aurora

To read more about how you can integrate your own services with Aurora (to fetch data or send commands),
visit the [README about Integrations](src/modules/auth/integration/README.md).

## Deployment

Aurora can easily be deployed by using Docker Compose. Note that this only includes the core, backoffice and narrowcasting client.
The audio player and DMX lights proxy need to be installed manually onto their destined systems, as those applications require an audio output and connected ARTnet controller respectively.

## Copyright

Copyright © 2023-2025 Study Association GEWIS - Some rights reserved.
You can use our software freely within the limits of our license.
However, we worked very hard on this project and invested a lot of time in it
so we ask you to leave our copyright marks in place when modifying our software.
Of course, you are free to add your own.

## License

Aurora uses the AGPL-3.0 license.

# Aurora Client
This repository contains the narrowcasting application of the Aurora software suite.
It is the subscriber that is used by _Screen_ entities.
After authenticating using HTTP, the client will connect to the core using SocketIO
to listen for incoming commands. It will then execute these commands accordingly.
However, if extra information is needed (for example to render a certain poster),
the client can make HTTP calls to the core to request this data.

## Prerequisites
- NodeJS 22.
- A locally running copy of [aurora-core](https://github.com/gewis/narrowcasting-core).
  The client repository should be cloned next to the core repository, so in the folder `../aurora-core`.
  This is necessary to generate the required API client files (installation step 2).

## Installation
1. Run `yarn install`.
2. Run `yarn gen-client` to generate the Typescript files required to communicate with the core.
3. Run `yarn dev`.
4. The application should now be running at http://localhost:8081.
You can authenticate a screen on the client by going to the URL https://localhost:8081/?key=KEY_HERE.

## Deployment
Deployment is done using Docker-compose in the core repository.
This should work out of the box if you meet the prerequisites.

## Copyright
Copyright © 2023-2026 Study Association GEWIS - Some rights reserved.
You can use our software freely within the limits of our license.
However, we worked very hard on this project and invested a lot of time in it
so we ask you to leave our copyright marks in place when modifying our software.
Of course, you are free to add your own.

## License
Aurora uses the [AGPL-3.0 license](LICENSE).

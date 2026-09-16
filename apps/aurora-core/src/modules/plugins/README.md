# Capabilities

A **mode** — Centurion, time trail racing — takes over some lights, screens and audio for a
while. It is given the things it is allowed to do, one object per capability, and it never
looks anything up for itself.

```ts
@injectable()
export default class CenturionMode extends BaseMode {
  constructor(
    session: ModeSession,
    private readonly lightsControl: LightsControl,
    private readonly audioControl: AudioControl,
    private readonly screenChannel: ScreenChannel<CenturionScreenEvents>,
    private readonly beatSource: BeatSource,
  ) {
    super(session);
  }
}
```

Nothing constructs those arguments by hand. `mode-controller.ts` decides what this mode may
use, and the mode receives it.

## Why not just import what you need?

A mode could call `HandlerManager.getInstance()` and find its own collaborators — that is
how this code used to work. Two problems.

**You cannot test it.** Reaching for a global means a test has to build the whole world:
a database, a socket server, every handler. Taking `LightsControl` as an argument means a
test passes a fake.

**Everything can reach everything.** If a mode can call `getInstance()` then it can touch
any part of Aurora, and there is no way to say what a mode is allowed to do. Being _given_
its capabilities makes that list explicit — it is the argument list.

## How a mode gets its capabilities

In `mode-controller.ts`:

```ts
// 1. find the handlers that will drive these devices
const lightsHandler = this.handlerManager.requireHandler(LightsGroup, SetEffectsHandler);

// 2. claim the devices for this mode, remembering where they came from
const session = new ModeSession(this.handlerManager, [
  { entities: lights, handler: lightsHandler },
  ...
]);
session.claim();

// 3. a container holding exactly what this mode may use
const scope = new Container({ parent: container });
scope.bind(ModeSession).toConstantValue(session);
registerPort(scope, LightsControl, lightsHandler);
...

// 4. build the mode from it
const centurionMode = scope.get(CenturionMode);
```

`scope.get` reads the constructor, sees it wants a `LightsControl`, and hands over what
was registered under that name. Step 3 is the interesting one: **what is registered is
exactly what the mode can ask for.** Ask for something that was not registered and it fails
immediately, rather than silently reaching a global.

A _child_ container is used because these are per-run. There is one `HandlerManager` for the
whole process, but this session and these screens belong to one activation of one mode.

## Adding a capability

1. Write the port in `ports/` — an abstract class with only method signatures, no code.
2. Have whatever already does the work declare `implements YourPort`. Usually a handler
   already has the methods; do not write a class that only forwards calls.
3. Register it in `mode-controller.ts` for the modes allowed to use it.
4. Add the constructor argument to those modes.

Ports are abstract classes rather than interfaces so they exist at runtime and can be used
as the name to register under. Keep them free of implementation: a port with code in it is
host behaviour that every mode inherits without asking.

`registerPort` in `src/ioc.ts` exists because inversify expects identifiers to be concrete classes; it
holds the one cast that needs, so it is not repeated.

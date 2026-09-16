# Aurora Core

Aurora drives the physical output of a venue — lights, screens and audio — from a single
backend. Its domain is the _platform_: the devices it can address, the things that can take
control of them, and the events they react to. What any particular show or game does with
that control is not Aurora's domain.

## Language

### Devices

**Subscribe Entity**:
Anything Aurora can address and hand to a handler: a lights group, a screen, or an audio
output. Every one remembers which handler currently owns it.
_Avoid_: device, target, listener

**Lights Group**:
A set of light fixtures addressed together as one unit. The smallest thing a lights handler
claims.
_Avoid_: light, lamp, group of lights

**Fixture**:
One physical lighting instrument within a group — a par, a moving head RGB, or a moving
head wheel. Carries its own DMX channels.
_Avoid_: light, lamp, device

**Lights Controller**:
The physical DMX controller a lights group is wired to.
_Avoid_: controller (unqualified — that means an HTTP controller; always say "lights
controller" for the device)

**Lights Switch**:
A DMX channel that powers a lights controller on or off, so unused rigs can be cut.
_Avoid_: relay, power switch

**Screen**:
A display surface Aurora pushes content to over a socket connection.
_Avoid_: monitor, display, infoscreen

**Audio**:
An audio output Aurora can play through.
_Avoid_: speaker, sound, channel

### Control

**Handler**:
A long-lived object that claims subscribe entities of one kind and drives them, reacting to
a tick and to the beat stream. Exactly one handler owns an entity at a time.
_Avoid_: service, driver, manager, controller

**Mode**:
A temporary takeover of a set of lights, screens and audio for a coordinated show, which
returns them to their previous handlers when it ends. Centurion is one.
_Avoid_: show, scene, game, program

**Mode Session**:
The claim a running mode holds on a set of devices: which it took, which handler each was
on beforehand, and the promise to give them back when the mode ends.
_Avoid_: mode state, mode context, claim

**Capability**:
Something the host lets a mode do — change light effects, play audio, contribute beats —
expressed as a port the mode is handed. A mode names the capability it needs, never the
handler that provides it.
_Avoid_: service, API, interface

**Lights Effect**:
A unit of light behaviour — colour or movement — evaluated each tick to produce DMX values.
Composed; several run on one group at once.
_Avoid_: animation, pattern, preset

**Scene**:
A saved, named set of effects that can be applied to lights on demand.
_Avoid_: preset, snapshot, cue

**Mix Tape**:
A scripted timeline of songs, horns and effect changes that a mode plays through.
_Avoid_: playlist, track list, script

### Events

**Beat**:
A single detected or generated musical beat, published to every handler so light and screen
behaviour can follow the music.
_Avoid_: pulse, tick, BPM event

**Tick**:
The fixed-frequency loop in which lights handlers recompute DMX output. Independent of the
beat stream.
_Avoid_: frame, loop, refresh

**Feature Flag**:
A server setting that switches an endpoint or handler off at runtime.
_Avoid_: toggle, setting (a setting is the stored value; the flag is the gate)

## Ownership

- A subscribe entity is owned by at most one handler at a time. Registering it with a new
  handler removes it from the old one, and the assignment is persisted so it survives a
  restart.
- Claiming remembers which handler each entity was on and gives it back when the mode ends.
  Entities that were on no handler stay unassigned.
- Handlers are created once at start-up and live for the process; modes come and go.
- Effects belong to a handler, not to a mode. A mode asks for effects to change; it does not
  own the ones that result.
- A mode session owns claiming and releasing. A mode receives capabilities and the devices
  already claimed for it; it does not assign entities to handlers itself.
- Capabilities are ports the host implements over its handlers. Adding one is a decision
  about what a mode is allowed to do, not a refactor.
- A port stays purely abstract: no implemented methods, no state, no shared helpers. It is
  an abstract class only so it can serve as its own injection key — put behaviour in it and
  every mode inherits host internals it never asked for.
- The handler that satisfies a capability declares it with `implements`. A separate class
  that only forwards calls is not an adapter, it is a rename; write one when the port and
  the handler genuinely differ.

## Naming collisions to watch

- **Controller** means an HTTP controller in `*-controller.ts`, and a physical DMX device in
  `entities/lights-controller.ts`. The entity is always "lights controller".
- **Handler** in Aurora is a stateful, long-lived device driver. It is not a request handler
  and not an application service.

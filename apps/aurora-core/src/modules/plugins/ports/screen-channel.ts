/**
 * Sending events to the screens a mode has claimed.
 */
export default abstract class ScreenChannel<Events = Record<string, unknown>> {
  abstract emit<Name extends keyof Events & string>(event: Name, payload?: Events[Name]): void;
}

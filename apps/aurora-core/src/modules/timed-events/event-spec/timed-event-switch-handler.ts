interface SwitchHandlerParams {
  id: number;
  handler: string;
}

export type TimedEventSwitchHandlerAudio = {
  type: 'switch-handler-audio';
  params: SwitchHandlerParams;
};

export type TimedEventSwitchHandlerLights = {
  type: 'switch-handler-lights';
  params: SwitchHandlerParams;
};

export type TimedEventSwitchHandlerScreen = {
  type: 'switch-handler-screen';
  params: SwitchHandlerParams;
};

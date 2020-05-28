import * as Crypto from "crypto";

export type Message = { text: string };

export type MessageResponse = Message & { id: string; timestamp: string };

export type State = { last?: MessageResponse; messages: MessageResponse[] };

export const execute = (state: State, message: Message): State => {
  if (message.text.length === 0) {
    throw Error("Text should not be empty");
  }

  const current: MessageResponse = {
    ...message,
    id: Crypto.randomBytes(16).toString("hex"),
    timestamp: new Date().toISOString(),
  };

  return {
    last: current,
    messages: [...state.messages, current],
  };
};

export const revert = (state: State, id: string): State => {
  const current = state.messages.filter((message) => message.id !== id);

  return {
    last: current[current.length - 1],
    messages: current,
  };
};

export const initialState: State = { last: undefined, messages: [] };

export const sendMessages = (messages: Message[]): State[] => {
  const [succeeded, failed]: State[][] = [[], []];

  try {
    messages.forEach((message: Message) => {
      succeeded.push(
        execute(succeeded[succeeded.length] || initialState, message)
      );
    });
    return succeeded;
  } catch (error) {
    succeeded.reverse().forEach((state: State) => {
      failed.push(state);
      revert(state, state.last!.id);
    });
    return failed;
  }
};

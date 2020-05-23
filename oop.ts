import * as Crypto from "crypto";

export interface Message {
  text: string;
}

export interface MessageResponse extends Message {
  id: string;
  timestamp: string;
}

export interface MessageDatabase {
  create(message: Message): MessageResponse;
  remove(id: string): void;
  read(): MessageResponse[];
}

export class InMemoryMessageDatabase implements MessageDatabase {
  constructor(private messages: MessageResponse[] = []) {}

  create(message: Message): MessageResponse {
    if (message.text.length === 0) {
      throw Error("Text should not be empty");
    }
    const index = this.messages.push({
      ...message,
      id: Crypto.randomBytes(16).toString("hex"),
      timestamp: new Date().toISOString(),
    });

    return this.messages[index - 1];
  }

  remove(id: string): void {
    this.messages = this.messages.filter((message) => {
      return message.id !== id;
    });
  }

  read(): MessageResponse[] {
    return this.messages;
  }
}

export interface Command {
  execute(): void;
  undo(): void;
}

export class SendMessage implements Command {
  private messageResponse?: MessageResponse;

  constructor(private message: Message, private database: MessageDatabase) {}

  execute(): void {
    this.messageResponse = this.database.create(this.message);
  }

  undo(): void {
    if (this.messageResponse !== undefined) {
      this.database.remove(this.messageResponse.id);
    }
  }
}

export class MessageDispatcher {
  private history: Command[] = [];

  dispatch(command: Command): void {
    this.history.push(command);
  }

  getHistory(): readonly Command[] {
    const [succeeded, failed]: Command[][] = [[], []];

    try {
      this.history.forEach((command: Command) => {
        command.execute();
        succeeded.push(command);
      });

      return succeeded;
    } catch (error) {
      succeeded.reverse().forEach((command: Command) => {
        command.undo();
        failed.push(command);
      });
      return failed;
    }
  }
}

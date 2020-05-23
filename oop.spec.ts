import {
  MessageDatabase,
  InMemoryMessageDatabase,
  Command,
  SendMessage,
  MessageDispatcher,
} from "./oop";

test("Creating message with empty text throws error", () => {
  expect.assertions(1);

  const database: MessageDatabase = new InMemoryMessageDatabase();

  try {
    database.create({ text: "" });
  } catch (error) {
    expect(error.message).toStrictEqual("Text should not be empty");
  }
});

test("Undo command that failed", () => {
  expect.hasAssertions();

  const database: MessageDatabase = new InMemoryMessageDatabase();

  const sendA: Command = new SendMessage({ text: "A" }, database);
  const sendEmpty: Command = new SendMessage({ text: "" }, database);

  try {
    sendA.execute();
    sendEmpty.execute();
  } catch (error) {
    expect(error.message).toStrictEqual("Text should not be empty");
    expect(database.read()).toHaveLength(1);

    sendA.undo();
    expect(database.read()).toHaveLength(0);
  }
});

test("Trying to remove command not executed does nothing", () => {
  const database: MessageDatabase = new InMemoryMessageDatabase();

  new SendMessage({ text: "A" }, database).execute();
  new SendMessage({ text: "B" }, database).undo();

  expect(database.read()).toHaveLength(1);
});

test("Sending two commands successfully", () => {
  const database: MessageDatabase = new InMemoryMessageDatabase();

  new SendMessage({ text: "A" }, database).execute();
  new SendMessage({ text: "B" }, database).execute();

  expect(database.read()).toHaveLength(2);
  expect(database.read()[0].text).toStrictEqual("A");
  expect(database.read()[1].text).toStrictEqual("B");
});

test("Undo every command sent in case of failure", () => {
  const database: MessageDatabase = new InMemoryMessageDatabase();
  const dispatcher = new MessageDispatcher();
  dispatcher.dispatch(new SendMessage({ text: "A" }, database));
  dispatcher.dispatch(new SendMessage({ text: "B" }, database));
  dispatcher.dispatch(new SendMessage({ text: "" }, database));
  dispatcher.dispatch(new SendMessage({ text: "C" }, database));

  const history = dispatcher.getHistory();

  expect(history).toHaveLength(2);
  expect(database.read()).toHaveLength(0);
});

test("Sending all commands and inspecting history", () => {
  const database: MessageDatabase = new InMemoryMessageDatabase();
  const dispatcher = new MessageDispatcher();
  dispatcher.dispatch(new SendMessage({ text: "A" }, database));
  dispatcher.dispatch(new SendMessage({ text: "B" }, database));
  dispatcher.dispatch(new SendMessage({ text: "C" }, database));

  const history = dispatcher.getHistory();

  expect(history).toHaveLength(3);
  expect(database.read()).toHaveLength(3);
  expect(database.read()[0].text).toStrictEqual("A");
  expect(database.read()[1].text).toStrictEqual("B");
  expect(database.read()[2].text).toStrictEqual("C");
});

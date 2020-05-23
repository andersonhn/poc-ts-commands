import { execute, initialState, State, undo, sendMessages } from "./fp";

test("Creating message with empty text throws error", () => {
  expect.assertions(1);

  try {
    execute(initialState, { text: "" });
  } catch (error) {
    expect(error.message).toStrictEqual("Text should not be empty");
  }
});

test("Undo command that failed", () => {
  expect.hasAssertions();

  const history: State[] = [];

  try {
    const stateA = execute(initialState, { text: "A" });
    history.push(stateA);

    execute(stateA, { text: "" });
  } catch (error) {
    expect(error.message).toStrictEqual("Text should not be empty");
    expect(history).toHaveLength(1);

    const state = undo(history[0], history[0].last!.id);
    expect(state).toStrictEqual(initialState);
  }
});

test("Trying to remove command not executed does nothing", () => {
  const state: State = undo(execute(initialState, { text: "A" }), "123");

  expect(state.messages).toHaveLength(1);
  expect(state.last!.text).toStrictEqual("A");
  expect(state.last!.id).not.toStrictEqual("123");
});

test("Sending two commands successfully", () => {
  const state = execute(execute(initialState, { text: "A" }), { text: "B" });

  expect(state.messages).toHaveLength(2);
  expect(state.last!.text).toStrictEqual("B");
});

test("Undo every command sent in case of failure", () => {
  const history: State[] = sendMessages([
    { text: "A" },
    { text: "B" },
    { text: "" },
    { text: "C" },
  ]);

  expect(history).toHaveLength(2);
  expect(history[0].last!.text).toStrictEqual("B");
  expect(history[1].last!.text).toStrictEqual("A");
});

test("Sending all commands and inspecting history", () => {
  const history: State[] = sendMessages([
    { text: "A" },
    { text: "B" },
    { text: "C" },
  ]);

  expect(history).toHaveLength(3);
  expect(history[0].last!.text).toStrictEqual("A");
  expect(history[1].last!.text).toStrictEqual("B");
  expect(history[2].last!.text).toStrictEqual("C");
});

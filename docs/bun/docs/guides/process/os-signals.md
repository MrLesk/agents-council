# Listen to OS signals

Bun supports the Node.js `process` global, including the `process.on()` method for listening to OS signals.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.on("SIGINT", () => {
  console.log("Received SIGINT");
});
```

***

If you don't know which signal to listen for, you listen to the [`"beforeExit"`](https://nodejs.org/api/process.html#event-beforeexit) and [`"exit"`](https://nodejs.org/api/process.html#event-exit) events.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.on("beforeExit", code => {
  console.log(`Event loop is empty!`);
});

process.on("exit", code => {
  console.log(`Process is exiting with code ${code}`);
});
```

***

See [Docs > API > Utils](/runtime/utils) for more useful utilities.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://bun.com/docs/llms.txt
# Listen for CTRL+C

The `ctrl+c` shortcut sends an *interrupt signal* to the running process. This signal can be intercepted by listening for the `SIGINT` event. If you want to close the process, you must explicitly call `process.exit()`.

```ts process.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  process.exit();
});
```

***

See [Docs > API > Utils](/runtime/utils) for more useful utilities.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://bun.com/docs/llms.txt
import { BrowserWindow } from "electrobun/bun";

const DEFAULT_WINDOW_SIZE = {
  x: 80,
  y: 80,
  width: 1280,
  height: 820,
};

function openCouncilWindow(): BrowserWindow {
  return new BrowserWindow({
    title: "Agents Council",
    url: "views://council/index.html",
    frame: DEFAULT_WINDOW_SIZE,
  });
}

openCouncilWindow();

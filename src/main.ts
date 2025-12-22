import styles from "./styles.css?inline";

import { $ } from "./framework/anu";

const LED_STRIP_ID = "led_strip";

// favicon
const favicon = document.querySelector("link[rel=icon]") as HTMLLinkElement;
if (favicon) {
  favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐨</text></svg>`;
}

// viewport
const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1, user-scalable=no";
document.head.appendChild(meta);

// styles
const style = document.createElement("style");
style.textContent = styles;
document.head.appendChild(style);

// app

interface AppState {
  connected: boolean;
  on: boolean;
  brightness: number;
  percent: number;
  saved: boolean;

  toggle(e: Event): void;
  bright_input(e: Event): void;
  bright_change(e: Event): void;
  save(e: Event): void;

  render(): void;
}

const svg = {
  checkmark: `<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`,
  save: `<svg viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>`,
};

// @minify-template-start
const view = (s: AppState) => `
<header><h1>DIMLED MINI</h1></header>
<main>
  <div class="card">
    <div class="card__header">
      <h2 class="card__title">Light Strip</h2>
      <div class="status ${s.connected ? "connected" : ""}"></div>
    </div>
    <form>
      <div class="row">
        <label>Power</label>
        <label class="toggle">
          <input
            type="checkbox"
            ${s.on ? "checked" : ""}
            ${s.connected ? "" : "disabled"}
            data-change="toggle"
          />
          <span class="toggle__slider"
            ${s.connected ? "" : "disabled"}
          ></span>
        </label>
      </div>
      <div class="row">
        <label>Brightness</label>
        <span
          id="brightness-value"
          style="font-weight:bold;color:var(--primary)"
          ${s.connected ? "" : "disabled"}
        >
          ${s.percent}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="255"
        value="${s.brightness}"
        style="--percent:${s.percent}%"
        ${s.connected ? "" : "disabled"}
        data-input="bright_input"
        data-change="bright_change"
      />
      <button
        class="btn"
        ${s.connected || s.saved ? "" : "disabled"}
        data-click="save"
      >
        ${s.saved ? `${svg.checkmark} Saved` : `${svg.save} Save State`}
      </button>
    </form>
  </div>
</main>
<footer>
  <span>
    Made with ❤️ by
    <a href="https://github.com/tqlabs-in">TQLABS</a><sup>🇮🇳</sup>
  </span>
</footer>
`;
// @minify-template-end

const app = $("body", view, {
  connected: false,
  on: false,
  brightness: 0,
  percent: 0,
  saved: false,

  toggle(e) {
    const el = e.target as HTMLInputElement;
    this.on = el.checked;
    fetch(`/light/${LED_STRIP_ID}/turn_${this.on ? "on" : "off"}`, {
      method: "POST",
    });
  },

  bright_input(e) {
    const el = e.target as HTMLInputElement;
    const v = el.valueAsNumber;

    this.percent = Math.round((v / 255) * 100);

    el.style.setProperty("--percent", `${app.percent}%`);
    document.getElementById(
      "brightness-value"
    )!.textContent = `${app.percent}%`;
  },

  bright_change(e) {
    const el = e.target as HTMLInputElement;
    fetch(`/light/${LED_STRIP_ID}/turn_on?brightness=${el.value}`, {
      method: "POST",
    });
  },

  save(e) {
    e.preventDefault();

    fetch("/button/save_state/press", { method: "POST" }).then((res) => {
      if (!res.ok) return;

      this.saved = true;
      this.render();

      setTimeout(() => {
        this.saved = false;
        this.render();
      }, 1500);
    });
  },

  // injected at runtime
  render: undefined as unknown as () => void,
});

// server events

let lastUpdated = 0;

const source = new EventSource("/events");

source.addEventListener("open", () => {
  lastUpdated = Date.now();
  app.connected = true;
  app.render();
});

source.addEventListener("error", () => {
  app.connected = false;
  app.render();
});

source.addEventListener("ping", (e) => {
  lastUpdated = Date.now();

  if (!e.data) return;
  const config = JSON.parse(e.data);
  if (config.title) document.title = config.title;
});

source.addEventListener("state", (e) => {
  lastUpdated = Date.now();
  const data = JSON.parse(e.data);

  if (data.id === `light-${LED_STRIP_ID}`) {
    if (data.state) app.on = data.state === "ON";
    if (data.brightness != null) {
      app.brightness = data.brightness;
      app.percent = Math.round((data.brightness / 255) * 100);
    }
    app.render();
  }
});

setInterval(() => {
  const connected = Date.now() - lastUpdated < 15000;
  if (connected !== app.connected) {
    app.connected = connected;
    app.render();
  }
}, 5000);

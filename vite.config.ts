import { devices } from "playwright";
import { defineConfig } from "vite";
import constants from "./constants.json" with { type: "json" };

export default defineConfig(() => {
  const { DEVICE_NAME, HOST, PORT } = constants;
  const additionalConstants: Record<string, string> = {
    VIEWPORT_WIDTH: `${devices[DEVICE_NAME]?.viewport.width ?? 0}`,
    VIEWPORT_HEIGHT: `${devices[DEVICE_NAME]?.viewport.height ?? 0}`,
  };

  return {
    server: {
      host: HOST,
      port: PORT,
    },
    preview: {
      host: HOST,
      port: PORT,
    },
    build: {
      rollupOptions: {
        input: [
          "after-applying.en.html",
          "before-applying.en.html",
          "after-applying.ja.html",
          "before-applying.ja.html",
        ],
      },
    },
    plugins: [
      {
        name: "html-transform",
        transformIndexHtml: (html) =>
          Object.entries({ ...constants, ...additionalConstants }).reduce(
            (html, [placeholder, value]) =>
              html.replaceAll(`__${placeholder}__`, `${value}`),
            html,
          ),
      },
    ],
  };
});

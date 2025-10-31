import type { Browser, devices } from "playwright";
import constants from "../../constants.json" with { type: "json" };

export type Flow = {
  execute: (context: {
    browser: Browser;
    devices: typeof devices;
    artifactName: string;
    constants: typeof constants;
  }) => Promise<void>;
};

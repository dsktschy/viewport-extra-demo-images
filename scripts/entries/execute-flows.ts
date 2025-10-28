import path from "node:path";
import { chromium, devices } from "playwright";
import constants from "../../constants.json" with { type: "json" };
import type { Flow } from "../internal/Flow.ts";

const { FLOW_META_LIST, FLOWS_DIRECTORY } = constants;
const browser = await chromium.launch();
await Promise.all(
  FLOW_META_LIST.flatMap((flowMeta) => {
    const flowPath = `./${path.relative(import.meta.dirname, `${FLOWS_DIRECTORY}${flowMeta.name}.ts`)}`;
    return flowMeta.artifactStemList.map((artifactStem) =>
      (import(flowPath) as Promise<Flow>).then(({ execute }) =>
        execute({
          browser,
          devices,
          artifactName: `${flowMeta.name}/${artifactStem}`,
          constants,
        }),
      ),
    );
  }),
);
await browser.close();
